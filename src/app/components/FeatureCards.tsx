import { motion } from 'motion/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Camera, HelpCircle, ShieldAlert, TrendingDown } from 'lucide-react';
import { loadUserProfileMemory } from '../services/userProfile';

const features = [
  {
    icon: Camera,
    title: '多模态隐式画像',
    description: '支持图片上传与 OCR 场景理解，结合问卷和对话形成本地画像证据',
  },
  {
    icon: TrendingDown,
    title: '动态风险洞察',
    description: '实时监测市场波动，精准评估投资组合风险水平',
  },
  {
    icon: HelpCircle,
    title: '可解释性白盒决策',
    description: '透明展示决策逻辑链，让每一个投资建议都有据可依',
  },
];

const portfolioSeries = [
  { day: 'D-14', value: 200000, risk: 48 },
  { day: 'D-12', value: 201600, risk: 50 },
  { day: 'D-10', value: 199800, risk: 55 },
  { day: 'D-8', value: 203400, risk: 52 },
  { day: 'D-6', value: 205100, risk: 58 },
  { day: 'D-4', value: 204300, risk: 54 },
  { day: 'D-2', value: 207200, risk: 57 },
  { day: '今天', value: 208600, risk: 56 },
];

const referenceHoldings = [
  { name: '贵州茅台', type: '消费龙头', weight: '28%', change: '+0.86%', risk: '中' },
  { name: '华安黄金ETF', type: '防御资产', weight: '22%', change: '+0.34%', risk: '中低' },
  { name: '沪深300', type: '宽基指数', weight: '35%', change: '+0.52%', risk: '中' },
  { name: '宁德时代', type: '成长卫星', weight: '15%', change: '+2.18%', risk: '中高' },
];

export function FeatureCards() {
  const profile = loadUserProfileMemory();

  return (
    <section className="w-full min-h-screen am-page-bg">
      <div className="w-full py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center am-text-primary mb-8 sm:mb-10 lg:mb-12"
        >
          核心功能
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <div className="relative am-card backdrop-blur-lg rounded-2xl p-6 sm:p-8 border am-hover-border-brand transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(196,69,54,0.2)]">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl am-feature-icon flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-all">
                    <Icon size={28} strokeWidth={1.7} className="am-feature-icon-glyph sm:w-8 sm:h-8" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold am-text-primary mb-2 sm:mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-sm sm:text-base am-text-secondary leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="absolute inset-0 rounded-2xl am-feature-glow opacity-0 group-hover:opacity-10 transition-opacity blur-xl" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl border am-card-strong p-4 sm:p-6"
        >
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full am-brand-soft am-brand px-3 py-1 text-xs font-semibold">
                <BarChart3 size={14} />
                Portfolio Monitor
              </div>
              <h3 className="mt-3 text-2xl font-bold am-text-primary">持仓动态监控</h3>
              <p className="mt-2 max-w-2xl text-sm am-text-secondary">
                默认本地账户的参考持仓，不连接真实券商账户；用于呈现收益走势、风险评分、波动提醒与画像联动。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs sm:min-w-[360px]">
              <div className="rounded-xl border am-card px-3 py-2">
                <div className="am-text-tertiary">账户</div>
                <div className="mt-1 font-semibold am-text-primary">本地账户</div>
              </div>
              <div className="rounded-xl border am-card px-3 py-2">
                <div className="am-text-tertiary">画像</div>
                <div className="mt-1 font-semibold am-brand">{profile.riskLevel}</div>
              </div>
              <div className="rounded-xl border am-card px-3 py-2">
                <div className="am-text-tertiary">风险分</div>
                <div className="mt-1 font-semibold am-text-primary">{Math.round(profile.riskScore)}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="rounded-xl border am-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold am-text-primary">近 14 天参考收益走势</div>
                  <div className="text-xs am-text-tertiary">账户 / 全资产 / 近两周</div>
                </div>
                <div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500">+4.3%</div>
              </div>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioSeries}>
                    <defs>
                      <linearGradient id="portfolioValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                    <Area type="monotone" dataKey="value" stroke="#22C55E" fill="url(#portfolioValue)" strokeWidth={2.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-500">
                  <ShieldAlert size={17} />
                  风险提醒
                </div>
                <p className="text-sm leading-6 am-text-secondary">
                  宁德时代参考仓位属于高弹性资产，当前占比 15%。以{profile.riskLevel}画像看，建议继续保持卫星仓位，不把情景推演理解为确定性收益。
                </p>
              </div>
              <div className="grid gap-2">
                {referenceHoldings.map((item) => (
                  <div key={item.name} className="rounded-xl border am-card p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold am-text-primary">{item.name}</div>
                        <div className="text-xs am-text-tertiary">{item.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold am-text-primary">{item.weight}</div>
                        <div className={item.change.startsWith('+') ? 'text-xs text-green-500' : 'text-xs text-red-500'}>{item.change}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs am-text-secondary">
                      <span>风险等级：{item.risk}</span>
                      <span>参考持仓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </section>
  );
}
