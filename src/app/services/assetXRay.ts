import { getAlphaMindConfig } from './alphamindConfig';

export interface AssetXRayReport {
  symbol: string;
  name: string;
  market: string;
  sector: string;
  price: string;
  change: string;
  changeValue: number;
  marketCap: string;
  radar: Array<{ subject: string; value: number }>;
  sentiment: number;
  sentimentLabel: string;
  conclusion: string;
  probabilities: {
    up: number;
    flat: number;
    down: number;
  };
  metrics: Array<{ label: string; value: string; hint: string }>;
  catalysts: string[];
  providerMeta: {
    mode: 'mock' | 'quantdinger';
    source: string;
    status: 'ok' | 'fallback';
    message?: string;
    raw?: unknown;
  };
}

export interface AssetXRayRequest {
  symbol: string;
  market?: string;
}

interface QuantDingerEnvelope<T = unknown> {
  code?: number;
  msg?: string;
  message?: string;
  data?: T;
}

interface KlinePoint {
  time?: number | string;
  timestamp?: number | string;
  open?: number | string;
  high?: number | string;
  low?: number | string;
  close?: number | string;
  volume?: number | string;
}

const COMPANY_META: Record<string, Pick<AssetXRayReport, 'name' | 'sector' | 'marketCap'>> = {
  TSLA: {
    name: 'Tesla Inc.',
    sector: '智能电动车 / 能源',
    marketCap: '$565.1B',
  },
  NVDA: {
    name: 'NVIDIA Corp.',
    sector: 'AI 芯片 / 数据中心',
    marketCap: '$2.27T',
  },
  AAPL: {
    name: 'Apple Inc.',
    sector: '消费电子 / 服务',
    marketCap: '$2.91T',
  },
};

export const MOCK_ASSET_REPORTS: AssetXRayReport[] = [
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    market: 'NASDAQ',
    sector: '智能电动车 / 能源',
    price: '$177.42',
    change: '+2.84%',
    changeValue: 2.84,
    marketCap: '$565.1B',
    radar: [
      { subject: '估值', value: 42 },
      { subject: '成长性', value: 86 },
      { subject: '盈利', value: 68 },
      { subject: '情绪', value: 74 },
      { subject: '动量', value: 79 },
      { subject: '安全边际', value: 46 },
    ],
    sentiment: 72,
    sentimentLabel: '偏贪婪',
    conclusion:
      'TSLA 当前估值仍处于偏高区间，但短期动量和新闻情绪显著改善。AI 建议以持有观察为主，若价格回落至关键均线附近，可分批评估加仓机会。',
    probabilities: { up: 54, flat: 27, down: 19 },
    metrics: [
      { label: 'AI 综合评分', value: '72', hint: '强于同业均值' },
      { label: '波动风险', value: '高', hint: '仓位需受控' },
      { label: '预测置信度', value: '68%', hint: '中等偏高' },
    ],
    catalysts: ['交付增速修复', '储能业务毛利改善', 'FSD 商业化预期升温'],
    providerMeta: {
      mode: 'mock',
      source: 'AlphaMind mock provider',
      status: 'ok',
    },
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    market: 'NASDAQ',
    sector: 'AI 芯片 / 数据中心',
    price: '$924.79',
    change: '+1.36%',
    changeValue: 1.36,
    marketCap: '$2.27T',
    radar: [
      { subject: '估值', value: 48 },
      { subject: '成长性', value: 94 },
      { subject: '盈利', value: 91 },
      { subject: '情绪', value: 84 },
      { subject: '动量', value: 88 },
      { subject: '安全边际', value: 52 },
    ],
    sentiment: 81,
    sentimentLabel: '贪婪',
    conclusion:
      'NVDA 基本面质量强劲，盈利能力和成长性仍然领先，但市场预期已经较充分。AI 判断中期趋势仍偏强，短线更适合等待波动释放后的确认信号。',
    probabilities: { up: 61, flat: 24, down: 15 },
    metrics: [
      { label: 'AI 综合评分', value: '82', hint: '行业领先' },
      { label: '波动风险', value: '中高', hint: '留意估值回撤' },
      { label: '预测置信度', value: '73%', hint: '高于均值' },
    ],
    catalysts: ['数据中心订单强劲', 'AI 训练需求扩张', '供应链议价能力提升'],
    providerMeta: {
      mode: 'mock',
      source: 'AlphaMind mock provider',
      status: 'ok',
    },
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    market: 'NASDAQ',
    sector: '消费电子 / 服务',
    price: '$189.98',
    change: '-0.42%',
    changeValue: -0.42,
    marketCap: '$2.91T',
    radar: [
      { subject: '估值', value: 58 },
      { subject: '成长性', value: 62 },
      { subject: '盈利', value: 88 },
      { subject: '情绪', value: 57 },
      { subject: '动量', value: 51 },
      { subject: '安全边际', value: 64 },
    ],
    sentiment: 54,
    sentimentLabel: '中性',
    conclusion:
      'AAPL 盈利质量与现金流稳定，但短期缺少足够强的增长催化。AI 建议维持中性观察，重点等待新品周期与服务收入增速重新抬升。',
    probabilities: { up: 34, flat: 43, down: 23 },
    metrics: [
      { label: 'AI 综合评分', value: '66', hint: '稳健但不激进' },
      { label: '波动风险', value: '中', hint: '防御属性较强' },
      { label: '预测置信度', value: '64%', hint: '中等' },
    ],
    catalysts: ['服务业务韧性', '新品周期预期', '回购支撑 EPS'],
    providerMeta: {
      mode: 'mock',
      source: 'AlphaMind mock provider',
      status: 'ok',
    },
  },
];

export const SUPPORTED_ASSET_SYMBOLS = MOCK_ASSET_REPORTS.map((report) => report.symbol);

export function normalizeAssetSymbol(input: string) {
  const normalized = input.trim().toUpperCase();
  const byName = MOCK_ASSET_REPORTS.find((item) => item.name.toUpperCase().includes(normalized));
  return byName?.symbol ?? (normalized.replace(/[^A-Z0-9./-]/g, '') || 'TSLA');
}

export function getMockAssetXRayReport(symbol: string, message?: string): AssetXRayReport {
  const normalized = normalizeAssetSymbol(symbol);
  const matchedReport = MOCK_ASSET_REPORTS.find((item) => item.symbol === normalized);
  const report = matchedReport ?? MOCK_ASSET_REPORTS[0];
  const unsupportedMessage = matchedReport
    ? message
    : `暂无 ${normalized} 的本地样例，已使用 TSLA 模板估算结构。${message ?? ''}`.trim();
  return {
    ...report,
    symbol: matchedReport ? report.symbol : normalized,
    name: matchedReport ? report.name : `${normalized} Asset`,
    sector: matchedReport ? report.sector : '待同步',
    marketCap: matchedReport ? report.marketCap : '待同步',
    providerMeta: {
      mode: 'mock',
      source: 'AlphaMind mock provider',
      status: unsupportedMessage ? 'fallback' : 'ok',
      message: unsupportedMessage,
    },
  };
}

export async function getAssetXRayReport(request: AssetXRayRequest): Promise<AssetXRayReport> {
  const config = getAlphaMindConfig();
  const symbol = normalizeAssetSymbol(request.symbol);

  if (config.dataMode !== 'quantdinger') {
    return getMockAssetXRayReport(symbol);
  }

  try {
    return await getQuantDingerAssetXRayReport({
      symbol,
      market: request.market ?? 'USStock',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'QuantDinger provider unavailable';
    return getMockAssetXRayReport(symbol, `QuantDinger 暂不可用，已切换到本地演示数据：${message}`);
  }
}

async function getQuantDingerAssetXRayReport(request: Required<AssetXRayRequest>): Promise<AssetXRayReport> {
  const config = getAlphaMindConfig();
  const baseUrl = config.quantDingerBaseUrl.replace(/\/$/, '');
  const market = request.market;
  const symbol = request.symbol;
  const useAgentGateway = Boolean(config.quantDingerAgentToken);
  const priceUrl = useAgentGateway
    ? `${baseUrl}/api/agent/v1/price?market=${encodeURIComponent(market)}&symbol=${encodeURIComponent(symbol)}`
    : `${baseUrl}/api/indicator/price?market=${encodeURIComponent(market)}&symbol=${encodeURIComponent(symbol)}`;
  const klineUrl = useAgentGateway
    ? `${baseUrl}/api/agent/v1/klines?market=${encodeURIComponent(market)}&symbol=${encodeURIComponent(symbol)}&timeframe=1D&limit=90`
    : `${baseUrl}/api/indicator/kline?market=${encodeURIComponent(market)}&symbol=${encodeURIComponent(symbol)}&timeframe=1D&limit=90`;

  const [priceData, klineData, analysisData] = await Promise.all([
    fetchQuantDingerEnvelope(priceUrl),
    fetchQuantDingerEnvelope<KlinePoint[] | { klines?: KlinePoint[] }>(klineUrl),
    fetchFastAnalysisIfConfigured(baseUrl, market, symbol),
  ]);

  const klines = Array.isArray(klineData) ? klineData : klineData?.klines ?? [];
  const latestClose = getLatestClose(klines);
  const providerPrice = extractNumber(priceData, ['price', 'last', 'last_price', 'close', 'current_price']) ?? latestClose;
  const previousClose = getPreviousClose(klines);
  const changeValue = extractNumber(priceData, ['change_percent', 'changePercent', 'pct_change']) ?? computeChange(providerPrice, previousClose);
  const momentumScore = scoreMomentum(klines, changeValue);
  const volatilityScore = scoreVolatility(klines);
  const sentimentScore = extractNestedScore(analysisData, ['sentiment', 'scores.sentiment']) ?? Math.min(90, Math.max(35, 52 + changeValue * 4));
  const overallScore = extractNestedScore(analysisData, ['overall', 'scores.overall', 'confidence']) ?? Math.round((momentumScore + sentimentScore + (100 - volatilityScore)) / 3);
  const meta = COMPANY_META[symbol] ?? {
    name: `${symbol} Asset`,
    sector: market,
    marketCap: '待同步',
  };

  return {
    symbol,
    name: meta.name,
    market: market === 'USStock' ? 'NASDAQ / US' : market,
    sector: meta.sector,
    price: formatUsd(providerPrice),
    change: `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)}%`,
    changeValue,
    marketCap: meta.marketCap,
    radar: [
      { subject: '估值', value: clampScore(58 - Math.max(0, changeValue) * 2) },
      { subject: '成长性', value: clampScore(62 + momentumScore * 0.28) },
      { subject: '盈利', value: clampScore(64 + overallScore * 0.18) },
      { subject: '情绪', value: clampScore(sentimentScore) },
      { subject: '动量', value: clampScore(momentumScore) },
      { subject: '安全边际', value: clampScore(82 - volatilityScore * 0.55) },
    ],
    sentiment: clampScore(sentimentScore),
    sentimentLabel: labelSentiment(sentimentScore),
    conclusion: buildQuantDingerConclusion(symbol, overallScore, momentumScore, volatilityScore, analysisData),
    probabilities: buildProbabilities(momentumScore, volatilityScore, sentimentScore),
    metrics: [
      { label: 'AI 综合评分', value: String(clampScore(overallScore)), hint: 'QuantDinger provider' },
      { label: '波动风险', value: labelVolatility(volatilityScore), hint: '来自 K 线波动估算' },
      { label: '预测置信度', value: `${clampScore(55 + overallScore * 0.28)}%`, hint: '数据驱动估计' },
    ],
    catalysts: buildCatalysts(symbol, analysisData),
    providerMeta: {
      mode: 'quantdinger',
      source: config.quantDingerAgentToken ? 'QuantDinger Agent Gateway' : 'QuantDinger indicator API',
      status: 'ok',
      raw: { priceData, klineSample: klines.slice(-3), analysisData },
    },
  };
}

async function fetchFastAnalysisIfConfigured(baseUrl: string, market: string, symbol: string) {
  const config = getAlphaMindConfig();
  if (!config.quantDingerAuthToken) return null;

  try {
    return await fetchQuantDingerEnvelope(`${baseUrl}/api/fast-analysis/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.quantDingerAuthToken}`,
      },
      body: JSON.stringify({
        market,
        symbol,
        language: 'zh-CN',
        timeframe: '1D',
        async_submit: false,
      }),
    });
  } catch {
    return null;
  }
}

async function fetchQuantDingerEnvelope<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const config = getAlphaMindConfig();
  const headers = new Headers(init?.headers);
  if (config.quantDingerAgentToken && url.includes('/api/agent/v1/')) {
    headers.set('Authorization', `Bearer ${config.quantDingerAgentToken}`);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { ...init, headers, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    if (payload && typeof payload === 'object') {
      const envelope = payload as QuantDingerEnvelope<T>;
      const isEnvelope = envelope.code !== undefined || envelope.data !== undefined;
      const isAgentGateway = url.includes('/api/agent/v1/');
      const success = envelope.code === undefined || envelope.code === 1 || (isAgentGateway && envelope.code === 0);
      if (isEnvelope) {
        if (!success || envelope.data === null || envelope.data === undefined) {
          throw new Error(envelope.message ?? envelope.msg ?? 'Empty QuantDinger response');
        }
        return envelope.data;
      }
    }

    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('QuantDinger request timed out');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function getLatestClose(klines: KlinePoint[]) {
  const last = [...klines].reverse().find((item) => Number.isFinite(toNumber(item.close)));
  return last ? toNumber(last.close) : undefined;
}

function getPreviousClose(klines: KlinePoint[]) {
  const points = klines.filter((item) => Number.isFinite(toNumber(item.close)));
  return points.length >= 2 ? toNumber(points[points.length - 2].close) : undefined;
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value.replace(/[%,$]/g, ''));
  return Number.NaN;
}

function extractNumber(input: unknown, keys: string[]) {
  if (!input || typeof input !== 'object') return undefined;
  for (const key of keys) {
    const value = (input as Record<string, unknown>)[key];
    const numeric = toNumber(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return undefined;
}

function extractNestedScore(input: unknown, keys: string[]) {
  for (const path of keys) {
    const value = path.split('.').reduce<unknown>((current, key) => {
      if (!current || typeof current !== 'object') return undefined;
      return (current as Record<string, unknown>)[key];
    }, input);
    const numeric = toNumber(value);
    if (Number.isFinite(numeric)) return clampScore(numeric <= 1 ? numeric * 100 : numeric);
  }
  return undefined;
}

function computeChange(price?: number, previous?: number) {
  if (!price || !previous) return 0;
  return ((price - previous) / previous) * 100;
}

function scoreMomentum(klines: KlinePoint[], fallbackChange: number) {
  const closes = klines.map((item) => toNumber(item.close)).filter(Number.isFinite);
  if (closes.length < 8) return clampScore(55 + fallbackChange * 5);

  const recent = closes[closes.length - 1];
  const base = closes[Math.max(0, closes.length - 21)];
  const returnPct = ((recent - base) / base) * 100;
  return clampScore(50 + returnPct * 2.2);
}

function scoreVolatility(klines: KlinePoint[]) {
  const closes = klines.map((item) => toNumber(item.close)).filter(Number.isFinite).slice(-30);
  if (closes.length < 5) return 48;

  const returns = closes.slice(1).map((value, index) => Math.abs((value - closes[index]) / closes[index]) * 100);
  const avgMove = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  return clampScore(30 + avgMove * 12);
}

function clampScore(value: number) {
  return Math.max(5, Math.min(95, Math.round(value)));
}

function formatUsd(value?: number) {
  if (!value || !Number.isFinite(value)) return '同步中';
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function labelSentiment(score: number) {
  if (score >= 78) return '贪婪';
  if (score >= 62) return '偏贪婪';
  if (score >= 45) return '中性';
  if (score >= 30) return '谨慎';
  return '恐慌';
}

function labelVolatility(score: number) {
  if (score >= 72) return '高';
  if (score >= 55) return '中高';
  if (score >= 38) return '中';
  return '低';
}

function buildProbabilities(momentum: number, volatility: number, sentiment: number) {
  const up = clampScore(28 + momentum * 0.34 + sentiment * 0.18 - volatility * 0.12);
  const down = clampScore(42 - momentum * 0.2 + volatility * 0.24 - sentiment * 0.08);
  const flat = Math.max(8, 100 - up - down);
  const total = up + down + flat;
  return {
    up: Math.round((up / total) * 100),
    flat: Math.round((flat / total) * 100),
    down: Math.round((down / total) * 100),
  };
}

function buildQuantDingerConclusion(
  symbol: string,
  overall: number,
  momentum: number,
  volatility: number,
  analysis: unknown,
) {
  const summary = typeof analysis === 'object' && analysis
    ? ((analysis as Record<string, unknown>).summary ?? (analysis as Record<string, unknown>).conclusion)
    : undefined;
  if (typeof summary === 'string' && summary.trim()) return summary.trim();

  const trend = momentum >= 68 ? '短期动量偏强' : momentum >= 45 ? '趋势处于观察区间' : '短期动量偏弱';
  const risk = volatility >= 65 ? '波动水平较高，仓位需要更严格的风控' : '波动水平可控，适合结合关键价位分批评估';
  const rating = overall >= 72 ? '积极关注' : overall >= 55 ? '中性偏谨慎' : '谨慎观察';
  return `${symbol} 已接入 QuantDinger 数据通道。当前综合评分为 ${clampScore(overall)}，${trend}，${risk}。AlphaMind 建议维持“${rating}”视角，并继续结合财报、行业催化和个人风险承受能力判断。`;
}

function buildCatalysts(symbol: string, analysis: unknown) {
  const reasons = typeof analysis === 'object' && analysis
    ? ((analysis as Record<string, unknown>).reasons ?? (analysis as Record<string, unknown>).catalysts)
    : undefined;
  if (Array.isArray(reasons) && reasons.length > 0) {
    return reasons.slice(0, 3).map((item) => String(item));
  }

  const defaults: Record<string, string[]> = {
    TSLA: ['价格与成交量同步变化', '电动车与储能业务催化', '市场情绪变化可能放大波动'],
    NVDA: ['AI 算力需求延续', '数据中心订单预期', '估值消化节奏影响短线波动'],
    AAPL: ['服务收入韧性', '新品周期预期', '回购与现金流提供支撑'],
  };
  return defaults[symbol] ?? ['K 线趋势变化', '市场情绪变化', '宏观流动性与行业消息'];
}
