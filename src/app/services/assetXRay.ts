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
  sentimentAnalysis?: AssetSentimentAnalysis;
  conclusion: string;
  probabilities: {
    up: number;
    flat: number;
    down: number;
  };
  metrics: Array<{ label: string; value: string; hint: string }>;
  catalysts: string[];
  priceSeries?: AssetPricePoint[];
  newsItems?: AssetNewsItem[];
  providerMeta: {
    mode: 'mock' | 'quantdinger' | 'marketdata';
    source: string;
    status: 'ok' | 'fallback';
    message?: string;
    freshnessLabel: string;
    coverage: Array<{ label: string; value: 'live' | 'mock' | 'derived' | 'pending' }>;
    raw?: unknown;
  };
}

export interface AssetPricePoint {
  date: string;
  time?: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

export interface AssetNewsItem {
  title: string;
  source?: string;
  publishedAt?: string;
  description?: string;
  url?: string;
}

export interface AssetSentimentAnalysis {
  score: number;
  label: string;
  summary: string;
  reasons: string[];
  bullish: string[];
  bearish: string[];
  confidence: number;
  source: 'siliconflow' | 'rule' | 'mock';
  model?: string;
  updatedAt?: string;
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

interface AlphaMindMarketDataPayload {
  symbol?: string;
  quote?: {
    c?: number;
    d?: number;
    dp?: number;
    h?: number;
    l?: number;
    o?: number;
    pc?: number;
  };
  profile?: {
    name?: string;
    ticker?: string;
    exchange?: string;
    finnhubIndustry?: string;
    marketCapitalization?: number;
    currency?: string;
  };
  timeSeries?: {
    status?: string;
    values?: Array<{
      datetime?: string;
      open?: string;
      high?: string;
      low?: string;
      close?: string;
      volume?: string;
    }>;
  };
  news?: {
    status?: string;
    totalResults?: number;
    articles?: Array<{
      title?: string;
      description?: string;
      publishedAt?: string;
      source?: { name?: string };
      url?: string;
    }>;
  };
  providerErrors?: Record<string, string>;
  fetchedAt?: string;
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
      { subject: '估值吸引力', value: 42 },
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
      freshnessLabel: '本地样例数据 · 非实时',
      coverage: [
        { label: '行情', value: 'mock' },
        { label: 'K线', value: 'mock' },
        { label: 'AI结论', value: 'mock' },
      ],
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
      { subject: '估值吸引力', value: 48 },
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
      freshnessLabel: '本地样例数据 · 非实时',
      coverage: [
        { label: '行情', value: 'mock' },
        { label: 'K线', value: 'mock' },
        { label: 'AI结论', value: 'mock' },
      ],
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
      { subject: '估值吸引力', value: 58 },
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
      freshnessLabel: '本地样例数据 · 非实时',
      coverage: [
        { label: '行情', value: 'mock' },
        { label: 'K线', value: 'mock' },
        { label: 'AI结论', value: 'mock' },
      ],
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
    market: matchedReport ? report.market : '待同步',
    price: matchedReport ? report.price : '待同步',
    change: matchedReport ? report.change : '--',
    changeValue: matchedReport ? report.changeValue : 0,
    sector: matchedReport ? report.sector : '待同步',
    marketCap: matchedReport ? report.marketCap : '待同步',
    radar: matchedReport ? report.radar : [
      { subject: '估值吸引力', value: 8 },
      { subject: '成长性', value: 8 },
      { subject: '盈利', value: 8 },
      { subject: '情绪', value: 8 },
      { subject: '动量', value: 8 },
      { subject: '安全边际', value: 8 },
    ],
    sentiment: matchedReport ? report.sentiment : 0,
    sentimentLabel: matchedReport ? report.sentimentLabel : '待同步',
    sentimentAnalysis: matchedReport
      ? {
          score: report.sentiment,
          label: report.sentimentLabel,
          summary: report.conclusion.split('。')[0] || `${report.symbol} 情绪来自本地样例。`,
          reasons: report.catalysts.slice(0, 3),
          bullish: report.catalysts.slice(0, 2),
          bearish: ['估值和波动仍需结合风险承受能力判断'],
          confidence: 58,
          source: 'mock',
          updatedAt: '本地样例',
        }
      : {
          score: 0,
          label: '待同步',
          summary: `${normalized} 暂无可用行情和新闻样本，无法生成可靠情绪解释。`,
          reasons: ['等待行情源同步', '等待新闻源同步'],
          bullish: [],
          bearish: ['数据不足，不输出倾向性判断'],
          confidence: 0,
          source: 'mock',
          updatedAt: '待同步',
        },
    conclusion: matchedReport
      ? report.conclusion
      : `${normalized} 暂无本地样例或实时后端数据。当前页面仅展示 Asset X-Ray 的分析结构，正式结论需要接入行情、财务与新闻数据源后生成。`,
    probabilities: matchedReport ? report.probabilities : { up: 0, flat: 0, down: 0 },
    metrics: matchedReport ? report.metrics : [
      { label: '样例结构完整度', value: '演示', hint: '暂无该标的本地样例' },
      { label: '行情状态', value: '待同步', hint: '等待真实数据源接入' },
      { label: '预测置信度', value: '--', hint: '不输出伪置信度' },
    ],
    catalysts: matchedReport ? report.catalysts : ['等待行情源同步', '等待财务数据源同步', '等待新闻与公告源同步'],
    priceSeries: matchedReport ? buildMockPriceSeries(report.symbol, report.changeValue) : [],
    newsItems: matchedReport ? buildMockNewsItems(report.symbol) : [],
    providerMeta: {
      mode: 'mock',
      source: 'AlphaMind mock provider',
      status: unsupportedMessage ? 'fallback' : 'ok',
      message: unsupportedMessage,
      freshnessLabel: matchedReport ? '本地样例数据 · 非实时' : '未连接实时源 · 使用结构演示',
      coverage: matchedReport
        ? [
            { label: '行情', value: 'mock' },
            { label: 'K线', value: 'mock' },
            { label: '新闻', value: 'mock' },
            { label: 'AI结论', value: 'mock' },
          ]
        : [
            { label: '行情', value: 'pending' },
            { label: 'K线', value: 'pending' },
            { label: '新闻', value: 'pending' },
            { label: 'AI结论', value: 'mock' },
          ],
    },
  };
}

export async function getAssetXRayReport(request: AssetXRayRequest): Promise<AssetXRayReport> {
  const config = getAlphaMindConfig();
  const symbol = normalizeAssetSymbol(request.symbol);

  try {
    return await getMarketDataAssetXRayReport(symbol);
  } catch (error) {
    if (config.dataMode !== 'quantdinger') {
      const message = error instanceof Error ? error.message : 'market data provider unavailable';
      return getMockAssetXRayReport(symbol, `真实行情源暂不可用，已切换到本地演示数据：${message}`);
    }
  }

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

async function getMarketDataAssetXRayReport(symbol: string): Promise<AssetXRayReport> {
  const payload = await fetchMarketDataPayload(symbol);
  const quote = payload.quote ?? {};
  const profile = payload.profile ?? {};
  const articles = payload.news?.articles ?? [];
  const klines = mapTwelveDataKlines(payload.timeSeries);
  const priceSeries = mapKlinesToPriceSeries(klines);
  const newsItems = mapArticlesToNewsItems(articles);
  const latestClose = getLatestClose(klines);
  const price = toFiniteNumber(quote.c) ?? latestClose;
  const previousClose = toFiniteNumber(quote.pc) ?? getPreviousClose(klines);
  const changeValue = toFiniteNumber(quote.dp) ?? computeChange(price, previousClose);
  const momentumScore = scoreMomentum(klines, changeValue);
  const volatilityScore = scoreVolatility(klines);
  const newsSentimentScore = scoreNewsSentiment(articles, changeValue);
  const profileMeta = COMPANY_META[symbol];
  const companyName = profile.name || profileMeta?.name || `${symbol} Asset`;
  const sector = profile.finnhubIndustry || profileMeta?.sector || '待同步';
  const marketCap = formatMarketCap(profile.marketCapitalization);
  const valuationScore = clampScore(62 - Math.max(0, changeValue) * 1.8 - volatilityScore * 0.08);
  const growthScore = clampScore(58 + momentumScore * 0.34 + (newsSentimentScore - 50) * 0.12);
  const profitabilityScore = clampScore(62 + growthScore * 0.18 + valuationScore * 0.12);
  const overallScore = clampScore((valuationScore + growthScore + profitabilityScore + newsSentimentScore + momentumScore + (100 - volatilityScore)) / 6);
  const providerErrors = Object.values(payload.providerErrors ?? {}).filter(Boolean);
  const errorSuffix = providerErrors.length > 0 ? `部分数据源未返回：${providerErrors.slice(0, 2).join('；')}` : undefined;
  const fallbackSentiment = buildRuleSentimentAnalysis(
    symbol,
    newsSentimentScore,
    changeValue,
    momentumScore,
    volatilityScore,
    articles,
  );
  const sentimentAnalysis = await fetchAiSentimentAnalysis({
    symbol,
    name: companyName,
    price: formatUsd(price),
    change: `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)}%`,
    momentumScore,
    volatilityScore,
    newsSentimentScore,
    articles,
    fallback: fallbackSentiment,
  });
  const finalSentimentScore = clampScore(sentimentAnalysis.score);

  return {
    symbol,
    name: companyName,
    market: profile.exchange || 'US Stock',
    sector,
    price: formatUsd(price),
    change: `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)}%`,
    changeValue,
    marketCap,
    radar: [
      { subject: '估值吸引力', value: valuationScore },
      { subject: '成长性', value: growthScore },
      { subject: '盈利', value: profitabilityScore },
      { subject: '情绪', value: finalSentimentScore },
      { subject: '动量', value: clampScore(momentumScore) },
      { subject: '安全边际', value: clampScore(84 - volatilityScore * 0.55) },
    ],
    sentiment: finalSentimentScore,
    sentimentLabel: sentimentAnalysis.label,
    sentimentAnalysis,
    conclusion: buildMarketDataConclusion(symbol, overallScore, momentumScore, volatilityScore, finalSentimentScore, articles),
    probabilities: buildProbabilities(momentumScore, volatilityScore, finalSentimentScore),
    metrics: [
      { label: 'AI 综合评分', value: String(overallScore), hint: '行情/K线/新闻派生' },
      { label: '波动风险', value: labelVolatility(volatilityScore), hint: 'Twelve Data 日线估算' },
      { label: '预测置信度', value: `${clampScore(52 + overallScore * 0.32)}%`, hint: '真实数据覆盖度估计' },
    ],
    catalysts: buildNewsCatalysts(symbol, articles),
    priceSeries,
    newsItems,
    providerMeta: {
      mode: 'marketdata',
      source: 'Finnhub / Twelve Data / NewsAPI',
      status: 'ok',
      message: errorSuffix,
      freshnessLabel: `已连接真实行情源 · ${formatFreshness(payload.fetchedAt)}`,
      coverage: [
        { label: '行情', value: payload.quote ? 'live' : 'pending' },
        { label: 'K线', value: klines.length > 0 ? 'live' : 'pending' },
        { label: '新闻', value: articles.length > 0 ? 'live' : 'pending' },
        { label: 'AI结论', value: 'derived' },
      ],
      raw: {
        quote: payload.quote,
        profile: payload.profile,
        klineSample: klines.slice(-3),
        newsSample: articles.slice(0, 3).map((article) => article.title),
        providerErrors: payload.providerErrors,
      },
    },
  };
}

async function fetchMarketDataPayload(symbol: string): Promise<AlphaMindMarketDataPayload> {
  const response = await fetch(`/api/alphamind/asset-xray?symbol=${encodeURIComponent(symbol)}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.error === 'string' ? payload.error : `HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload as AlphaMindMarketDataPayload;
}

async function fetchAiSentimentAnalysis(input: {
  symbol: string;
  name: string;
  price: string;
  change: string;
  momentumScore: number;
  volatilityScore: number;
  newsSentimentScore: number;
  articles: NonNullable<AlphaMindMarketDataPayload['news']>['articles'];
  fallback: AssetSentimentAnalysis;
}): Promise<AssetSentimentAnalysis> {
  try {
    const response = await fetch('/api/alphamind/asset-sentiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: input.symbol,
        name: input.name,
        price: input.price,
        change: input.change,
        momentumScore: input.momentumScore,
        volatilityScore: input.volatilityScore,
        ruleSentimentScore: input.newsSentimentScore,
        news: input.articles.slice(0, 6).map((article) => ({
          title: article.title,
          description: article.description,
          source: article.source?.name,
          publishedAt: article.publishedAt,
        })),
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof payload?.error === 'string' ? payload.error : `HTTP ${response.status}`);

    return normalizeAiSentimentPayload(payload, input.fallback);
  } catch {
    return input.fallback;
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
  const priceSeries = mapKlinesToPriceSeries(klines);
  const latestClose = getLatestClose(klines);
  const providerPrice = extractNumber(priceData, ['price', 'last', 'last_price', 'close', 'current_price']) ?? latestClose;
  const previousClose = getPreviousClose(klines);
  const changeValue = extractNumber(priceData, ['change_percent', 'changePercent', 'pct_change']) ?? computeChange(providerPrice, previousClose);
  const momentumScore = scoreMomentum(klines, changeValue);
  const volatilityScore = scoreVolatility(klines);
  const sentimentScore = extractNestedScore(analysisData, ['sentiment', 'scores.sentiment']) ?? Math.min(90, Math.max(35, 52 + changeValue * 4));
  const sentimentAnalysis = buildRuleSentimentAnalysis(symbol, sentimentScore, changeValue, momentumScore, volatilityScore, []);
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
      { subject: '估值吸引力', value: clampScore(58 - Math.max(0, changeValue) * 2) },
      { subject: '成长性', value: clampScore(62 + momentumScore * 0.28) },
      { subject: '盈利', value: clampScore(64 + overallScore * 0.18) },
      { subject: '情绪', value: clampScore(sentimentScore) },
      { subject: '动量', value: clampScore(momentumScore) },
      { subject: '安全边际', value: clampScore(82 - volatilityScore * 0.55) },
    ],
    sentiment: clampScore(sentimentScore),
    sentimentLabel: labelSentiment(sentimentScore),
    sentimentAnalysis,
    conclusion: buildQuantDingerConclusion(symbol, overallScore, momentumScore, volatilityScore, analysisData),
    probabilities: buildProbabilities(momentumScore, volatilityScore, sentimentScore),
    metrics: [
      { label: 'AI 综合评分', value: String(clampScore(overallScore)), hint: 'QuantDinger provider' },
      { label: '波动风险', value: labelVolatility(volatilityScore), hint: '来自 K 线波动估算' },
      { label: '预测置信度', value: `${clampScore(55 + overallScore * 0.28)}%`, hint: '数据驱动估计' },
    ],
    catalysts: buildCatalysts(symbol, analysisData),
    priceSeries,
    newsItems: [],
    providerMeta: {
      mode: 'quantdinger',
      source: config.quantDingerAgentToken ? 'QuantDinger Agent Gateway' : 'QuantDinger indicator API',
      status: 'ok',
      freshnessLabel: `已连接 QuantDinger · ${new Date().toLocaleString('zh-CN', { hour12: false })}`,
      coverage: [
        { label: '行情', value: providerPrice ? 'live' : 'pending' },
        { label: 'K线', value: klines.length > 0 ? 'live' : 'pending' },
        { label: 'AI结论', value: analysisData ? 'live' : 'derived' },
      ],
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

function toFiniteNumber(value: unknown) {
  const numeric = toNumber(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function mapTwelveDataKlines(input?: AlphaMindMarketDataPayload['timeSeries']): KlinePoint[] {
  if (!input?.values || !Array.isArray(input.values)) return [];

  return [...input.values]
    .reverse()
    .map((item) => ({
      time: item.datetime,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }))
    .filter((item) => Number.isFinite(toNumber(item.close)));
}

function mapKlinesToPriceSeries(klines: KlinePoint[]): AssetPricePoint[] {
  return klines
    .map((item, index) => {
      const close = toFiniteNumber(item.close);
      if (close === undefined) return null;
      const time = normalizeKlineTime(item.time ?? item.timestamp ?? index);

      return {
        date: formatKlineDate(item.time ?? item.timestamp ?? index),
        time,
        close: roundPrice(close),
        open: roundOptionalPrice(item.open),
        high: roundOptionalPrice(item.high),
        low: roundOptionalPrice(item.low),
        volume: roundOptionalVolume(item.volume),
      };
    })
    .filter((item): item is AssetPricePoint => Boolean(item));
}

function mapArticlesToNewsItems(
  articles: NonNullable<AlphaMindMarketDataPayload['news']>['articles'] = [],
): AssetNewsItem[] {
  return articles
    .map((article) => {
      const title = article.title?.trim();
      if (!title) return null;

      return {
        title,
        source: article.source?.name?.trim() || 'NewsAPI',
        publishedAt: formatNewsDate(article.publishedAt),
        description: article.description?.trim(),
        url: article.url,
      };
    })
    .filter((item): item is AssetNewsItem => Boolean(item))
    .slice(0, 8);
}

function buildMockPriceSeries(symbol: string, changeValue: number): AssetPricePoint[] {
  const seed = symbol.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 5), 0);
  const base = symbol === 'NVDA' ? 920 : symbol === 'AAPL' ? 190 : 177;
  let close = base * (1 - changeValue / 100);

  return Array.from({ length: 60 }, (_, index) => {
    const mockDate = new Date(Date.UTC(2026, 0, 1 + index));
    const wave = Math.sin(index * 0.34 + seed * 0.03) * (base * 0.012);
    const drift = ((index - 30) / 60) * base * (changeValue / 100);
    const open = close;
    close = Math.max(1, base + drift + wave + Math.sin(index * 0.91 + seed) * base * 0.006);
    const high = Math.max(open, close) * (1 + 0.004 + ((seed + index) % 5) * 0.001);
    const low = Math.min(open, close) * (1 - 0.004 - ((seed + index) % 4) * 0.001);

    return {
      date: `D-${59 - index}`,
      time: mockDate.toISOString().slice(0, 10),
      open: roundPrice(open),
      high: roundPrice(high),
      low: roundPrice(low),
      close: roundPrice(close),
      volume: Math.round((18_000_000 + ((seed + index * 7919) % 42_000_000)) / 1000) * 1000,
    };
  });
}

function buildMockNewsItems(symbol: string): AssetNewsItem[] {
  const samples: Record<string, AssetNewsItem[]> = {
    TSLA: [
      { title: '交付节奏与毛利率变化成为短期关注点', source: 'AlphaMind sample', publishedAt: '样例新闻' },
      { title: '储能业务增长和自动驾驶预期继续影响市场情绪', source: 'AlphaMind sample', publishedAt: '样例新闻' },
      { title: '电动车需求与价格策略仍是估值分歧来源', source: 'AlphaMind sample', publishedAt: '样例新闻' },
    ],
    NVDA: [
      { title: '数据中心订单与 AI 算力需求保持高关注度', source: 'AlphaMind sample', publishedAt: '样例新闻' },
      { title: '市场继续评估高估值与盈利兑现节奏', source: 'AlphaMind sample', publishedAt: '样例新闻' },
      { title: '供应链交付能力影响短期业绩预期', source: 'AlphaMind sample', publishedAt: '样例新闻' },
    ],
    AAPL: [
      { title: '服务收入韧性与新品周期是主要观察线索', source: 'AlphaMind sample', publishedAt: '样例新闻' },
      { title: '回购与现金流支撑长期防御属性', source: 'AlphaMind sample', publishedAt: '样例新闻' },
      { title: '终端需求变化影响市场对成长性的判断', source: 'AlphaMind sample', publishedAt: '样例新闻' },
    ],
  };

  return samples[symbol] ?? [];
}

function formatKlineDate(value: number | string) {
  if (typeof value === 'number') {
    const date = new Date(value > 1_000_000_000_000 ? value : value * 1000);
    return Number.isNaN(date.getTime()) ? String(value) : `${date.getMonth() + 1}/${date.getDate()}`;
  }

  const trimmed = value.trim();
  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) return formatKlineDate(numeric);
  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) return `${date.getMonth() + 1}/${date.getDate()}`;
  return trimmed.length > 10 ? trimmed.slice(0, 10) : trimmed;
}

function normalizeKlineTime(value: number | string) {
  if (typeof value === 'number') {
    const date = new Date(value > 1_000_000_000_000 ? value : value * 1000);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
  }

  const trimmed = value.trim();
  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) return normalizeKlineTime(numeric);
  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : undefined;
}

function formatNewsDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

function roundPrice(value: number) {
  return Number(value.toFixed(2));
}

function roundOptionalPrice(value: unknown) {
  const numeric = toFiniteNumber(value);
  return numeric === undefined ? undefined : roundPrice(numeric);
}

function roundOptionalVolume(value: unknown) {
  const numeric = toFiniteNumber(value);
  return numeric === undefined ? undefined : Math.round(numeric);
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

function normalizeAiSentimentPayload(payload: unknown, fallback: AssetSentimentAnalysis): AssetSentimentAnalysis {
  if (!payload || typeof payload !== 'object') return fallback;
  const record = payload as Record<string, unknown>;
  const rawScore = toFiniteNumber(record.score);
  const score = rawScore === undefined ? fallback.score : clampScore(rawScore);
  const label = typeof record.label === 'string' && record.label.trim() ? record.label.trim() : labelSentiment(score);
  const summary = typeof record.summary === 'string' && record.summary.trim() ? record.summary.trim() : fallback.summary;
  const reasons = normalizeStringList(record.reasons, fallback.reasons).slice(0, 4);
  const bullish = normalizeStringList(record.bullish, fallback.bullish).slice(0, 3);
  const bearish = normalizeStringList(record.bearish, fallback.bearish).slice(0, 3);
  const confidence = clampScore(toFiniteNumber(record.confidence) ?? fallback.confidence);
  const source = record.source === 'siliconflow' ? 'siliconflow' : fallback.source;
  const model = typeof record.model === 'string' ? record.model : fallback.model;
  const updatedAt = typeof record.updatedAt === 'string' ? record.updatedAt : new Date().toLocaleString('zh-CN', { hour12: false });

  return {
    score,
    label,
    summary,
    reasons,
    bullish,
    bearish,
    confidence,
    source,
    model,
    updatedAt,
  };
}

function normalizeStringList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item) => String(item).trim())
    .filter(Boolean);
  return normalized.length > 0 ? normalized : fallback;
}

function buildRuleSentimentAnalysis(
  symbol: string,
  score: number,
  changeValue: number,
  momentum: number,
  volatility: number,
  articles: NonNullable<AlphaMindMarketDataPayload['news']>['articles'] = [],
): AssetSentimentAnalysis {
  const label = labelSentiment(score);
  const headline = articles.find((article) => article.title)?.title;
  const momentumLine = momentum >= 64 ? '价格动量偏强，短线资金仍在关注。' : momentum >= 45 ? '价格动量处于震荡确认区间。' : '价格动量偏弱，短线承压。';
  const volatilityLine = volatility >= 65 ? '波动率较高，情绪信号需要打折处理。' : '波动率尚可控，情绪读数相对稳定。';
  const newsLine = headline ? `近期新闻线索集中在“${headline}”。` : '当前新闻样本不足，更多依赖价格、波动与规则词典估算。';
  const bearish = [
    volatility >= 65 ? '波动率偏高，容易放大回撤' : '仍需观察成交量是否持续配合',
    changeValue < 0 ? '最新涨跌幅为负，短线风险偏好下降' : '上涨后估值和兑现压力需要跟踪',
  ];

  return {
    score: clampScore(score),
    label,
    summary: `${symbol} 当前多空情绪为“${label}”。${momentumLine}${volatilityLine}`,
    reasons: [momentumLine, volatilityLine, newsLine],
    bullish: [
      momentum >= 55 ? '中短期价格趋势仍有支撑' : '若价格重新站上关键均线，情绪可能修复',
      articles.length > 0 ? '新闻样本可用于继续验证市场叙事' : '等待新闻源恢复后可提升判断置信度',
    ],
    bearish,
    confidence: clampScore(48 + Math.min(articles.length, 6) * 5 + (volatility < 60 ? 8 : 0)),
    source: 'rule',
    updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  };
}

function formatMarketCap(value?: number) {
  if (!value || !Number.isFinite(value)) return '待同步';
  const usd = value * 1_000_000;
  if (usd >= 1_000_000_000_000) return `$${(usd / 1_000_000_000_000).toFixed(2)}T`;
  if (usd >= 1_000_000_000) return `$${(usd / 1_000_000_000).toFixed(1)}B`;
  return `$${usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatFreshness(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toLocaleString('zh-CN', { hour12: false });
  return date.toLocaleString('zh-CN', { hour12: false });
}

function scoreNewsSentiment(articles: NonNullable<AlphaMindMarketDataPayload['news']>['articles'] = [], fallbackChange = 0) {
  if (!articles.length) return clampScore(52 + fallbackChange * 3);

  const positiveWords = ['beat', 'growth', 'record', 'surge', 'upgrade', 'profit', 'strong', 'bullish', 'gain', 'rally', 'optimistic'];
  const negativeWords = ['miss', 'fall', 'drop', 'downgrade', 'loss', 'weak', 'bearish', 'probe', 'lawsuit', 'risk', 'recall'];
  let score = 50 + fallbackChange * 2;

  articles.slice(0, 8).forEach((article) => {
    const text = `${article.title ?? ''} ${article.description ?? ''}`.toLowerCase();
    positiveWords.forEach((word) => {
      if (text.includes(word)) score += 2.4;
    });
    negativeWords.forEach((word) => {
      if (text.includes(word)) score -= 2.8;
    });
  });

  return clampScore(score);
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

function buildMarketDataConclusion(
  symbol: string,
  overall: number,
  momentum: number,
  volatility: number,
  sentiment: number,
  articles: NonNullable<AlphaMindMarketDataPayload['news']>['articles'] = [],
) {
  const rating = overall >= 72 ? '积极关注' : overall >= 55 ? '中性观察' : '谨慎观察';
  const trend = momentum >= 68 ? '短期动量偏强' : momentum >= 45 ? '趋势仍在震荡确认' : '短期动量偏弱';
  const risk = volatility >= 65 ? '波动水平偏高，仓位和止损纪律更重要' : '波动水平相对可控';
  const mood = sentiment >= 62 ? '新闻情绪偏正面' : sentiment >= 45 ? '新闻情绪中性' : '新闻情绪偏谨慎';
  const headline = articles.find((article) => article.title)?.title;
  const newsLine = headline ? `近期新闻线索包括“${headline}”。` : '当前未获取到足够新闻标题，情绪分更多来自价格与波动派生。';

  return `${symbol} 已接入真实行情/日线/新闻数据源。当前综合评分为 ${overall}，AlphaMind 维持“${rating}”视角：${trend}，${risk}，${mood}。${newsLine}本结论仅用于研究辅助，不构成投资建议。`;
}

function buildNewsCatalysts(symbol: string, articles: NonNullable<AlphaMindMarketDataPayload['news']>['articles'] = []) {
  const titles = articles
    .map((article) => article.title?.trim())
    .filter((title): title is string => Boolean(title))
    .slice(0, 3);

  if (titles.length > 0) return titles;

  const defaults: Record<string, string[]> = {
    TSLA: ['交付与毛利率变化', '自动驾驶/储能业务进展', '市场风险偏好变化'],
    NVDA: ['AI 算力需求', '数据中心订单', '估值消化节奏'],
    AAPL: ['服务收入韧性', '新品周期预期', '回购与现金流'],
  };
  return defaults[symbol] ?? ['价格趋势变化', '新闻情绪变化', '行业与宏观流动性'];
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
