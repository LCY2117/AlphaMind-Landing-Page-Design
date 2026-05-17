import { getAlphaMindConfig } from './alphamindConfig';
import { normalizeAssetSymbol } from './assetXRay';

export interface AlphaMindBacktestRequest {
  symbol: string;
  market?: string;
  timeframe?: string;
  startDate?: string;
  endDate?: string;
  initialCapital?: number;
}

export interface AlphaMindBacktestResult {
  jobId: string;
  status: 'mock' | 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  title: string;
  summary: string;
  metrics: Array<{ label: string; value: string; hint: string }>;
  providerMeta: {
    mode: 'mock' | 'quantdinger';
    source: string;
    status: 'ok' | 'fallback';
    message?: string;
    raw?: unknown;
  };
}

interface QuantDingerEnvelope<T = unknown> {
  code?: number;
  message?: string;
  msg?: string;
  data?: T;
}

interface QuantDingerJob {
  job_id?: string;
  status?: AlphaMindBacktestResult['status'];
  result?: Record<string, unknown>;
  error?: string;
}

const DEMO_STRATEGY_CODE = `
def signal(ctx):
    fast = sma(ctx.close, 12)
    slow = sma(ctx.close, 26)
    if fast[-1] > slow[-1] and fast[-2] <= slow[-2]:
        return 1
    if fast[-1] < slow[-1] and fast[-2] >= slow[-2]:
        return -1
    return 0
`.trim();

export async function submitAlphaMindBacktest(
  request: AlphaMindBacktestRequest,
): Promise<AlphaMindBacktestResult> {
  const config = getAlphaMindConfig();
  const symbol = normalizeAssetSymbol(request.symbol);

  if (config.dataMode !== 'quantdinger') {
    return getMockBacktestResult(symbol);
  }

  if (!config.quantDingerAgentToken) {
    return getMockBacktestResult(symbol, 'QuantDinger 回测需要带 B scope 的 Agent Token，当前已使用本地模拟回测。');
  }

  try {
    const baseUrl = config.quantDingerBaseUrl.replace(/\/$/, '');
    const job = await fetchAgentEnvelope<QuantDingerJob>(`${baseUrl}/api/agent/v1/backtests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': `alphamind-${symbol}-${Date.now()}`,
      },
      body: JSON.stringify({
        code: DEMO_STRATEGY_CODE,
        market: request.market ?? 'USStock',
        symbol,
        timeframe: request.timeframe ?? '1D',
        start_date: request.startDate ?? '2024-01-01',
        end_date: request.endDate ?? '2024-12-31',
        initial_capital: request.initialCapital ?? 10000,
        commission: 0.001,
        slippage: 0,
        leverage: 1,
        trade_direction: 'long',
        strategy_config: {
          name: 'AlphaMind SMA demo',
          live_trading_enabled: false,
        },
      }),
    });

    return mapQuantDingerJob(symbol, job);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'QuantDinger backtest provider unavailable';
    return getMockBacktestResult(symbol, `QuantDinger 回测暂不可用，已切换到本地模拟结果：${message}`);
  }
}

export async function getAlphaMindBacktestJob(jobId: string): Promise<AlphaMindBacktestResult> {
  const config = getAlphaMindConfig();
  if (config.dataMode !== 'quantdinger' || !config.quantDingerAgentToken) {
    return getMockBacktestResult('TSLA', '未连接 QuantDinger Agent Gateway，当前返回本地模拟回测。');
  }

  const baseUrl = config.quantDingerBaseUrl.replace(/\/$/, '');
  const job = await fetchAgentEnvelope<QuantDingerJob>(`${baseUrl}/api/agent/v1/jobs/${encodeURIComponent(jobId)}`);
  return mapQuantDingerJob('TSLA', job);
}

export function getMockBacktestResult(symbolInput: string, message?: string): AlphaMindBacktestResult {
  const symbol = normalizeAssetSymbol(symbolInput);
  return {
    jobId: `mock-${symbol.toLowerCase()}-sma`,
    status: 'mock',
    title: `${symbol} 趋势策略回测`,
    summary: 'AlphaMind 已预留 QuantDinger 回测通道。当前展示的是本地模拟结果，用于验证 UI 和数据流，不触发实盘交易。',
    metrics: [
      { label: '模拟年化收益', value: '+18.6%', hint: 'SMA demo strategy' },
      { label: '最大回撤', value: '-9.4%', hint: '本地样例结果' },
      { label: '胜率', value: '57%', hint: '等待真实回测同步' },
    ],
    providerMeta: {
      mode: 'mock',
      source: 'AlphaMind mock backtest provider',
      status: message ? 'fallback' : 'ok',
      message,
    },
  };
}

async function fetchAgentEnvelope<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const config = getAlphaMindConfig();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${config.quantDingerAgentToken}`);

  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const envelope = (await response.json()) as QuantDingerEnvelope<T>;
  if (envelope.code !== 0 || envelope.data === undefined || envelope.data === null) {
    throw new Error(envelope.message ?? envelope.msg ?? 'Empty QuantDinger backtest response');
  }

  return envelope.data;
}

function mapQuantDingerJob(symbol: string, job: QuantDingerJob): AlphaMindBacktestResult {
  const result = job.result ?? {};
  const totalReturn = readMetric(result, ['total_return', 'return', 'totalReturn'], '+0.0%');
  const maxDrawdown = readMetric(result, ['max_drawdown', 'maxDrawdown'], '同步中');
  const winRate = readMetric(result, ['win_rate', 'winRate'], '同步中');

  return {
    jobId: job.job_id ?? `quantdinger-${symbol.toLowerCase()}`,
    status: job.status ?? 'queued',
    title: `${symbol} QuantDinger 回测任务`,
    summary: job.error
      ? `回测任务返回错误：${job.error}`
      : 'QuantDinger Agent Gateway 已接收回测任务。AlphaMind 将其映射为产品侧回测摘要，后续可接入进度轮询或 SSE。',
    metrics: [
      { label: '总收益', value: totalReturn, hint: 'QuantDinger result' },
      { label: '最大回撤', value: maxDrawdown, hint: 'QuantDinger result' },
      { label: '胜率', value: winRate, hint: 'QuantDinger result' },
    ],
    providerMeta: {
      mode: 'quantdinger',
      source: 'QuantDinger Agent Gateway',
      status: 'ok',
      raw: job,
    },
  };
}

function readMetric(input: Record<string, unknown>, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = input[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number' && Number.isFinite(value)) {
      const normalized = Math.abs(value) <= 1 ? value * 100 : value;
      return `${normalized >= 0 ? '+' : ''}${normalized.toFixed(1)}%`;
    }
  }

  return fallback;
}
