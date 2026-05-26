import { MOCK_ASSET_REPORTS, type AssetXRayReport } from './assetXRay';

export type AlphaMindRiskLevel = '保守型' | '稳健型' | '进取型';

export interface StoredRiskAssessment {
  score: number;
  profile?: Record<string, number>;
  assessedAt: number;
  answers?: Array<{ questionId: number; answer: string; riskScore: number; timestamp: number }>;
}

export interface AssetInterest {
  symbol: string;
  name: string;
  count: number;
  lastViewedAt: number;
  source: 'home' | 'chat' | 'asset-xray' | 'risk';
}

export interface UserProfileMemory {
  age?: number;
  amount?: number;
  riskScore: number;
  riskLevel: AlphaMindRiskLevel;
  riskAssessedAt?: number;
  emotionTag: string;
  focusTopics: string[];
  recentAssets: AssetInterest[];
  updatedAt: number;
}

export interface InvestmentAdviceCardData {
  title: string;
  subtitle: string;
  profileSummary: string;
  evidence: string[];
  assetSignals: string[];
  branches: Array<{ name: string; fit: string; detail: string }>;
  positives: string[];
  risks: string[];
  boundary: string;
}

const PROFILE_MEMORY_KEY = 'alphamind_profile_memory';
export const RISK_PROFILE_STORAGE_KEY = 'alphamind_risk_profile';
export const USER_PROFILE_MEMORY_STORAGE_KEY = PROFILE_MEMORY_KEY;

const DEFAULT_PROFILE: UserProfileMemory = {
  riskScore: 58,
  riskLevel: '稳健型',
  emotionTag: '平稳',
  focusTopics: ['资产配置', '风险控制', '国内资产'],
  recentAssets: [
    { symbol: '600519', name: '贵州茅台', count: 2, lastViewedAt: Date.now() - 1000 * 60 * 60 * 6, source: 'home' },
    { symbol: '518880', name: '华安黄金ETF', count: 1, lastViewedAt: Date.now() - 1000 * 60 * 60 * 22, source: 'home' },
  ],
  updatedAt: Date.now(),
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getRiskLevelFromScore(score: number): AlphaMindRiskLevel {
  if (score < 35) return '保守型';
  if (score < 65) return '稳健型';
  return '进取型';
}

export function loadStoredRiskAssessment(): StoredRiskAssessment | null {
  if (!canUseStorage()) return null;

  const parsed = safeParse<StoredRiskAssessment>(localStorage.getItem(RISK_PROFILE_STORAGE_KEY));
  if (!parsed || typeof parsed.score !== 'number' || typeof parsed.assessedAt !== 'number') return null;
  return parsed;
}

function normalizeProfileMemory(input: Partial<UserProfileMemory> | null): UserProfileMemory {
  const storedRisk = loadStoredRiskAssessment();
  const riskScore = storedRisk?.score ?? input?.riskScore ?? DEFAULT_PROFILE.riskScore;
  const riskLevel = getRiskLevelFromScore(riskScore);
  const recentAssets = Array.isArray(input?.recentAssets)
    ? input.recentAssets
        .filter((item) => item?.symbol && item?.name)
        .slice(0, 8)
    : DEFAULT_PROFILE.recentAssets;

  return {
    ...DEFAULT_PROFILE,
    ...input,
    riskScore,
    riskLevel,
    riskAssessedAt: storedRisk?.assessedAt ?? input?.riskAssessedAt,
    focusTopics: Array.from(new Set([...(input?.focusTopics ?? DEFAULT_PROFILE.focusTopics)])).slice(0, 6),
    recentAssets,
    updatedAt: input?.updatedAt ?? Date.now(),
  };
}

export function loadUserProfileMemory(): UserProfileMemory {
  if (!canUseStorage()) return normalizeProfileMemory(null);

  const parsed = safeParse<Partial<UserProfileMemory>>(localStorage.getItem(PROFILE_MEMORY_KEY));
  return normalizeProfileMemory(parsed);
}

export function saveUserProfileMemory(profile: UserProfileMemory) {
  if (!canUseStorage()) return;
  localStorage.setItem(PROFILE_MEMORY_KEY, JSON.stringify({ ...profile, updatedAt: Date.now() }));
  window.dispatchEvent(new CustomEvent('alphamind-profile-updated'));
}

export function updateUserProfileMemory(patch: Partial<UserProfileMemory>) {
  const current = loadUserProfileMemory();
  const next = normalizeProfileMemory({
    ...current,
    ...patch,
    focusTopics: patch.focusTopics ?? current.focusTopics,
    recentAssets: patch.recentAssets ?? current.recentAssets,
  });
  saveUserProfileMemory(next);
  return next;
}

export function syncRiskAssessmentToProfileMemory(result: StoredRiskAssessment) {
  if (!canUseStorage()) return loadUserProfileMemory();
  localStorage.setItem(RISK_PROFILE_STORAGE_KEY, JSON.stringify(result));
  return updateUserProfileMemory({
    riskScore: result.score,
    riskLevel: getRiskLevelFromScore(result.score),
    riskAssessedAt: result.assessedAt,
  });
}

export function inferEmotionTag(text: string) {
  if (/(焦虑|慌|恐慌|睡不着|亏麻|害怕|担心)/.test(text)) return '焦虑';
  if (/(兴奋|冲|满仓|梭哈|激进|暴富)/.test(text)) return '兴奋';
  if (/(保守|稳一点|稳健|不想亏|安全)/.test(text)) return '谨慎';
  if (/(观望|看看|研究|分析|比较)/.test(text)) return '观察';
  return '';
}

export function inferFocusTopics(text: string) {
  const topics = new Set<string>();
  if (/(黄金|避险|防御)/.test(text)) topics.add('防御资产');
  if (/(茅台|白酒|消费)/.test(text)) topics.add('消费龙头');
  if (/(宁德|新能源|电池|成长)/.test(text)) topics.add('成长资产');
  if (/(银行|招商|分红)/.test(text)) topics.add('稳健分红');
  if (/(指数|沪深300|宽基|定投)/i.test(text)) topics.add('宽基指数');
  if (/(配置|组合|仓位)/.test(text)) topics.add('资产配置');
  if (/(风险|回撤|波动)/.test(text)) topics.add('风险控制');
  return Array.from(topics);
}

export function recordAssetInterest(symbol: string, source: AssetInterest['source'] = 'chat') {
  const report = MOCK_ASSET_REPORTS.find((item) => item.symbol === symbol);
  const profile = loadUserProfileMemory();
  const name = report?.name ?? symbol;
  const existing = profile.recentAssets.find((item) => item.symbol === symbol);
  const nextAssets = [
    {
      symbol,
      name,
      count: (existing?.count ?? 0) + 1,
      lastViewedAt: Date.now(),
      source,
    },
    ...profile.recentAssets.filter((item) => item.symbol !== symbol),
  ].slice(0, 8);

  return updateUserProfileMemory({ recentAssets: nextAssets });
}

export function updateProfileFromMessage(text: string, symbol?: string) {
  const current = loadUserProfileMemory();
  const ageMatch = text.match(/(\d+)岁|年龄\s*(\d+)/);
  const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*万/);
  const emotionTag = inferEmotionTag(text);
  const topics = inferFocusTopics(text);
  const next = updateUserProfileMemory({
    age: ageMatch ? Number(ageMatch[1] || ageMatch[2]) : current.age,
    amount: amountMatch ? Math.round(Number(amountMatch[1]) * 10000) : current.amount,
    emotionTag: emotionTag || current.emotionTag,
    focusTopics: Array.from(new Set([...topics, ...current.focusTopics])).slice(0, 6),
  });

  return symbol ? recordAssetInterest(symbol, 'chat') : next;
}

export function getProfileEvidence(profile = loadUserProfileMemory()) {
  const evidence = [
    `风险画像：${profile.riskLevel}，风险分 ${Math.round(profile.riskScore)}/100`,
    profile.riskAssessedAt
      ? `最近测评：${new Date(profile.riskAssessedAt).toLocaleDateString('zh-CN')}`
      : '最近测评：使用默认画像',
    profile.emotionTag ? `情绪状态：${profile.emotionTag}` : '情绪状态：平稳',
  ];

  if (profile.recentAssets.length > 0) {
    const focused = profile.recentAssets.slice(0, 2).map((item) => `${item.name} ${item.count}次`).join('、');
    evidence.push(`关注证据：最近关注 ${focused}`);
  }

  if (profile.focusTopics.length > 0) {
    evidence.push(`主题偏好：${profile.focusTopics.slice(0, 3).join(' / ')}`);
  }

  return evidence;
}

export function getPersonalizedResearchCandidates(profile = loadUserProfileMemory()) {
  const riskMap: Record<AlphaMindRiskLevel, string[]> = {
    保守型: ['518880', '600036', 'CSI300'],
    稳健型: ['600519', '518880', '600036'],
    进取型: ['300750', '600519', 'CSI300'],
  };
  const recent = profile.recentAssets.map((item) => item.symbol);
  const preferred = Array.from(new Set([...recent, ...riskMap[profile.riskLevel], '600519', '300750', '518880']));

  return preferred
    .map((symbol) => MOCK_ASSET_REPORTS.find((report) => report.symbol === symbol))
    .filter((item): item is AssetXRayReport => Boolean(item))
    .slice(0, 3);
}

export function buildInvestmentAdviceCard(
  report: AssetXRayReport,
  profile = loadUserProfileMemory(),
): InvestmentAdviceCardData {
  const isConservative = profile.riskLevel === '保守型';
  const isAggressive = profile.riskLevel === '进取型';
  const profileSummary = `${profile.riskLevel}用户，风险分 ${Math.round(profile.riskScore)}/100，当前情绪为${profile.emotionTag || '平稳'}。`;
  const volatilityHint = report.metrics.find((item) => item.label.includes('波动'))?.value ?? '中';

  const branches = isConservative
    ? [
        { name: '方案 A：继续观察', fit: '匹配度高', detail: '先跟踪估值、回撤和新闻情绪，不急于提高权益暴露。' },
        { name: '方案 B：小仓位研究', fit: '匹配度中', detail: '若确需参与，可用低比例、分批节奏验证观点。' },
        { name: '方案 C：等待风险释放', fit: '匹配度高', detail: '等待波动下降或价格回到更有安全边际的位置。' },
      ]
    : isAggressive
    ? [
        { name: '方案 A：趋势确认后分批研究', fit: '匹配度高', detail: '利用动量与情绪信号确认方向，但避免一次性集中押注。' },
        { name: '方案 B：核心-卫星配置', fit: '匹配度中高', detail: '以宽基或防御资产做核心，该标的作为卫星仓位观察。' },
        { name: '方案 C：回撤预案', fit: '必要约束', detail: '提前设定回撤阈值，防止高波动阶段放大损失。' },
      ]
    : [
        { name: '方案 A：继续观察', fit: '匹配度中高', detail: '适合等待更明确的价格与情绪共振信号。' },
        { name: '方案 B：小仓位分批研究', fit: '匹配度高', detail: '用分批节奏降低择时压力，保留组合弹性。' },
        { name: '方案 C：搭配防御资产', fit: '匹配度中高', detail: '与黄金、债券或宽基搭配，降低单一资产波动。' },
      ];

  return {
    title: `${report.name} ${report.symbol} 研究辅助卡`,
    subtitle: '基于用户画像、资产信号和情景推演生成',
    profileSummary,
    evidence: getProfileEvidence(profile),
    assetSignals: [
      `资产信号：${report.change}，AI 综合评分 ${report.metrics[0]?.value ?? '--'}`,
      `多空情绪：${report.sentimentLabel}，情绪指数 ${report.sentiment}/100`,
      `波动提示：当前波动风险为${volatilityHint}，预测区间为上涨 ${report.probabilities.up}% / 横盘 ${report.probabilities.flat}% / 下跌 ${report.probabilities.down}%`,
    ],
    branches,
    positives: report.catalysts.slice(0, 3),
    risks: [
      `${report.sector} 的景气度和估值变化可能影响短期波动。`,
      profile.riskLevel === '保守型' ? '当前画像更重视回撤控制，不适合过高集中度。' : '需避免把情景推演理解为确定性预测。',
      '本地参考数据非实时行情，正式决策需结合最新公告、财报和个人约束。',
    ],
    boundary: '以上内容仅用于 AlphaMind 研究辅助与风险教育，不构成任何投资建议或收益承诺。',
  };
}
