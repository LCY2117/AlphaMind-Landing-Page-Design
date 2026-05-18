import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type Time,
} from 'lightweight-charts';
import {
  ArrowUpRight,
  AlertTriangle,
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

function pointString(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function clampChartY(value: number) {
  return Math.max(7, Math.min(70, value));
}

function getSymbolSeed(symbol: string) {
  return symbol.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0);
}

function buildProbabilityConeShape(
  symbol: string,
  changeValue: number,
  probabilities: AssetXRayReport['probabilities'],
) {
  const seed = getSymbolSeed(symbol);
  const bullishTilt = (probabilities.up - probabilities.down) / 100;
  const volatility = Math.max(0.16, Math.min(0.58, (100 - probabilities.flat) / 100));
  const startY = clampChartY(60 - changeValue * 1.4 + ((seed % 9) - 4));
  const historySlope = -18 * bullishTilt - changeValue * 1.8 + ((seed % 13) - 6) * 0.45;
  const historyPoints = Array.from({ length: 10 }, (_, index) => {
    const progress = index / 9;
    const wave = Math.sin(progress * Math.PI * 2 + seed * 0.21) * (3.2 + volatility * 6);
    const pulse = Math.sin(progress * Math.PI * 5 + seed * 0.13) * (1.4 + volatility * 2.5);
    const y = startY + historySlope * progress + wave + pulse;
    return { x: index * 7, y: clampChartY(y) };
  });
  const anchor = historyPoints.at(-1) ?? { x: 63, y: 36 };
  const forecastX = [63, 72, 81, 90, 100];
  const forecastDrift = -22 * bullishTilt + ((seed % 7) - 3) * 0.65;
  const forecastWave = (index: number) => Math.sin((index + 1) * 0.9 + seed * 0.17) * (1.2 + volatility * 2.2);
  const midPoints = forecastX.map((x, index) => {
    const progress = index / (forecastX.length - 1);
    const y = anchor.y + forecastDrift * progress + forecastWave(index);
    return { x, y: clampChartY(y) };
  });
  const spreadBase = 7 + volatility * 17;
  const upperPoints = midPoints.map((point, index) => {
    const progress = index / (midPoints.length - 1);
    return { x: point.x, y: clampChartY(point.y - spreadBase * progress * (0.7 + probabilities.up / 100)) };
  });
  const lowerPoints = midPoints.map((point, index) => {
    const progress = index / (midPoints.length - 1);
    return { x: point.x, y: clampChartY(point.y + spreadBase * progress * (0.75 + probabilities.down / 100)) };
  });

  return {
    history: pointString(historyPoints),
    mid: pointString(midPoints),
    upper: pointString(upperPoints),
    lower: pointString(lowerPoints),
    upArea: `${pointString(upperPoints)} ${[...midPoints].reverse().map((point) => `${point.x},${point.y}`).join(' ')}`,
    downArea: `${pointString(midPoints)} ${[...lowerPoints].reverse().map((point) => `${point.x},${point.y}`).join(' ')}`,
  };
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

function SentimentPanel({
  analysis,
  score,
  label,
  active,
}: {
  analysis?: AssetXRayReport['sentimentAnalysis'];
  score: number;
  label: string;
  active: boolean;
}) {
  const displayScore = active ? analysis?.score ?? score : 0;
  const displayLabel = active ? analysis?.label ?? label : '等待扫描';
  const bearishShare = Math.max(0, Math.min(100, 100 - displayScore));
  const neutralShare = Math.max(8, 100 - Math.abs(displayScore - 50) * 2);
  const bullishShare = Math.max(0, Math.min(100, displayScore));
  const sourceLabel = analysis?.source === 'siliconflow'
    ? `AI 快模型 · ${analysis.model ?? 'SiliconFlow'}`
    : analysis?.source === 'rule'
      ? '规则兜底分析'
      : '样例分析';
  const confidence = active ? analysis?.confidence ?? 0 : 0;
  const summary = active
    ? analysis?.summary ?? `${label}，等待更多新闻与行情信号确认。`
    : '等待行情、K线与新闻文本完成同步。';
  const reasons = active ? analysis?.reasons?.slice(0, 4) ?? [] : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-xl border am-border-subtle am-card p-4">
        <div>
          <div className="text-xs am-text-tertiary">情绪指数</div>
          <div className="mt-1 flex items-end gap-2">
            <motion.span
              className="text-4xl font-bold am-text-primary tabular-nums"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: active ? 1 : 0.55, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {active ? displayScore : '--'}
            </motion.span>
            <span className="pb-1 text-sm font-semibold am-brand">{displayLabel}</span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between text-xs am-text-tertiary">
            <span>Bearish</span>
            <span>{sourceLabel}</span>
            <span>Bullish</span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full am-card border">
            <div className="absolute inset-y-0 left-0 bg-blue-500/70" style={{ width: `${bearishShare}%` }} />
            <div
              className="absolute inset-y-0 bg-amber-400/70"
              style={{ left: `${Math.max(0, 50 - neutralShare / 2)}%`, width: `${neutralShare}%` }}
            />
            <div className="absolute inset-y-0 right-0 bg-[#C44536]/80" style={{ width: `${bullishShare}%` }} />
            <motion.div
              className="absolute -top-1 h-5 w-0.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
              initial={{ left: '50%' }}
              animate={{ left: `${displayScore}%` }}
              transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg am-card border px-2 py-2">
              <div className="am-text-tertiary">空头压力</div>
              <div className="mt-1 font-semibold text-blue-400">{bearishShare}%</div>
            </div>
            <div className="rounded-lg am-card border px-2 py-2">
              <div className="am-text-tertiary">置信度</div>
              <div className="mt-1 font-semibold am-text-primary">{confidence}%</div>
            </div>
            <div className="rounded-lg am-card border px-2 py-2">
              <div className="am-text-tertiary">多头动能</div>
              <div className="mt-1 font-semibold text-[#C44536]">{bullishShare}%</div>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border am-border-subtle am-surface p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] am-text-tertiary">AI Sentiment Rationale</div>
          <span className="text-[11px] am-text-tertiary">{analysis?.updatedAt ?? '待同步'}</span>
        </div>
        <p className="text-sm leading-6 am-text-secondary">{summary}</p>
        {reasons.length > 0 && (
          <div className="mt-3 space-y-2">
            {reasons.map((reason, index) => (
              <div key={`${reason}-${index}`} className="flex items-start gap-2 text-sm am-text-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C44536]" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}
        {(analysis?.bullish?.length || analysis?.bearish?.length) && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
              <div className="mb-2 text-xs font-semibold text-green-500">看多依据</div>
              <div className="space-y-1.5">
                {(analysis?.bullish ?? []).slice(0, 2).map((item) => (
                  <p key={item} className="text-xs leading-5 am-text-secondary">{item}</p>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
              <div className="mb-2 text-xs font-semibold text-blue-400">风险压力</div>
              <div className="space-y-1.5">
                {(analysis?.bearish ?? []).slice(0, 2).map((item) => (
                  <p key={item} className="text-xs leading-5 am-text-secondary">{item}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProbabilityCone({
  active,
  report,
}: {
  active: boolean;
  report: AssetXRayReport;
}) {
  const { probabilities } = report;
  const shape = useMemo(
    () => buildProbabilityConeShape(report.symbol, report.changeValue, probabilities),
    [probabilities, report.changeValue, report.symbol],
  );

  return (
    <div className="min-h-[332px]">
      <div className="h-[252px] sm:h-[270px]">
        <svg viewBox="0 0 100 78" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        {[20, 35, 50, 65].map((y) => (
          <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="var(--am-chart-grid)" strokeWidth="0.35" strokeDasharray="2 3" />
        ))}
        <line x1="63" x2="63" y1="4" y2="72" stroke="var(--am-border-strong)" strokeWidth="0.45" strokeDasharray="2 2" />
        <text x="3" y="75" fontSize="3.2" fill="var(--am-text-tertiary)">历史走势</text>
        <text x="69" y="75" fontSize="3.2" fill="var(--am-text-tertiary)">AI 预测区间</text>

          <motion.polygon
          points={shape.upArea}
          fill="#22C55E"
          opacity={active ? 0.16 : 0}
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 0.16 : 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        />
        <motion.polygon
          points={shape.downArea}
          fill="#EF4444"
          opacity={active ? 0.12 : 0}
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 0.12 : 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        />
        <motion.polyline
          points={shape.history}
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
          points={shape.mid}
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
          points={shape.upper}
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
          points={shape.lower}
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
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg am-card border px-2 py-2.5 text-center">
          <div className="text-xs am-text-tertiary">上涨</div>
          <div className="text-sm font-bold text-green-500">{probabilities.up}%</div>
        </div>
        <div className="rounded-lg am-card border px-2 py-2.5 text-center">
          <div className="text-xs am-text-tertiary">横盘</div>
          <div className="text-sm font-bold text-amber-500">{probabilities.flat}%</div>
        </div>
        <div className="rounded-lg am-card border px-2 py-2.5 text-center">
          <div className="text-xs am-text-tertiary">下跌</div>
          <div className="text-sm font-bold text-red-500">{probabilities.down}%</div>
        </div>
      </div>
    </div>
  );
}

function getFinitePrice(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function formatChartPrice(value?: number) {
  if (value === undefined) return '--';
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatChartVolume(value?: number) {
  if (!value || !Number.isFinite(value)) return '--';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

function PriceKlineChart({
  active,
  report,
}: {
  active: boolean;
  report: AssetXRayReport;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [hoverPoint, setHoverPoint] = useState<NonNullable<AssetXRayReport['priceSeries']>[number] | null>(null);
  const [visibleRangeLabel, setVisibleRangeLabel] = useState('');

  const series = useMemo(
    () => (report.priceSeries ?? [])
      .filter((item) => Number.isFinite(item.close))
      .map((item, index) => ({
        ...item,
        chartTime: (item.time ?? item.date ?? String(index)) as Time,
      })),
    [report.priceSeries],
  );

  const byTime = useMemo(() => {
    const map = new Map<string, (typeof series)[number]>();
    series.forEach((item) => map.set(String(item.chartTime), item));
    return map;
  }, [series]);

  const latest = series.at(-1);
  const first = series[0];
  const activePoint = hoverPoint ?? latest;
  const periodChange = latest && first && first.close > 0
    ? ((latest.close - first.close) / first.close) * 100
    : report.changeValue;

  const setVisibleBars = (bars?: number) => {
    const chart = chartRef.current;
    if (!chart || series.length === 0) return;

    const to = Math.max(0, series.length - 1);
    const from = bars && bars < series.length ? Math.max(0, series.length - bars) : 0;
    chart.timeScale().setVisibleLogicalRange({ from, to });
    setVisibleRangeLabel(`${from + 1}-${to + 1} / ${series.length} 条日线`);
    setHoverPoint(null);
  };

  useEffect(() => {
    if (!containerRef.current || series.length === 0) return;

    const computedStyle = getComputedStyle(document.documentElement);
    const textColor = computedStyle.getPropertyValue('--am-chart-axis').trim() || 'rgba(255,255,255,0.56)';
    const gridColor = computedStyle.getPropertyValue('--am-chart-grid').trim() || 'rgba(255,255,255,0.08)';
    const borderColor = computedStyle.getPropertyValue('--am-border-subtle').trim() || 'rgba(255,255,255,0.12)';

    const chart = createChart(containerRef.current, {
      autoSize: true,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: gridColor, style: LineStyle.Dotted, visible: true },
        horzLines: { color: gridColor, style: LineStyle.Dotted, visible: true },
      },
      rightPriceScale: {
        borderColor,
        scaleMargins: { top: 0.08, bottom: 0.26 },
      },
      timeScale: {
        borderColor,
        timeVisible: false,
        secondsVisible: false,
        rightOffset: 2,
        barSpacing: 8,
        minBarSpacing: 3,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(245, 158, 11, 0.7)',
          width: 1,
          style: LineStyle.Dashed,
          visible: true,
          labelVisible: true,
          labelBackgroundColor: '#C44536',
        },
        horzLine: {
          color: 'rgba(245, 158, 11, 0.55)',
          width: 1,
          style: LineStyle.Dashed,
          visible: true,
          labelVisible: true,
          labelBackgroundColor: '#C44536',
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
        axisDoubleClickReset: true,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderUpColor: '#22C55E',
      borderDownColor: '#EF4444',
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
      priceLineColor: '#F59E0B',
      lastValueVisible: true,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    });
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      base: 0,
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });

    const candleData: CandlestickData[] = series.map((item) => {
      const open = getFinitePrice(item.open) ?? item.close;
      const high = getFinitePrice(item.high) ?? Math.max(open, item.close);
      const low = getFinitePrice(item.low) ?? Math.min(open, item.close);
      return {
        time: item.chartTime,
        open,
        high,
        low,
        close: item.close,
      };
    });
    const volumeData: HistogramData[] = series.map((item) => {
      const open = getFinitePrice(item.open) ?? item.close;
      return {
        time: item.chartTime,
        value: item.volume ?? 0,
        color: item.close >= open ? 'rgba(34,197,94,0.34)' : 'rgba(239,68,68,0.34)',
      };
    });

    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);
    chart.timeScale().setVisibleLogicalRange({
      from: Math.max(0, series.length - 54),
      to: Math.max(0, series.length - 1),
    });

    const updateRangeLabel = () => {
      const range = chart.timeScale().getVisibleLogicalRange();
      if (!range) {
        setVisibleRangeLabel(`${series.length} 条日线`);
        return;
      }
      const from = Math.max(0, Math.floor(range.from));
      const to = Math.min(series.length - 1, Math.ceil(range.to));
      setVisibleRangeLabel(`${from + 1}-${to + 1} / ${series.length} 条日线`);
    };

    const handleCrosshairMove = (param: MouseEventParams<Time>) => {
      if (!param.time) {
        setHoverPoint(null);
        return;
      }
      setHoverPoint(byTime.get(String(param.time)) ?? null);
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);
    updateRangeLabel();
    chart.timeScale().subscribeVisibleLogicalRangeChange(updateRangeLabel);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(updateRangeLabel);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [byTime, report.symbol, series]);

  if (!latest) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed am-border-subtle am-card px-5 text-center">
        <div>
          <LineChart size={30} className="mx-auto mb-3 am-text-tertiary" />
          <div className="text-sm font-semibold am-text-primary">K线待同步</div>
          <p className="mt-2 text-xs leading-5 am-text-secondary">
            当前数据源没有返回可绘制的 OHLC 日线，接入 Twelve Data 或 QuantDinger K线后会自动显示。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded-lg am-card border px-3 py-2">
          <div className="text-[11px] am-text-tertiary">{hoverPoint ? `${hoverPoint.date} 收盘` : '最新收盘'}</div>
          <div className="mt-1 text-sm font-bold am-text-primary">${formatChartPrice(activePoint?.close)}</div>
        </div>
        <div className="rounded-lg am-card border px-3 py-2">
          <div className="text-[11px] am-text-tertiary">区间涨跌</div>
          <div className={`mt-1 text-sm font-bold ${periodChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {periodChange >= 0 ? '+' : ''}{periodChange.toFixed(2)}%
          </div>
        </div>
        <div className="rounded-lg am-card border px-3 py-2">
          <div className="text-[11px] am-text-tertiary">高 / 低</div>
          <div className="mt-1 text-sm font-bold am-text-primary">
            ${formatChartPrice(activePoint?.high ?? activePoint?.close)} / ${formatChartPrice(activePoint?.low ?? activePoint?.close)}
          </div>
        </div>
        <div className="rounded-lg am-card border px-3 py-2">
          <div className="text-[11px] am-text-tertiary">成交量</div>
          <div className="mt-1 text-sm font-bold am-text-primary">{formatChartVolume(activePoint?.volume)}</div>
        </div>
      </div>
      <div className={`relative rounded-xl border am-border-subtle am-card p-2 transition-opacity ${active ? 'opacity-100' : 'opacity-80'}`}>
        <div ref={containerRef} className="h-[420px] w-full" />
        {activePoint && (
          <div className="pointer-events-none absolute left-4 top-4 rounded-lg border am-border-subtle bg-[color-mix(in_srgb,var(--am-surface-strong)_88%,transparent)] px-3 py-2 text-xs shadow-lg backdrop-blur-md">
            <div className="mb-1 font-semibold am-text-primary">{activePoint.date}</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 am-text-secondary">
              <span>开 {formatChartPrice(activePoint.open ?? activePoint.close)}</span>
              <span>高 {formatChartPrice(activePoint.high ?? activePoint.close)}</span>
              <span>低 {formatChartPrice(activePoint.low ?? activePoint.close)}</span>
              <span>收 {formatChartPrice(activePoint.close)}</span>
              <span className="col-span-2">量 {formatChartVolume(activePoint.volume)}</span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3 text-xs am-text-tertiary sm:justify-start">
          <span>{visibleRangeLabel || `${series.length} 条日线`}</span>
          <span>鼠标悬停查看 OHLC，拖动查看历史，滚轮缩放横轴</span>
          <span>{latest.date}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleBars(28)}
            className="inline-flex items-center gap-1 rounded-lg border am-card am-hover-surface px-2.5 py-1.5 text-xs am-text-secondary"
          >
            近 1 月
          </button>
          <button
            type="button"
            onClick={() => setVisibleBars(54)}
            className="inline-flex items-center gap-1 rounded-lg border am-card am-hover-surface px-2.5 py-1.5 text-xs am-text-secondary"
          >
            近 3 月
          </button>
          <button
            type="button"
            onClick={() => setVisibleBars()}
            className="inline-flex items-center gap-1 rounded-lg border am-card am-hover-surface px-2.5 py-1.5 text-xs am-text-secondary"
          >
            全部
          </button>
        </div>
      </div>
    </div>
  );
}

function NewsFeed({ report }: { report: AssetXRayReport }) {
  const newsItems = report.newsItems ?? [];

  if (newsItems.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed am-border-subtle am-card px-5 text-center">
        <div>
          <Newspaper size={30} className="mx-auto mb-3 am-text-tertiary" />
          <div className="text-sm font-semibold am-text-primary">新闻待同步</div>
          <p className="mt-2 text-xs leading-5 am-text-secondary">
            当前标的没有返回新闻列表；接入 NewsAPI 或后续公告源后会在这里展示。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {newsItems.slice(0, 5).map((item, index) => {
        const content = (
          <>
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-semibold leading-5 am-text-primary">{item.title}</h4>
              {item.url && <ArrowUpRight size={14} className="mt-0.5 shrink-0 am-text-tertiary" />}
            </div>
            {item.description && (
              <p className="mt-2 line-clamp-2 text-xs leading-5 am-text-secondary">{item.description}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] am-text-tertiary">
              <span>{item.source ?? 'News'}</span>
              {item.publishedAt && <span>{item.publishedAt}</span>}
            </div>
          </>
        );

        return item.url ? (
          <a
            key={`${item.title}-${index}`}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl border am-card p-3 transition-all hover:border-[#C44536]/40"
          >
            {content}
          </a>
        ) : (
          <div key={`${item.title}-${index}`} className="rounded-xl border am-card p-3">
            {content}
          </div>
        );
      })}
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
  const [scanValues, setScanValues] = useState([88, 64, 91]);
  const [typedConclusion, setTypedConclusion] = useState('');
  const scanCompletionTimer = useRef<number | null>(null);
  const activeRequestRef = useRef(0);

  const isScanning = scanState === 'scanning';
  const isComplete = scanState === 'complete';

  const providerStatus = useMemo(() => {
    if (stock.providerMeta.mode === 'marketdata' && stock.providerMeta.status === 'ok') {
      return {
        label: '已连接真实行情源',
        detail: '行情、日线与新闻来自后端安全代理',
        className: 'border-green-500/30 bg-green-500/10 text-green-500',
      };
    }

    if (stock.providerMeta.mode === 'quantdinger' && stock.providerMeta.status === 'ok') {
      return {
        label: '已连接 QuantDinger',
        detail: '行情与 K 线来自后端数据通道',
        className: 'border-green-500/30 bg-green-500/10 text-green-500',
      };
    }

    if (stock.providerMeta.status === 'fallback') {
      return {
        label: '服务未连接 · 演示回退',
        detail: '当前不会输出伪实时行情',
        className: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
      };
    }

    return {
      label: '本地演示数据',
      detail: '用于展示交互与分析结构',
      className: 'am-card am-text-secondary',
    };
  }, [stock.providerMeta.mode, stock.providerMeta.status]);

  const coverageText: Record<AssetXRayReport['providerMeta']['coverage'][number]['value'], string> = {
    live: '实时/后端',
    mock: '演示',
    derived: '规则估算',
    pending: '待同步',
  };

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
        Math.floor(62 + Math.random() * 34),
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
                输入股票代码，查看真实日线走势、新闻线索、估值吸引力、成长、盈利、情绪、动量与预测区间；未接入实时源时会明确标注演示数据。
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
                  {isScanning ? '扫描中' : '生成研究视图'}
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
              <div className="mt-4 rounded-xl am-card border p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-full border px-2.5 py-1 font-semibold ${providerStatus.className}`}>
                        {providerStatus.label}
                      </span>
                      <span className="am-text-tertiary">{stock.providerMeta.freshnessLabel}</span>
                    </div>
                    <p className="mt-2 text-xs am-text-secondary">
                      {providerStatus.detail} · 来源：{stock.providerMeta.source}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {stock.providerMeta.coverage.map((item) => (
                      <span key={item.label} className="rounded-full border am-border-subtle px-2 py-1 am-text-tertiary">
                        {item.label}: {coverageText[item.value]}
                      </span>
                    ))}
                  </div>
                </div>
                {stock.providerMeta.message && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    {stock.providerMeta.message}
                  </div>
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
                  <span className="text-xs am-text-tertiary">0-100 分 · 越高代表该维度越强</span>
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
                  <span className="text-xs am-text-tertiary">
                    {stock.sentimentAnalysis?.source === 'siliconflow' ? '硅基流动快模型' : '行情/文本情绪'}
                  </span>
                </div>
                <SentimentPanel
                  analysis={stock.sentimentAnalysis}
                  score={stock.sentiment}
                  label={stock.sentimentLabel}
                  active={isComplete}
                />
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
                  <div className={`text-sm font-semibold ${stock.change === '--' ? 'am-text-tertiary' : stock.changeValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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

        <div className="grid items-start lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] gap-6 mt-6">
          <div className="space-y-6">
            <div className="am-card border rounded-2xl p-4 sm:p-6 relative overflow-hidden">
              {isScanning && <AnalysisSkeleton values={scanValues} />}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold am-text-primary flex items-center gap-2">
                  <LineChart size={18} className="text-[#C44536]" />
                  真实 K线走势
                </h3>
                <span className="text-xs am-text-tertiary">
                  {stock.providerMeta.mode === 'mock' ? '样例 OHLC 日线' : '后端行情源 · OHLC 日线'}
                </span>
              </div>
              <PriceKlineChart active={isComplete} report={stock} />
            </div>

            <div className="am-card border rounded-2xl p-4 sm:p-6 relative overflow-hidden">
              {isScanning && <AnalysisSkeleton values={scanValues} />}
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-base sm:text-lg font-semibold am-text-primary flex items-center gap-2">
                  <LineChart size={18} className="text-[#C44536]" />
                  AI 概率预测锥
                </h3>
                <span className="text-xs am-text-tertiary">20 个交易日 · 派生预测</span>
              </div>
              <ProbabilityCone active={isComplete} report={stock} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="am-card border rounded-2xl p-5 sm:p-6 relative overflow-hidden">
              {isScanning && <AnalysisSkeleton values={scanValues} />}
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-base sm:text-lg font-semibold am-text-primary flex items-center gap-2">
                  <Newspaper size={18} className="text-[#C44536]" />
                  新闻情绪线索
                </h3>
                <span className="text-xs am-text-tertiary">{stock.newsItems?.length ?? 0} 条</span>
              </div>
              <NewsFeed report={stock} />
            </div>

            <div className="am-card border rounded-2xl p-5 sm:p-6 relative overflow-hidden">
              {isScanning && <AnalysisSkeleton values={scanValues} />}
              <div className="flex items-center gap-2 mb-4">
                <Brain size={20} className="text-[#C44536]" />
                <h3 className="text-base sm:text-lg font-semibold am-text-primary">辅助研究结论</h3>
              </div>
              <div className="rounded-xl am-brand-soft border am-border-brand p-4 mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold am-brand">
                  <Sparkles size={16} />
                  {isComplete ? '研究视图已生成' : '等待输出'}
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
                该结果为辅助研究视图，不构成投资建议
              </div>
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
