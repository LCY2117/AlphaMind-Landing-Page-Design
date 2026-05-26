import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Filter,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getMockAssetXRayReport } from '../services/assetXRay';
import { loadUserProfileMemory } from '../services/userProfile';

type AccountFilter = 'all' | 'local-main' | 'steady' | 'growth';
type AssetTypeFilter = 'all' | 'equity' | 'etf' | 'defense' | 'cash';
type RangeFilter = '7d' | '30d' | '90d';

const accountOptions: Array<{ value: AccountFilter; label: string }> = [
  { value: 'all', label: '全部账户' },
  { value: 'local-main', label: '本地账户' },
  { value: 'steady', label: '稳健组合' },
  { value: 'growth', label: '成长观察' },
];

const assetTypeOptions: Array<{ value: AssetTypeFilter; label: string }> = [
  { value: 'all', label: '全部资产' },
  { value: 'equity', label: '股票' },
  { value: 'etf', label: 'ETF/指数' },
  { value: 'defense', label: '防御资产' },
  { value: 'cash', label: '现金类' },
];

const rangeOptions: Array<{ value: RangeFilter; label: string }> = [
  { value: '7d', label: '近 7 日' },
  { value: '30d', label: '近 30 日' },
  { value: '90d', label: '近 90 日' },
];

const holdings = [
  { account: 'local-main', symbol: '600519', name: '贵州茅台', type: 'equity', typeLabel: '股票', value: 58200, cost: 55200, weight: 28, dayChange: 0.86, risk: 58 },
  { account: 'steady', symbol: '518880', name: '华安黄金ETF', type: 'defense', typeLabel: '防御资产', value: 45600, cost: 43100, weight: 22, dayChange: 0.34, risk: 42 },
  { account: 'steady', symbol: 'CSI300', name: '沪深300', type: 'etf', typeLabel: 'ETF/指数', value: 72800, cost: 69800, weight: 35, dayChange: 0.52, risk: 52 },
  { account: 'growth', symbol: '300750', name: '宁德时代', type: 'equity', typeLabel: '股票', value: 31200, cost: 33800, weight: 15, dayChange: 2.18, risk: 71 },
  { account: 'local-main', symbol: 'CASH', name: '现金备用金', type: 'cash', typeLabel: '现金类', value: 21000, cost: 21000, weight: 10, dayChange: 0.02, risk: 12 },
];

const seriesByRange: Record<RangeFilter, Array<{ day: string; value: number | null; predicted: number; risk: number }>> = {
  '7d': [
    { day: 'D-6', value: 224000, predicted: 224000, risk: 50 },
    { day: 'D-5', value: 225600, predicted: 225100, risk: 52 },
    { day: 'D-4', value: 224800, predicted: 226200, risk: 56 },
    { day: 'D-3', value: 227400, predicted: 227100, risk: 54 },
    { day: 'D-2', value: 228200, predicted: 228000, risk: 55 },
    { day: 'D-1', value: 227900, predicted: 229000, risk: 57 },
    { day: '今天', value: 228800, predicted: 229600, risk: 56 },
  ],
  '30d': [
    { day: 'W-4', value: 217000, predicted: 217000, risk: 47 },
    { day: 'W-3', value: 219600, predicted: 220200, risk: 50 },
    { day: 'W-2', value: 222300, predicted: 223400, risk: 53 },
    { day: 'W-1', value: 225900, predicted: 226500, risk: 55 },
    { day: '今天', value: 228800, predicted: 230200, risk: 56 },
    { day: '+1W', value: null, predicted: 231400, risk: 58 },
    { day: '+2W', value: null, predicted: 232100, risk: 59 },
  ],
  '90d': [
    { day: 'M-3', value: 204000, predicted: 204000, risk: 45 },
    { day: 'M-2', value: 210800, predicted: 211400, risk: 48 },
    { day: 'M-1', value: 221600, predicted: 222400, risk: 53 },
    { day: '今天', value: 228800, predicted: 230000, risk: 56 },
    { day: '+1M', value: null, predicted: 233600, risk: 58 },
    { day: '+2M', value: null, predicted: 236200, risk: 61 },
    { day: '+3M', value: null, predicted: 238100, risk: 63 },
  ],
};

const riskRadar = [
  { subject: '集中度', value: 56 },
  { subject: '波动率', value: 58 },
  { subject: '流动性', value: 82 },
  { subject: '情绪风险', value: 52 },
  { subject: '回撤压力', value: 46 },
  { subject: '画像匹配', value: 74 },
];

const formatCurrency = (value: number) =>
  `¥${Math.round(value).toLocaleString('zh-CN')}`;

function FilterSegment<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold am-text-tertiary">{label}</div>
      <div className="flex flex-wrap gap-1 rounded-xl border am-border-subtle am-input-surface p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
              value === option.value ? 'am-brand-bg am-on-brand' : 'am-text-secondary am-hover-surface'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PortfolioMonitor() {
  const profile = loadUserProfileMemory();
  const [account, setAccount] = useState<AccountFilter>('all');
  const [assetType, setAssetType] = useState<AssetTypeFilter>('all');
  const [range, setRange] = useState<RangeFilter>('30d');
  const [query, setQuery] = useState('');

  const filteredHoldings = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return holdings.filter((item) => {
      const accountMatched = account === 'all' || item.account === account;
      const typeMatched = assetType === 'all' || item.type === assetType;
      const keywordMatched = !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.symbol.toLowerCase().includes(keyword) ||
        item.typeLabel.toLowerCase().includes(keyword);
      return accountMatched && typeMatched && keywordMatched;
    });
  }, [account, assetType, query]);

  const totalValue = filteredHoldings.reduce((sum, item) => sum + item.value, 0);
  const totalCost = filteredHoldings.reduce((sum, item) => sum + item.cost, 0);
  const totalProfit = totalValue - totalCost;
  const profitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const weightedRisk = filteredHoldings.length
    ? Math.round(filteredHoldings.reduce((sum, item) => sum + item.risk * item.value, 0) / totalValue)
    : 0;
  const allocation = filteredHoldings.map((item) => ({
    name: item.name,
    value: item.value,
    color: item.type === 'defense' ? '#F59E0B' : item.type === 'cash' ? '#64748B' : item.type === 'etf' ? '#22C55E' : '#C44536',
  }));
  const topRiskHolding = filteredHoldings.reduce((max, item) => item.risk > max.risk ? item : max, filteredHoldings[0] ?? holdings[0]);
  const topReport = getMockAssetXRayReport(topRiskHolding.symbol === 'CASH' ? '518880' : topRiskHolding.symbol);

  return (
    <section className="min-h-screen am-page-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full am-brand-soft am-brand px-3 py-1 text-xs font-semibold">
              <BriefcaseBusiness size={14} />
              Portfolio Intelligence
            </div>
            <h2 className="mt-3 text-3xl font-bold am-text-primary">持仓动态监控</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 am-text-secondary">
              按账户、资产类型和时间范围筛选本地参考持仓，查看收益走势预测、风险评分、仓位集中度与画像匹配度。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[420px]">
            <div className="rounded-xl border am-card px-3 py-2">
              <div className="text-[11px] am-text-tertiary">用户画像</div>
              <div className="mt-1 text-sm font-semibold am-brand">{profile.riskLevel}</div>
            </div>
            <div className="rounded-xl border am-card px-3 py-2">
              <div className="text-[11px] am-text-tertiary">风险分</div>
              <div className="mt-1 text-sm font-semibold am-text-primary">{Math.round(profile.riskScore)}/100</div>
            </div>
            <div className="rounded-xl border am-card px-3 py-2">
              <div className="text-[11px] am-text-tertiary">监控资产</div>
              <div className="mt-1 text-sm font-semibold am-text-primary">{filteredHoldings.length} 项</div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border am-card-strong p-4"
        >
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold am-text-primary">
            <Filter size={17} className="am-brand" />
            多维筛选
          </div>
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_280px]">
            <FilterSegment label="账户" value={account} options={accountOptions} onChange={setAccount} />
            <FilterSegment label="资产类型" value={assetType} options={assetTypeOptions} onChange={setAssetType} />
            <FilterSegment label="时间范围" value={range} options={rangeOptions} onChange={setRange} />
            <div>
              <div className="mb-2 text-xs font-semibold am-text-tertiary">精准查询</div>
              <div className="flex h-[42px] items-center gap-2 rounded-xl border am-border-subtle am-input-surface px-3">
                <Search size={16} className="am-text-tertiary" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索名称 / 代码"
                  className="min-w-0 flex-1 bg-transparent text-sm am-text-primary am-placeholder focus:outline-none"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: '总资产', value: formatCurrency(totalValue), icon: BriefcaseBusiness, tone: 'am-text-primary' },
            { label: '累计收益', value: `${totalProfit >= 0 ? '+' : ''}${formatCurrency(totalProfit)}`, icon: totalProfit >= 0 ? ArrowUpRight : ArrowDownRight, tone: totalProfit >= 0 ? 'text-green-500' : 'text-red-500' },
            { label: '收益率', value: `${profitRate >= 0 ? '+' : ''}${profitRate.toFixed(2)}%`, icon: TrendingUp, tone: profitRate >= 0 ? 'text-green-500' : 'text-red-500' },
            { label: '组合风险', value: `${weightedRisk}/100`, icon: ShieldAlert, tone: weightedRisk > 65 ? 'text-amber-500' : 'am-brand' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border am-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs am-text-tertiary">{item.label}</div>
                  <Icon size={18} className={item.tone} />
                </div>
                <div className={`mt-3 text-2xl font-bold ${item.tone}`}>{item.value}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div className="rounded-2xl border am-card-strong p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold am-text-primary">
                  <BarChart3 size={17} className="am-brand" />
                  收益走势预测
                </div>
                <p className="mt-1 text-xs am-text-tertiary">实线为历史账户净值，预测线基于当前持仓、情绪和风险画像生成。</p>
              </div>
              <span className="rounded-full am-brand-soft px-3 py-1 text-xs font-semibold am-brand">
                基准情景 +{Math.max(0.8, profitRate / 3).toFixed(1)}%
              </span>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seriesByRange[range]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--am-chart-grid)" />
                  <XAxis dataKey="day" stroke="var(--am-chart-axis)" style={{ fontSize: '11px' }} />
                  <YAxis stroke="var(--am-chart-axis)" style={{ fontSize: '11px' }} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--am-tooltip-bg)',
                      border: '1px solid var(--am-border-subtle)',
                      borderRadius: '8px',
                      color: 'var(--am-text-primary)',
                    }}
                  />
                  <Line type="monotone" dataKey="value" name="历史净值" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
                  <Line type="monotone" dataKey="predicted" name="预测区间中枢" stroke="#C44536" strokeWidth={2.3} strokeDasharray="5 5" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border am-card-strong p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold am-text-primary">
                <SlidersHorizontal size={17} className="am-brand" />
                仓位结构
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={46} outerRadius={78} paddingAngle={2}>
                      {allocation.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: 'var(--am-tooltip-bg)',
                        border: '1px solid var(--am-border-subtle)',
                        borderRadius: '8px',
                        color: 'var(--am-text-primary)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border am-card-strong p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold am-text-primary">
                <Activity size={17} className="am-brand" />
                风险雷达
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={riskRadar}>
                    <PolarGrid stroke="var(--am-chart-grid)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--am-chart-axis)', fontSize: 11 }} />
                    <Radar dataKey="value" stroke="#C44536" fill="#C44536" fillOpacity={0.24} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-2xl border am-card-strong">
            <div className="border-b am-border-subtle px-4 py-3">
              <div className="text-sm font-semibold am-text-primary">持仓明细</div>
              <div className="text-xs am-text-tertiary">支持按账户、资产类型、时间范围和关键词筛选</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b am-border-subtle am-text-tertiary">
                    <th className="px-4 py-3 text-left font-medium">资产</th>
                    <th className="px-4 py-3 text-left font-medium">账户</th>
                    <th className="px-4 py-3 text-left font-medium">类型</th>
                    <th className="px-4 py-3 text-right font-medium">市值</th>
                    <th className="px-4 py-3 text-right font-medium">收益率</th>
                    <th className="px-4 py-3 text-right font-medium">日变动</th>
                    <th className="px-4 py-3 text-right font-medium">风险</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHoldings.map((item) => {
                    const itemProfit = ((item.value - item.cost) / item.cost) * 100;
                    return (
                      <tr key={`${item.account}-${item.symbol}`} className="border-b am-border-subtle last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-semibold am-text-primary">{item.name}</div>
                          <div className="text-xs am-text-tertiary">{item.symbol}</div>
                        </td>
                        <td className="px-4 py-3 am-text-secondary">{accountOptions.find((option) => option.value === item.account)?.label}</td>
                        <td className="px-4 py-3 am-text-secondary">{item.typeLabel}</td>
                        <td className="px-4 py-3 text-right font-semibold am-text-primary">{formatCurrency(item.value)}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${itemProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {itemProfit >= 0 ? '+' : ''}{itemProfit.toFixed(2)}%
                        </td>
                        <td className={`px-4 py-3 text-right ${item.dayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {item.dayChange >= 0 ? '+' : ''}{item.dayChange.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`rounded-full px-2 py-1 text-xs ${item.risk > 65 ? 'bg-amber-500/10 text-amber-500' : 'am-brand-soft am-brand'}`}>
                            {item.risk}/100
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-500">
              <ShieldAlert size={17} />
              AI 风险提示
            </div>
            <p className="text-sm leading-6 am-text-secondary">
              当前筛选结果中，{topRiskHolding.name} 是风险贡献最高的资产。结合您的{profile.riskLevel}画像，建议将其作为
              {topRiskHolding.risk > 65 ? '卫星仓位继续观察' : '组合稳定器跟踪'}，并关注 {topReport.catalysts.slice(0, 2).join('、')}。
            </p>
            <div className="mt-4 space-y-2">
              {[
                `组合加权风险为 ${weightedRisk}/100，仍处在${weightedRisk > 65 ? '偏高' : '可控'}区间。`,
                `预测线显示 ${rangeOptions.find((item) => item.value === range)?.label} 基准情景仍有小幅上行，但需防止单一资产波动放大回撤。`,
                '以上为本地参考持仓监控，不连接真实券商账户，不构成任何投资建议。',
              ].map((item) => (
                <div key={item} className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs leading-5 am-text-secondary">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
