import { motion } from 'motion/react';
import { Activity, Brain, Shield, Target, TrendingUp } from 'lucide-react';
import { DataStream, HexGrid } from './TechVisualization';
import { useAuth } from '../contexts/AuthContext';

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
      <div className="absolute inset-4 rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)]" />
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
          <motion.path
            key={path}
            d={path}
            fill="none"
            stroke={index === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)'}
            strokeWidth={index === 0 ? 0.32 : 0.22}
            strokeDasharray={index === 0 ? '2.5 4.5' : '1.2 5.4'}
            initial={{ pathLength: 0.4, opacity: 0.2 }}
            animate={{
              pathLength: [0.62, 1, 0.62],
              opacity: [0.2, 0.44, 0.2],
            }}
            transition={{
              duration: 6 + index * 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.4,
            }}
          />
        ))}

        <motion.circle
          cx="50"
          cy="52"
          r="21"
          fill="url(#coreNebula)"
          animate={{
            opacity: [0.55, 0.95, 0.55],
            scale: [0.95, 1.08, 0.95],
          }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50% 52%' }}
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
            <motion.path
              d={node.path}
              fill="none"
              stroke={node.color}
              strokeWidth="0.82"
              strokeLinecap="round"
              strokeDasharray="6 86"
              animate={{ strokeDashoffset: [92, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: node.delay,
              }}
              opacity="0.9"
              filter="drop-shadow(0 0 5px currentColor)"
            />
          </g>
        ))}
      </svg>

      <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{
            scale: [1, 1.035, 1],
            boxShadow: [
              '0 0 42px rgba(196,69,54,0.58), inset 0 0 24px rgba(255,255,255,0.16)',
              '0 0 76px rgba(249,115,22,0.74), inset 0 0 34px rgba(255,255,255,0.24)',
              '0 0 42px rgba(196,69,54,0.58), inset 0 0 24px rgba(255,255,255,0.16)',
            ],
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.95),rgba(249,115,22,0.74)_24%,rgba(196,69,54,0.94)_58%,rgba(80,28,22,0.94)_100%)]"
        >
          <Brain size={46} strokeWidth={1.25} className="text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]" />
          <motion.div
            className="absolute inset-0 rounded-full border border-white/35"
            animate={{ scale: [1, 1.45, 1.8], opacity: [0.5, 0.18, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-orange-200/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute -bottom-9 text-center">
            <div className="text-xs font-medium tracking-[0.18em] text-white/90">AI CORE</div>
            <div className="mt-1 h-px w-14 bg-gradient-to-r from-transparent via-orange-300/80 to-transparent" />
          </div>
        </motion.div>
      </div>

      {satellites.map((node, index) => {
        const Icon = node.icon;

        return (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${node.left}%`, top: `${node.top}%` }}
          >
            <motion.div
              animate={{ y: [0, index % 2 === 0 ? -8 : 8, 0] }}
              transition={{
                duration: 4.2 + index * 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: node.delay,
              }}
              className="relative flex flex-col items-center justify-center rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.035))] backdrop-blur-xl"
              style={{
                width: node.size,
                height: node.size,
                boxShadow: `0 0 28px ${node.glow}, inset 0 0 18px rgba(255,255,255,0.1), inset 0 -14px 24px rgba(0,0,0,0.22)`,
              }}
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
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

export function HeroSection() {
  const { isAuthenticated, openLoginModal } = useAuth();

  const handleStartExperience = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      const event = new CustomEvent('navigate-to-page', { detail: 1 });
      window.dispatchEvent(event);
    }
  };

  return (
    <section id="home" className="w-full min-h-screen flex items-center bg-gradient-to-br from-[#1F1410] via-[#261812] to-[#121212]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              认知驱动的<span className="text-[#C44536]">财富管理</span>
              <br />
              从工具到伴侣的进化
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-400">
              基于千亿级金融语料大模型，精准捕捉动态交易意图
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartExperience}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-[#C44536] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(196,69,54,0.5)] transition-shadow text-sm sm:text-base"
              >
                开始体验
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const event = new CustomEvent('navigate-to-page', { detail: 3 });
                  window.dispatchEvent(event);
                }}
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#C44536] text-[#C44536] rounded-lg font-semibold hover:bg-[#C44536]/10 transition-colors text-sm sm:text-base"
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
      </div>
    </section>
  );
}
