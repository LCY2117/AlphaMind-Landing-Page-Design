import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  BarChart3,
  Brain,
  Gauge,
  LineChart,
  Newspaper,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import {
  getAssetXRayReport,
  getMockAssetXRayReport,
  MOCK_ASSET_REPORTS,
  normalizeAssetSymbol,
  type AssetXRayReport,
} from '../services/assetXRay';

type ScanState = 'idle' | 'scanning' | 'complete';

const historyPoints = [
  { x: 0, y: 68 },
  { x: 7, y: 61 },
  { x: 14, y: 64 },
  { x: 21, y: 56 },
  { x: 28, y: 49 },
  { x: 35, y: 52 },
  { x: 42, y: 44 },
  { x: 49, y: 39 },
  { x: 56, y: 35 },
  { x: 63, y: 32 },
];

function pointString(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function AnalysisSkeleton({ values }: { values: number[] }) {
  return (
    <div className="absolute inset-0 z-20 overflow-hidden rounded-2xl bg-[color-mix(in_srgb,var(--am-surface-strong)_72%,transparent)] backdrop-blur-md">
      <div className="absolute inset-x-0 top-0 h-24 am-xray-scan" />
      <div className="h-full p-5 sm:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 w-28 rounded-full am-skeleton-block mb-3" />
            <div className="h-7 w-44 rounded-full am-skeleton-block" />
          </div>
          <ScanLine size={28} className="am-brand" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {values.slice(0, 3).map((value, index) => (
            <div key={index} className="rounded-xl border am-border-subtle am-card p-3">
              <div className="text-xs am-text-tertiary mb-2">AI NODE {index + 1}</div>
              <div className="text-xl font-bold am-text-primary tabular-nums">{value}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-3 rounded-full am-skeleton-block" />
          <div className="h-3 w-2/3 rounded-full am-skeleton-block" />
        </div>
      </div>
    </div>
  );
}

function SentimentGauge({ score, label, active }: { score: number; label: string; active: boolean }) {
  const needleAngle = -90 + score * 1.8;

  return (
    <div className="relative h-[230px]">
      <svg viewBox="0 0 220 150" className="h-full w-full">
        <path
          d="M25 120 A85 85 0 0 1 195 120"
          fill="none"
          stroke="var(--am-chart-grid)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <motion.path
          d="M25 120 A85 85 0 0 1 195 120"
          fill="none"
          stroke="url(#sentimentGaugeGradient)"
          strokeWidth="18"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: active ? score / 100 : 0.08 }}
          transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
        />
        <defs>
          <linearGradient id="sentimentGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#C44536" />
          </linearGradient>
        </defs>
        <motion.g
          style={{ transformOrigin: '110px 120px' }}
          initial={{ rotate: -90 }}
          animate={{ rotate: active ? needleAngle : -75 }}
          transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
        >
          <line x1="110" y1="120" x2="110" y2="48" stroke="var(--am-text-primary)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="110" cy="120" r="7" fill="var(--am-brand-primary)" />
        </motion.g>
        <text x="25" y="145" className="fill-current am-text-tertiary" fontSize="10">恐慌</text>
        <text x="177" y="145" className="fill-current am-text-tertiary" fontSize="10">贪婪</text>
      </svg>
      <div className="absolute inset-x-0 bottom-2 text-center">
        <div className="text-4xl font-bold am-text-primary">{active ? score : '--'}</div>
        <div className="text-sm am-text-secondary mt-1">{active ? label : '等待扫描'}</div>
      </div>
    </div>
  );
}

function ProbabilityCone({ active, probabilities }: { active: boolean; probabilities: AssetXRayReport['probabilities'] }) {
  const history = pointString(historyPoints);
  const mid = '63,32 72,30 81,27 90,25 100,22';
  const upper = '63,32 72,22 81,15 90,10 100,6';
  const lower = '63,32 72,40 81,48 90,56 100,64';
  const upArea = `${upper} 100,22 90,25 81,27 72,30 63,32`;
  const downArea = `${mid} 100,64 90,56 81,48 72,40 63,32`;

  return (
    <div className="h-[320px]">
      <svg viewBox="0 0 100 78" className="h-full w-full overflow-visible">
        {[20, 35, 50, 65].map((y) => (
          <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="var(--am-chart-grid)" strokeWidth="0.35" strokeDasharray="2 3" />
        ))}
        <line x1="63" x2="63" y1="4" y2="72" stroke="var(--am-border-strong)" strokeWidth="0.45" strokeDasharray="2 2" />
        <text x="3" y="75" fontSize="3.2" fill="var(--am-text-tertiary)">历史走势</text>
        <text x="69" y="75" fontSize="3.2" fill="var(--am-text-tertiary)">AI 预测区间</text>

        <motion.polygon
          points={upArea}
          fill="#22C55E"
          opacity={active ? 0.16 : 0}
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 0.16 : 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        />
        <motion.polygon
          points={downArea}
          fill="#EF4444"
          opacity={active ? 0.12 : 0}
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 0.12 : 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        />
        <motion.polyline
          points={history}
          fill="none"
          stroke="#C44536"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: active ? 1 : 0 }}
          transition={{ duration: 1.1, ease: [0.25, 1, 0.5, 1] }}
        />
        <motion.polyline
          points={mid}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: active ? 1 : 0 }}
          transition={{ delay: 0.28, duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
        />
        <motion.polyline
          points={upper}
          fill="none"
          stroke="#22C55E"
          strokeWidth="0.55"
          strokeLinecap="round"
          strokeDasharray="1.4 1.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: active ? 1 : 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
        />
        <motion.polyline
          points={lower}
          fill="none"
          stroke="#EF4444"
          strokeWidth="0.55"
          strokeLinecap="round"
          strokeDasharray="1.4 1.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: active ? 1 : 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
        />
      </svg>
      <div className="grid grid-cols-3 gap-2 -mt-4">
        <div className="rounded-lg am-card border p-2 text-center">
          <div className="text-xs am-text-tertiary">上涨</div>
          <div className="text-sm font-bold text-green-500">{probabilities.up}%</div>
        </div>
        <div className="rounded-lg am-card border p-2 text-center">
          <div className="text-xs am-text-tertiary">横盘</div>
          <div className="text-sm font-bold text-amber-500">{probabilities.flat}%</div>
        </div>
        <div className="rounded-lg am-card border p-2 text-center">
          <div className="text-xs am-text-tertiary">下跌</div>
          <div className="text-sm font-bold text-red-500">{probabilities.down}%</div>
        </div>
      </div>
    </div>
  );
}

interface AssetXRayProps {
  requestedSymbol?: string;
}

export function AssetXRay({ requestedSymbol = 'TSLA' }: AssetXRayProps) {
  const initialSymbol = normalizeAssetSymbol(requestedSymbol);
  const [query, setQuery] = useState(initialSymbol);
  const [stock, setStock] = useState<AssetXRayReport>(() => getMockAssetXRayReport(initialSymbol));
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanValues, setScanValues] = useState([128, 64, 91]);
  const [typedConclusion, setTypedConclusion] = useState('');
  const scanCompletionTimer = useRef<number | null>(null);
  const activeRequestRef = useRef(0);

  const isScanning = scanState === 'scanning';
  const isComplete = scanState === 'complete';

  const providerBadge = useMemo(() => {
    if (stock.providerMeta.mode === 'quantdinger') return 'QuantDinger live';
    if (stock.providerMeta.status === 'fallback') return 'Mock fallback';
    return 'Mock mode';
  }, [stock.providerMeta.mode, stock.providerMeta.status]);

  const runScan = async (nextSymbol?: string) => {
    const normalized = normalizeAssetSymbol(nextSymbol ?? query);
    const requestId = activeRequestRef.current + 1;
    activeRequestRef.current = requestId;

    setQuery(normalized);
    setScanState('scanning');
    setTypedConclusion('');

    if (scanCompletionTimer.current) {
      window.clearTimeout(scanCompletionTimer.current);
    }

    try {
      const report = await getAssetXRayReport({ symbol: normalized, market: 'USStock' });
      if (activeRequestRef.current !== requestId) return;
      setStock(report);
    } catch (error) {
      if (activeRequestRef.current !== requestId) return;
      const message = error instanceof Error ? error.message : 'unknown provider error';
      setStock(getMockAssetXRayReport(normalized, message));
    }

    scanCompletionTimer.current = window.setTimeout(() => {
      if (activeRequestRef.current !== requestId) return;
      setScanState('complete');
      scanCompletionTimer.current = null;
    }, 2300);
  };

  useEffect(() => {
    runScan(requestedSymbol);
  }, [requestedSymbol]);

  useEffect(() => {
    return () => {
      activeRequestRef.current += 1;
      if (scanCompletionTimer.current) {
        window.clearTimeout(scanCompletionTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isScanning) return;

    let frameId = 0;
    const tick = () => {
      setScanValues([
        Math.floor(80 + Math.random() * 90),
        Math.floor(30 + Math.random() * 70),
        Math.floor(55 + Math.random() * 44),
      ]);
      frameId = window.setTimeout(() => requestAnimationFrame(tick), 90);
    };

    tick();
    return () => window.clearTimeout(frameId);
  }, [isScanning]);

  useEffect(() => {
    if (!isComplete) return;

    setTypedConclusion('');
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setTypedConclusion(stock.conclusion.slice(0, index));
      if (index >= stock.conclusion.length) {
        window.clearInterval(interval);
      }
    }, 26);

    return () => window.clearInterval(interval);
  }, [isComplete, stock.conclusion]);

  return (
    <section className="w-full min-h-screen am-page-gradient">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full am-brand-soft am-brand px-3 py-1 text-xs font-semibold mb-4">
                <ScanLine size={14} />
                Asset X-Ray
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold am-text-primary mb-3">资产透视</h2>
              <p className="am-text-secondary max-w-2xl">
                输入股票代码，AlphaMind 会从估值、成长、盈利、情绪、动量与预测区间进行 AI 深度检测。
              </p>
            </motion.div>

            <div className="am-surface border rounded-2xl p-4 sm:p-5 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 am-input-surface border rounded-xl px-3 py-2 flex items-center gap-2">
                  <Search size={18} className="am-text-tertiary" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') runScan();
                    }}
                    placeholder="输入股票代码，如 TSLA / NVDA / AAPL"
                    className="flex-1 bg-transparent am-text-primary am-placeholder focus:outline-none text-sm"
                  />
                </div>
                <button
                  onClick={() => runScan()}
                  disabled={isScanning}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#C44536] to-orange-600 am-on-brand rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(196,69,54,0.4)] transition-all disabled:opacity-60"
                >
                  {isScanning ? 'AI 扫描中' : '开始深度检测'}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {MOCK_ASSET_REPORTS.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => runScan(item.symbol)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      stock.symbol === item.symbol
                        ? 'am-brand-soft am-brand am-border-brand'
                        : 'am-card am-text-secondary am-hover-surface'
                    }`}
                  >
                    {item.symbol}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full am-card border px-2.5 py-1 am-text-secondary">
                  Data: {providerBadge}
                </span>
                {stock.providerMeta.message && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-500">
                    {stock.providerMeta.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {stock.metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="am-card border rounded-2xl p-4"
                >
                  <div className="text-xs am-text-tertiary mb-2">{metric.label}</div>
                  <div className="text-2xl font-bold am-text-primary">{isScanning ? scanValues[index] : metric.value}</div>
                  <div className="text-xs am-text-secondary mt-2">{metric.hint}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="am-card border rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                {isScanning && <AnalysisSkeleton values={scanValues} />}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-base sm:text-lg font-semibold am-text-primary flex items-center gap-2">
                    <BarChart3 size={18} className="text-[#C44536]" />
                    基础诊断雷达
                  </h3>
                  <span className="text-xs am-text-tertiary">6-factor score</span>
                </div>
                <div className="h-[320px]">
                  <ResponsiveContainer>
                    <RadarChart data={stock.radar}>
                      <PolarGrid stroke="var(--am-chart-grid)" />
                      <PolarAngleAxis dataKey="subject" stroke="var(--am-chart-axis)" style={{ fontSize: '11px' }} />
                      <Radar
                        name={stock.symbol}
                        dataKey="value"
                        stroke="#C44536"
                        fill="#C44536"
                        fillOpacity={isComplete ? 0.3 : 0.05}
                        animationBegin={0}
                        animationDuration={900}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="am-card border rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                {isScanning && <AnalysisSkeleton values={scanValues} />}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-base sm:text-lg font-semibold am-text-primary flex items-center gap-2">
                    <Gauge size={18} className="text-[#C44536]" />
                    AI 多空情绪
                  </h3>
                  <span className="text-xs am-text-tertiary">NLP sentiment</span>
                </div>
                <SentimentGauge score={stock.sentiment} label={stock.sentimentLabel} active={isComplete} />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="am-card-strong border rounded-2xl p-5 relative overflow-hidden">
              {isScanning && <AnalysisSkeleton values={scanValues} />}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-xs am-text-tertiary mb-1">{stock.market}</div>
                  <h3 className="text-2xl font-bold am-text-primary">{stock.symbol}</h3>
                  <p className="text-sm am-text-secondary">{stock.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold am-text-primary">{stock.price}</div>
                  <div className={`text-sm font-semibold ${stock.changeValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.change}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="am-card border rounded-xl p-3">
                  <div className="am-text-tertiary text-xs mb-1">行业</div>
                  <div className="am-text-primary font-semibold">{stock.sector}</div>
                </div>
                <div className="am-card border rounded-xl p-3">
                  <div className="am-text-tertiary text-xs mb-1">市值</div>
                  <div className="am-text-primary font-semibold">{stock.marketCap}</div>
                </div>
              </div>
            </div>

            <div className="am-card border rounded-2xl p-5 relative overflow-hidden">
              {isScanning && <AnalysisSkeleton values={scanValues} />}
              <h3 className="text-base font-semibold am-text-primary flex items-center gap-2 mb-4">
                <Newspaper size={18} className="text-[#C44536]" />
                关键催化因子
              </h3>
              <div className="space-y-3">
                {stock.catalysts.map((item, index) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 rounded-full am-brand-soft am-brand flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm am-text-secondary">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)] gap-6 mt-6">
          <div className="am-card border rounded-2xl p-4 sm:p-6 relative overflow-hidden">
            {isScanning && <AnalysisSkeleton values={scanValues} />}
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base sm:text-lg font-semibold am-text-primary flex items-center gap-2">
                <LineChart size={18} className="text-[#C44536]" />
                AI 概率预测锥
              </h3>
              <span className="text-xs am-text-tertiary">20 trading days</span>
            </div>
            <ProbabilityCone active={isComplete} probabilities={stock.probabilities} />
          </div>

          <div className="am-card border rounded-2xl p-5 sm:p-6 relative overflow-hidden">
            {isScanning && <AnalysisSkeleton values={scanValues} />}
            <div className="flex items-center gap-2 mb-4">
              <Brain size={20} className="text-[#C44536]" />
              <h3 className="text-base sm:text-lg font-semibold am-text-primary">AI 诊断结论</h3>
            </div>
            <div className="rounded-xl am-brand-soft border am-border-brand p-4 mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold am-brand">
                <Sparkles size={16} />
                {isComplete ? '深度检测完成' : '等待模型输出'}
              </div>
            </div>
            <p className="text-sm leading-7 am-text-secondary min-h-[168px]">
              {typedConclusion || 'AlphaMind 正在等待扫描结果，结论将以逐字生成的方式输出。'}
              {isComplete && typedConclusion.length < stock.conclusion.length && (
                <span className="am-type-cursor">|</span>
              )}
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs am-text-tertiary">
              <ShieldCheck size={14} />
              该结果为 AI 辅助分析，不构成投资建议
            </div>
          </div>
        </div>

        <div className="mt-6 am-card border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#C44536] to-orange-600 am-on-brand flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold am-text-primary">也可以在对话投顾里继续追问</div>
              <div className="text-xs am-text-secondary">例如：帮我解释 TSLA 的估值风险，或者对比 NVDA 与 AAPL</div>
            </div>
          </div>
          <button
            onClick={() => {
              const event = new CustomEvent('navigate-to-page', { detail: 1 });
              window.dispatchEvent(event);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg am-card am-hover-surface am-text-primary border text-sm font-semibold"
          >
            去对话投顾
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
