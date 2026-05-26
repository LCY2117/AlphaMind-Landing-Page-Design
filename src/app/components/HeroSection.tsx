import { CSSProperties, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, ArrowUpRight, Brain, Search, Shield, Target, TrendingUp } from 'lucide-react';
import { DataStream, HexGrid } from './TechVisualization';
import { useAuth } from '../contexts/AuthContext';
import { getMockAssetXRayReport, normalizeAssetSymbol } from '../services/assetXRay';
import {
  getPersonalizedResearchCandidates,
  getProfileEvidence,
  loadUserProfileMemory,
  recordAssetInterest,
  type UserProfileMemory,
} from '../services/userProfile';

const satellites = [
  {
    id: 'asset',
    label: '资产',
    subtitle: 'Asset',
    icon: TrendingUp,
    left: 66,
    top: 18,
    size: '5.75rem',
    color: '#38BDF8',
    glow: 'rgba(56, 189, 248, 0.34)',
    path: 'M50 52 C58 40 58 25 66 18',
    delay: 0,
  },
  {
    id: 'behavior',
    label: '行为',
    subtitle: 'Behavior',
    icon: Activity,
    left: 22,
    top: 70,
    size: '5.1rem',
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.3)',
    path: 'M50 52 C38 58 34 68 22 70',
    delay: 0.24,
  },
  {
    id: 'intent',
    label: '意图',
    subtitle: 'Intent',
    icon: Target,
    left: 83,
    top: 64,
    size: '4.85rem',
    color: '#A78BFA',
    glow: 'rgba(167, 139, 250, 0.28)',
    path: 'M50 52 C62 57 70 66 83 64',
    delay: 0.46,
  },
  {
    id: 'security',
    label: '安全',
    subtitle: 'Security',
    icon: Shield,
    left: 18,
    top: 32,
    size: '4.6rem',
    color: '#34D399',
    glow: 'rgba(52, 211, 153, 0.26)',
    path: 'M50 52 C39 45 30 34 18 32',
    delay: 0.66,
  },
];

const orbitPaths = [
  'M20 56 C26 20 62 8 84 32 C108 58 66 88 32 78 C18 74 14 66 20 56Z',
  'M13 42 C25 16 70 17 88 46 C103 72 70 88 43 83 C16 78 2 60 13 42Z',
  'M30 22 C55 0 96 23 88 55 C79 90 32 95 16 64 C8 47 16 34 30 22Z',
];

function CognitiveTopology() {
  return (
    <div className="relative w-full aspect-square max-w-[320px] sm:max-w-[430px] lg:max-w-[500px] mx-auto">
      <div className="absolute inset-4 rounded-[2rem] border am-border-subtle am-card backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]" />
      <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(196,69,54,0.24),rgba(56,189,248,0.07)_32%,transparent_62%)] blur-2xl" />
      <div className="absolute inset-0 opacity-45">
        <HexGrid />
      </div>
      <div className="absolute inset-0 opacity-55 mix-blend-screen">
        <DataStream />
      </div>

      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="coreNebula" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="32%" stopColor="#F97316" stopOpacity="0.82" />
            <stop offset="70%" stopColor="#C44536" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C44536" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="dataLineWarm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.06" />
            <stop offset="45%" stopColor="#F97316" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {orbitPaths.map((path, index) => (
          <path
            key={path}
            d={path}
            fill="none"
            stroke={index === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)'}
            strokeWidth={index === 0 ? 0.32 : 0.22}
            strokeDasharray={index === 0 ? '2.5 4.5' : '1.2 5.4'}
            pathLength={1}
            style={{
              animation: `alphamind-orbit-pulse ${6 + index * 1.2}s ease-in-out ${index * 0.4}s infinite`,
            }}
          />
        ))}

        <circle
          cx="50"
          cy="52"
          r="21"
          fill="url(#coreNebula)"
          style={{
            animation: 'alphamind-nebula-breathe 3.4s ease-in-out infinite',
            transformOrigin: '50% 52%',
          }}
        />

        {satellites.map((node) => (
          <g key={`line-${node.id}`}>
            <path
              d={node.path}
              fill="none"
              stroke="url(#dataLineWarm)"
              strokeWidth="0.55"
              strokeLinecap="round"
              opacity="0.42"
            />
            <path
              d={node.path}
              fill="none"
              stroke={node.color}
              strokeWidth="0.82"
              strokeLinecap="round"
              strokeDasharray="6 86"
              style={{
                animation: `alphamind-data-flow 2.2s ease-in-out ${node.delay}s infinite`,
              }}
              opacity="0.9"
              filter="drop-shadow(0 0 5px currentColor)"
            />
          </g>
        ))}
      </svg>

      <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2">
        <div
          className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.95),rgba(249,115,22,0.74)_24%,rgba(196,69,54,0.94)_58%,rgba(80,28,22,0.94)_100%)]"
          style={{ animation: 'alphamind-core-pulse 3.2s ease-in-out infinite' }}
        >
          <Brain size={46} strokeWidth={1.25} className="text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]" />
          <div
            className="absolute inset-0 rounded-full border border-white/35"
            style={{ animation: 'alphamind-pulse-ring 2.8s ease-out infinite' }}
          />
          <div
            className="absolute inset-2 rounded-full border border-orange-200/30"
            style={{ animation: 'alphamind-spin 12s linear infinite' }}
          />
          <div className="absolute -bottom-9 text-center">
            <div className="text-xs font-medium tracking-[0.18em] text-white/90">AI CORE</div>
            <div className="mt-1 h-px w-14 bg-gradient-to-r from-transparent via-orange-300/80 to-transparent" />
          </div>
        </div>
      </div>

      {satellites.map((node, index) => {
        const Icon = node.icon;

        return (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${node.left}%`, top: `${node.top}%` }}
          >
            <div
              className="relative flex flex-col items-center justify-center rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.035))] backdrop-blur-xl"
              style={{
                '--float-y': `${index % 2 === 0 ? -8 : 8}px`,
                animation: `alphamind-satellite-float ${4.2 + index * 0.4}s ease-in-out ${node.delay}s infinite`,
                width: node.size,
                height: node.size,
                boxShadow: `0 0 28px ${node.glow}, inset 0 0 18px rgba(255,255,255,0.1), inset 0 -14px 24px rgba(0,0,0,0.22)`,
              } as CSSProperties}
            >
              <div
                className="absolute inset-0 rounded-full opacity-65"
                style={{
                  background: `radial-gradient(circle at 35% 25%, rgba(255,255,255,0.36), transparent 30%), radial-gradient(circle at 50% 65%, ${node.glow}, transparent 66%)`,
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `1px solid ${node.color}33`,
                  outline: `1px dashed ${node.color}22`,
                  outlineOffset: '6px',
                }}
              />
              <Icon size={24} strokeWidth={1.25} className="relative z-10 mb-1" style={{ color: node.color }} />
              <div className="relative z-10 text-center leading-none">
                <div className="text-[11px] font-medium text-white/82">{node.label}</div>
                <div className="mt-1 text-[8px] uppercase tracking-[0.16em] text-white/38">{node.subtitle}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function HeroSection() {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [profile, setProfile] = useState<UserProfileMemory>(() => loadUserProfileMemory());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const refreshProfile = () => setProfile(loadUserProfileMemory());
    window.addEventListener('alphamind-profile-updated', refreshProfile);
    window.addEventListener('storage', refreshProfile);
    return () => {
      window.removeEventListener('alphamind-profile-updated', refreshProfile);
      window.removeEventListener('storage', refreshProfile);
    };
  }, []);

  const candidates = getPersonalizedResearchCandidates(profile);
  const evidence = getProfileEvidence(profile);

  const handleStartExperience = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      const event = new CustomEvent('navigate-to-page', { detail: 1 });
      window.dispatchEvent(event);
    }
  };

  const openAssetXRay = (symbol: string) => {
    const normalized = normalizeAssetSymbol(symbol);
    recordAssetInterest(normalized, 'home');
    const event = new CustomEvent('navigate-to-page', { detail: { page: 3, assetSymbol: normalized } });
    window.dispatchEvent(event);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    openAssetXRay(searchQuery);
    setSearchQuery('');
  };

  return (
    <section id="home" className="w-full min-h-screen am-page-gradient">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12 lg:py-14">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold am-text-primary leading-tight">
              认知驱动的<span className="am-brand">财富管理</span>
              <br />
              从工具到伴侣的进化
            </h1>
            <p className="text-base sm:text-lg md:text-xl am-text-secondary">
              以金融语义、风险画像与资产透视为核心，构建可解释、可扩展的智能投顾体验
            </p>
            <div className="rounded-2xl border am-card-strong p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold am-brand mb-1">本地账户画像</div>
                  <div className="text-lg font-bold am-text-primary">
                    {profile.riskLevel} · 风险分 {Math.round(profile.riskScore)}/100
                  </div>
                  <div className="mt-1 text-sm am-text-secondary">
                    {profile.emotionTag || '平稳'}状态 · {profile.focusTopics.slice(0, 3).join(' / ')}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const event = new CustomEvent('navigate-to-page', { detail: 2 });
                    window.dispatchEvent(event);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border am-card px-4 py-2 text-sm font-semibold am-text-primary am-hover-surface"
                >
                  校准画像
                  <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {evidence.slice(0, 4).map((item) => (
                  <div key={item} className="rounded-lg border am-border-subtle am-surface-muted px-3 py-2 text-xs am-text-secondary">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartExperience}
                className="px-6 sm:px-8 py-3 sm:py-4 am-brand-bg rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(196,69,54,0.5)] transition-shadow text-sm sm:text-base"
              >
                开始体验
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const event = new CustomEvent('navigate-to-page', { detail: 5 });
                  window.dispatchEvent(event);
                }}
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 am-border-brand am-brand rounded-lg font-semibold am-hover-surface transition-colors text-sm sm:text-base"
              >
                了解更多
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <CognitiveTopology />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-8 sm:mt-10"
        >
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] am-brand">Personalized Research</div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold am-text-primary">个性化研究候选</h2>
              <p className="mt-2 max-w-2xl text-sm sm:text-base am-text-secondary">
                根据本地画像、最近关注与资产信号生成，不承诺收益，仅作为研究辅助入口。
              </p>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex min-w-0 flex-col gap-2 sm:flex-row lg:w-[420px]">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border am-input-surface px-3 py-2">
                <Search size={17} className="am-text-tertiary" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="搜索：茅台 / 宁德时代 / 黄金ETF / 600519"
                  className="min-w-0 flex-1 bg-transparent text-sm am-text-primary am-placeholder focus:outline-none"
                />
              </div>
              <button type="submit" className="rounded-xl am-brand-bg px-4 py-2 text-sm font-semibold">
                资产透视
              </button>
            </form>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {candidates.map((asset) => {
              const report = getMockAssetXRayReport(asset.symbol);
              const trend = report.priceSeries?.slice(-14) ?? [];
              const closes = trend.map((item) => item.close);
              const min = Math.min(...closes);
              const max = Math.max(...closes);
              const points = trend.map((item, index) => {
                const x = trend.length <= 1 ? 4 : 4 + (index / (trend.length - 1)) * 92;
                const ratio = max === min ? 0.5 : (item.close - min) / (max - min);
                const y = 42 - ratio * 30;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              }).join(' ');

              return (
                <motion.button
                  key={asset.symbol}
                  whileHover={{ y: -4 }}
                  onClick={() => openAssetXRay(asset.symbol)}
                  className="group rounded-2xl border am-card p-4 text-left transition-all hover:border-[#C44536]/45 hover:shadow-[0_18px_45px_rgba(196,69,54,0.12)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs am-text-tertiary">{asset.market} · {asset.symbol}</div>
                      <div className="mt-1 text-lg font-bold am-text-primary">{asset.name}</div>
                      <div className="mt-1 text-xs am-text-secondary">{asset.sector}</div>
                    </div>
                    <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${asset.changeValue >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {asset.change}
                    </div>
                  </div>

                  <div className="mt-4 h-14 rounded-xl border am-border-subtle am-surface-muted px-2 py-2">
                    <svg viewBox="0 0 100 46" preserveAspectRatio="none" className="h-full w-full">
                      <polyline
                        points={points}
                        fill="none"
                        stroke={asset.changeValue >= 0 ? '#22C55E' : '#EF4444'}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg border am-border-subtle px-2 py-2">
                      <div className="am-text-tertiary">上涨</div>
                      <div className="mt-1 font-semibold text-green-500">{asset.probabilities.up}%</div>
                    </div>
                    <div className="rounded-lg border am-border-subtle px-2 py-2">
                      <div className="am-text-tertiary">横盘</div>
                      <div className="mt-1 font-semibold text-amber-500">{asset.probabilities.flat}%</div>
                    </div>
                    <div className="rounded-lg border am-border-subtle px-2 py-2">
                      <div className="am-text-tertiary">下跌</div>
                      <div className="mt-1 font-semibold text-red-500">{asset.probabilities.down}%</div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 am-text-secondary">
                    {profile.riskLevel === '保守型'
                      ? `以${profile.riskLevel}画像观察，重点看回撤与安全边际。`
                      : profile.riskLevel === '进取型'
                      ? `以${profile.riskLevel}画像观察，可作为弹性或主题资产研究。`
                      : `以${profile.riskLevel}画像观察，适合放进组合平衡框架讨论。`}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="am-text-tertiary">参考数据 / 情景推演</span>
                    <span className="inline-flex items-center gap-1 am-brand">
                      查看透视
                      <ArrowUpRight size={13} />
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
