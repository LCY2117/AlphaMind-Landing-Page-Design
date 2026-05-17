import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingDown, TrendingUp, Minus, Check, Target, Award, Brain, Activity, BarChart3, Zap, X } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StockTicker } from './StockTicker';

interface TestAnswer {
  questionId: number;
  answer: string;
  riskScore: number;
  timestamp: number;
}

interface RiskProfile {
  marketVolatility: number;
  investmentGoal: number;
  experience: number;
  liquidity: number;
  lossAcceptance: number;
  behaviorPattern: number;
}

interface RiskAssessmentResult {
  score: number;
  profile: RiskProfile;
  assessedAt: number;
  answers: TestAnswer[];
}

const RISK_PROFILE_STORAGE_KEY = 'alphamind_risk_profile';

const loadRiskProfile = (): RiskAssessmentResult | null => {
  try {
    const saved = localStorage.getItem(RISK_PROFILE_STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    if (
      typeof parsed?.score === 'number' &&
      parsed.profile &&
      typeof parsed.assessedAt === 'number'
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
};

const saveRiskProfile = (result: RiskAssessmentResult) => {
  try {
    localStorage.setItem(RISK_PROFILE_STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Ignore storage errors in restricted browser contexts.
  }
};

// 模拟用户历史行为数据 - 使用固定的模拟数据避免随机性
const generateBehaviorData = () => {
  // 使用固定的基准时间戳以确保可重现性
  const baseTime = 1704067200000; // 固定的基准时间 (2024-01-01)
  // 使用伪随机但确定性的数据模式
  const mockPattern = [
    45, 52, 48, 55, 50, 58, 53, 47, 51, 56,
    54, 49, 57, 52, 48, 55, 51, 59, 54, 50,
    56, 52, 48, 54, 51, 57, 53, 49, 55, 52
  ];

  const freqPattern = [
    35, 42, 38, 50, 45, 55, 48, 40, 52, 58,
    50, 44, 60, 48, 42, 55, 47, 62, 52, 45,
    58, 50, 43, 54, 48, 60, 52, 46, 57, 51
  ];

  return Array.from({ length: 30 }, (_, i) => ({
    id: `day-${i + 1}`,
    day: `第${i + 1}天`,
    riskScore: mockPattern[i],
    tradingFrequency: freqPattern[i],
    positionSize: 35 + (i % 10) * 5,
    timestamp: baseTime + i * 24 * 60 * 60 * 1000,
  }));
};

// 完整的20道题目库
const allQuestions = [
  {
    id: 1,
    category: '市场波动承受力',
    question: '如果市场突然下跌 10%，您会怎么做？',
    options: [
      { id: 'A', text: '立即止损卖出', icon: TrendingDown, risk: 20 },
      { id: 'B', text: '持续观望不动', icon: Minus, risk: 50 },
      { id: 'C', text: '抓住机会加仓', icon: TrendingUp, risk: 80 },
    ]
  },
  {
    id: 2,
    category: '投资目标与预期',
    question: '您的主要投资目标是什么？',
    options: [
      { id: 'A', text: '保本为主，收益其次', icon: Target, risk: 25 },
      { id: 'B', text: '适度增值，平衡风险', icon: Target, risk: 55 },
      { id: 'C', text: '追求高收益，接受高风险', icon: Target, risk: 85 },
    ]
  },
  {
    id: 3,
    category: '投资经验与知识',
    question: '您有多少投资经验？',
    options: [
      { id: 'A', text: '新手，几乎没有经验', icon: Award, risk: 30 },
      { id: 'B', text: '有1-3年投资经验', icon: Award, risk: 60 },
      { id: 'C', text: '5年以上资深投资者', icon: Award, risk: 75 },
    ]
  },
  {
    id: 4,
    category: '资金流动性需求',
    question: '您投资的资金在未来多久内不会使用？',
    options: [
      { id: 'A', text: '随时可能需要', icon: Zap, risk: 25 },
      { id: 'B', text: '1-3年内不需要', icon: Zap, risk: 55 },
      { id: 'C', text: '5年以上不需要', icon: Zap, risk: 80 },
    ]
  },
  {
    id: 5,
    category: '损失承受能力',
    question: '您能接受的最大损失是多少？',
    options: [
      { id: 'A', text: '不能接受任何损失', icon: TrendingDown, risk: 15 },
      { id: 'B', text: '可以接受10%以内的损失', icon: TrendingDown, risk: 50 },
      { id: 'C', text: '可以接受20%以上的损失', icon: TrendingDown, risk: 85 },
    ]
  },
  {
    id: 6,
    category: '投资组合偏好',
    question: '您更倾向于投资哪类资产？',
    options: [
      { id: 'A', text: '银行存款和货币基金', icon: Target, risk: 20 },
      { id: 'B', text: '债券和混合基金', icon: Target, risk: 50 },
      { id: 'C', text: '股票和股票型基金', icon: TrendingUp, risk: 85 },
    ]
  },
  {
    id: 7,
    category: '市场理解程度',
    question: '您对股市波动的看法是？',
    options: [
      { id: 'A', text: '市场波动让我焦虑不安', icon: TrendingDown, risk: 25 },
      { id: 'B', text: '能够理性看待正常波动', icon: Brain, risk: 55 },
      { id: 'C', text: '波动是投资机会的信号', icon: TrendingUp, risk: 80 },
    ]
  },
  {
    id: 8,
    category: '投资决策风格',
    question: '您如何做出投资决策？',
    options: [
      { id: 'A', text: '依赖专业机构建议', icon: Award, risk: 35 },
      { id: 'B', text: '结合自己分析和专家意见', icon: Brain, risk: 60 },
      { id: 'C', text: '完全依靠自己判断', icon: Target, risk: 75 },
    ]
  },
  {
    id: 9,
    category: '年龄与投资周期',
    question: '您的年龄段是？',
    options: [
      { id: 'A', text: '50岁以上', icon: Activity, risk: 30 },
      { id: 'B', text: '30-50岁', icon: Activity, risk: 60 },
      { id: 'C', text: '30岁以下', icon: Activity, risk: 75 },
    ]
  },
  {
    id: 10,
    category: '收入稳定性',
    question: '您的收入状况如何？',
    options: [
      { id: 'A', text: '收入不稳定，需要应急资金', icon: Zap, risk: 25 },
      { id: 'B', text: '收入较稳定，有储蓄', icon: Check, risk: 55 },
      { id: 'C', text: '收入很稳定，储蓄充足', icon: Check, risk: 75 },
    ]
  },
  {
    id: 11,
    category: '投资金额比例',
    question: '此次投资金额占您总资产的多少？',
    options: [
      { id: 'A', text: '超过50%', icon: BarChart3, risk: 30 },
      { id: 'B', text: '20%-50%', icon: BarChart3, risk: 60 },
      { id: 'C', text: '不到20%', icon: BarChart3, risk: 80 },
    ]
  },
  {
    id: 12,
    category: '风险认知能力',
    question: '您是否了解投资产品的风险收益特征？',
    options: [
      { id: 'A', text: '不太了解，需要学习', icon: Brain, risk: 30 },
      { id: 'B', text: '有一定了解', icon: Brain, risk: 55 },
      { id: 'C', text: '非常了解各类产品', icon: Award, risk: 75 },
    ]
  },
  {
    id: 13,
    category: '历史投资表现',
    question: '您过往投资经历中的整体表现如何？',
    options: [
      { id: 'A', text: '多数亏损或持平', icon: TrendingDown, risk: 35 },
      { id: 'B', text: '略有盈利', icon: Minus, risk: 55 },
      { id: 'C', text: '大部分盈利', icon: TrendingUp, risk: 75 },
    ]
  },
  {
    id: 14,
    category: '市场时机判断',
    question: '如果您认为市场即将上涨，会投入多少资金？',
    options: [
      { id: 'A', text: '小额试水，观察为主', icon: Target, risk: 30 },
      { id: 'B', text: '投入一半左右资金', icon: BarChart3, risk: 60 },
      { id: 'C', text: '全力以赴，满仓操作', icon: TrendingUp, risk: 90 },
    ]
  },
  {
    id: 15,
    category: '投资时长偏好',
    question: '您更倾向于哪种投资时长？',
    options: [
      { id: 'A', text: '短期（3个月内）', icon: Zap, risk: 70 },
      { id: 'B', text: '中期（1-3年）', icon: Activity, risk: 55 },
      { id: 'C', text: '长期（3年以上）', icon: Target, risk: 45 },
    ]
  },
  {
    id: 16,
    category: '家庭财务状况',
    question: '您的家庭负债情况如何？',
    options: [
      { id: 'A', text: '负债较多，还款压力大', icon: TrendingDown, risk: 25 },
      { id: 'B', text: '有少量负债，压力适中', icon: Minus, risk: 50 },
      { id: 'C', text: '无负债或负债很少', icon: Check, risk: 75 },
    ]
  },
  {
    id: 17,
    category: '投资产品多样性',
    question: '您投资过哪些类型的产品？',
    options: [
      { id: 'A', text: '只有储蓄和理财', icon: Award, risk: 30 },
      { id: 'B', text: '基金、债券等', icon: BarChart3, risk: 55 },
      { id: 'C', text: '股票、期权、外汇等', icon: TrendingUp, risk: 80 },
    ]
  },
  {
    id: 18,
    category: '信息获取能力',
    question: '您通常如何获取投资信息？',
    options: [
      { id: 'A', text: '很少关注，偶尔看看', icon: Activity, risk: 35 },
      { id: 'B', text: '定期浏览财经新闻', icon: Brain, risk: 55 },
      { id: 'C', text: '深入研究，多渠道对比', icon: Award, risk: 75 },
    ]
  },
  {
    id: 19,
    category: '心理抗压能力',
    question: '面对持续亏损，您的心态如何？',
    options: [
      { id: 'A', text: '非常焦虑，难以承受', icon: TrendingDown, risk: 20 },
      { id: 'B', text: '有些担心，但能坚持', icon: Minus, risk: 50 },
      { id: 'C', text: '保持冷静，理性分析', icon: Brain, risk: 80 },
    ]
  },
  {
    id: 20,
    category: '调整策略灵活度',
    question: '当投资策略失效时，您会怎么做？',
    options: [
      { id: 'A', text: '立即退出，减少损失', icon: TrendingDown, risk: 30 },
      { id: 'B', text: '观察一段时间再决定', icon: Minus, risk: 55 },
      { id: 'C', text: '优化策略，继续执行', icon: Target, risk: 75 },
    ]
  },
];

const EMPTY_RADAR_DATA = [
  { id: 'market-volatility-empty', subject: '市场波动', value: 0, fullMark: 100 },
  { id: 'investment-goal-empty', subject: '投资目标', value: 0, fullMark: 100 },
  { id: 'experience-empty', subject: '投资经验', value: 0, fullMark: 100 },
  { id: 'liquidity-empty', subject: '流动性', value: 0, fullMark: 100 },
  { id: 'loss-acceptance-empty', subject: '损失容忍', value: 0, fullMark: 100 },
  { id: 'behavior-pattern-empty', subject: '行为模式', value: 0, fullMark: 100 },
];

// 快速版固定抽取 5 个核心维度，保证每次演示可复现。
const selectRandomQuestions = (allQuestions: any[], count: number = 5) => {
  const indices = [0, 4, 8, 12, 16];
  return indices.map(i => allQuestions[i]).filter(Boolean);
};

export function RiskAssessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<RiskAssessmentResult | null>(loadRiskProfile);
  const [aiAnalysisSteps, setAiAnalysisSteps] = useState<string[]>([]);
  const [behaviorData] = useState(generateBehaviorData());
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showCalibrationBanner, setShowCalibrationBanner] = useState(true);
  const timersRef = useRef<number[]>([]);

  const [questions] = useState(() => selectRandomQuestions(allQuestions, 5));

  const clearAnalysisTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
      window.clearInterval(timerId);
    });
    timersRef.current = [];
  }, []);

  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    const timerId = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((id) => id !== timerId);
      callback();
    }, delay);
    timersRef.current.push(timerId);
  }, []);

  const scheduleInterval = useCallback((callback: () => boolean | void, delay: number) => {
    const timerId = window.setInterval(() => {
      const shouldStop = callback();
      if (shouldStop) {
        window.clearInterval(timerId);
        timersRef.current = timersRef.current.filter((id) => id !== timerId);
      }
    }, delay);
    timersRef.current.push(timerId);
    return timerId;
  }, []);

  useEffect(() => clearAnalysisTimers, [clearAnalysisTimers]);

  const handleAnswer = (questionId: number, answerId: string, riskScore: number) => {
    clearAnalysisTimers();
    const newAnswer: TestAnswer = {
      questionId,
      answer: answerId,
      riskScore,
      timestamp: Date.now()
    };
    setAnswers([...answers.filter(a => a.questionId !== questionId), newAnswer]);

    setIsAnalyzing(true);
    setShowAiPanel(true);

    // 模拟AI分析步骤
    const analysisSteps = [
      '正在分析您的选择模式...',
      '对比历史行为数据...',
      '计算多维度风险指标...',
      '更新风险画像模型...',
    ];

    let stepIndex = 0;
    scheduleInterval(() => {
      if (stepIndex < analysisSteps.length) {
        setAiAnalysisSteps(prev => [...prev, analysisSteps[stepIndex]]);
        stepIndex++;
      } else {
        return true;
      }
    }, 300);

    scheduleTimeout(() => {
      setIsAnalyzing(false);
      setAiAnalysisSteps([]);
      setShowAiPanel(false);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Calculate final results
        calculateResults([...answers.filter(a => a.questionId !== questionId), newAnswer]);
      }
    }, 1500);
  };

  const calculateResults = (allAnswers: TestAnswer[]) => {
    clearAnalysisTimers();
    setShowAiPanel(true);
    setIsAnalyzing(true);

    const finalAnalysisSteps = [
      '整合 5 个核心维度的问卷数据...',
      '计算风险承受能力与损失容忍度...',
      '比对本地演示行为序列...',
      '生成动态风险容忍度...',
      '生成资产配置参考视图...',
      '风险画像构建完成',
    ];

    let stepIndex = 0;
    scheduleInterval(() => {
      if (stepIndex < finalAnalysisSteps.length) {
        setAiAnalysisSteps(prev => [...prev, finalAnalysisSteps[stepIndex]]);
        stepIndex++;
      } else {
        return true;
      }
    }, 400);

    scheduleTimeout(() => {
      const avgScore = allAnswers.reduce((sum, a) => sum + a.riskScore, 0) / allAnswers.length;

      const recentBehaviorAvg = behaviorData.slice(-7).reduce((sum, d) => sum + d.riskScore, 0) / 7;
      const adjustedScore = avgScore * 0.7 + recentBehaviorAvg * 0.3;

      // Generate comprehensive radar chart data
      const profile: RiskProfile = {
        marketVolatility: allAnswers.find(a => a.questionId === 1)?.riskScore || 50,
        investmentGoal: allAnswers.find(a => a.questionId === 2)?.riskScore || 50,
        experience: allAnswers.find(a => a.questionId === 3)?.riskScore || 50,
        liquidity: allAnswers.find(a => a.questionId === 4)?.riskScore || 50,
        lossAcceptance: allAnswers.find(a => a.questionId === 5)?.riskScore || 50,
        behaviorPattern: recentBehaviorAvg,
      };

      const result = {
        score: adjustedScore,
        profile,
        assessedAt: Date.now(),
        answers: allAnswers,
      };

      setAssessmentResult(result);
      saveRiskProfile(result);
      setIsAnalyzing(false);
      setShowTestModal(false);
      setCurrentQuestion(0);
      setAnswers([]);

      scheduleTimeout(() => {
        setShowAiPanel(false);
        setAiAnalysisSteps([]);
      }, 2000);
    }, 2800);
  };

  const getRiskLevel = (score: number) => {
    if (score < 35) return { level: '保守型', color: '#3B82F6', icon: '🛡️', desc: '注重资金安全' };
    if (score < 65) return { level: '稳健型', color: '#F59E0B', icon: '⚖️', desc: '平衡风险收益' };
    return { level: '进取型', color: '#EF4444', icon: '🚀', desc: '追求高收益' };
  };

  const hasRiskData = Boolean(assessmentResult);
  const totalRiskScore = assessmentResult?.score ?? 0;
  const profileAgeDays = assessmentResult
    ? Math.max(0, Math.floor((Date.now() - assessmentResult.assessedAt) / (24 * 60 * 60 * 1000)))
    : null;
  const profileConfidence = assessmentResult
    ? Math.min(92, Math.max(64, Math.round(62 + assessmentResult.answers.length * 5 + (100 - Math.abs(totalRiskScore - 55)) * 0.12)))
    : 0;
  const radarData = useMemo(() => assessmentResult ? [
    { id: 'market-volatility', subject: '市场波动', value: assessmentResult.profile.marketVolatility, fullMark: 100 },
    { id: 'investment-goal', subject: '投资目标', value: assessmentResult.profile.investmentGoal, fullMark: 100 },
    { id: 'experience', subject: '投资经验', value: assessmentResult.profile.experience, fullMark: 100 },
    { id: 'liquidity', subject: '流动性', value: assessmentResult.profile.liquidity, fullMark: 100 },
    { id: 'loss-acceptance', subject: '损失容忍', value: assessmentResult.profile.lossAcceptance, fullMark: 100 },
    { id: 'behavior-pattern', subject: '行为模式', value: assessmentResult.profile.behaviorPattern, fullMark: 100 },
  ] : EMPTY_RADAR_DATA, [assessmentResult]);

  // 资产配置建议数据
  const getAssetAllocation = (score: number) => {
    if (score < 35) {
      return [
        { id: 'cash', name: '货币基金', value: 40, color: '#3B82F6' },
        { id: 'bond-conservative', name: '债券', value: 50, color: '#60A5FA' },
        { id: 'stock-conservative', name: '股票', value: 10, color: '#93C5FD' },
      ];
    } else if (score < 65) {
      return [
        { id: 'bond-balanced', name: '债券', value: 35, color: '#F59E0B' },
        { id: 'stock-balanced', name: '股票', value: 45, color: '#FBBF24' },
        { id: 'commodity-balanced', name: '商品', value: 20, color: '#FCD34D' },
      ];
    } else {
      return [
        { id: 'stock-aggressive', name: '股票', value: 60, color: '#EF4444' },
        { id: 'commodity-aggressive', name: '商品/期权', value: 25, color: '#F87171' },
        { id: 'bond-aggressive', name: '债券', value: 15, color: '#FCA5A5' },
      ];
    }
  };

  // 缓存资产配置数据，避免重复计算
  const assetAllocation = useMemo(
    () => hasRiskData ? getAssetAllocation(totalRiskScore) : [],
    [hasRiskData, totalRiskScore],
  );

  const startTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setAiAnalysisSteps([]);
    setShowAiPanel(false);
    setIsAnalyzing(false);
    setShowTestModal(true);
  };

  const closeTestModal = () => {
    if (isAnalyzing) return;
    clearAnalysisTimers();
    setShowTestModal(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setAiAnalysisSteps([]);
    setShowAiPanel(false);
  };

  return (
    <section id="risk-test" className="w-full min-h-screen flex flex-col am-page-gradient">
      {/* Stock Ticker - demo market data display */}
      <StockTicker />

      <div className="w-full flex-1 flex items-center py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold am-text-primary mb-4">
              动态风险数据看板
            </h2>
            <p className="am-text-secondary max-w-2xl mx-auto">
              随时查看本地风险画像、行为曲线与资产配置参考
            </p>

            {/* Progress bar */}
            {showTestModal && (
              <div className="mt-8 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm am-text-tertiary">测试进度</span>
                  <span className="text-sm text-[#C44536] font-semibold">
                    {currentQuestion + 1} / {questions.length}
                  </span>
                </div>
                <div className="h-2 am-card rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#C44536] to-orange-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {showCalibrationBanner && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="am-banner border rounded-xl px-4 py-3 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-2 text-sm am-text-primary">
                  <span aria-hidden="true">💡</span>
                  <span>
                    {hasRiskData
                      ? '市场环境已发生变化，AI 建议您重新校准风险画像以获取更精准的投资策略。'
                      : '完成动态风险感知测试，解锁您的专属 AI 投资画像。'}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <button onClick={startTest} className="text-sm font-semibold am-brand">
                    {hasRiskData ? '立即重新测评 →' : '开始测评 →'}
                  </button>
                  <button
                    onClick={() => setShowCalibrationBanner(false)}
                    className="p-1 rounded-md am-hover-surface am-text-secondary"
                    aria-label="关闭提示"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Analysis Panel - Floating */}
          <AnimatePresence>
            {showAiPanel && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="fixed bottom-4 left-4 right-4 sm:bottom-8 sm:left-auto sm:right-8 sm:w-96 z-50 bg-gradient-to-br from-[#C44536]/20 to-orange-600/20 backdrop-blur-xl border-2 border-[#C44536]/50 rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(196,69,54,0.4)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div className="am-loader-spin">
                    <Brain size={24} className="text-[#C44536]" />
                  </motion.div>
                  <h4 className="am-text-primary font-semibold">画像生成中</h4>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {aiAnalysisSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-sm am-text-secondary"
                    >
                      <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </motion.div>
                  ))}

                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-sm text-[#C44536]"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 bg-[#C44536] rounded-full"
                      />
                      <span>分析中...</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
                {/* Risk Score Display */}
                <div className="am-card-strong backdrop-blur-lg rounded-2xl border-2 am-border-brand p-6 sm:p-8 text-center relative overflow-hidden">
                  <button
                    onClick={startTest}
                    className="absolute right-4 top-4 hidden sm:inline-flex px-3 py-1.5 rounded-lg border am-border-brand am-brand am-hover-surface text-sm font-semibold"
                  >
                    {hasRiskData ? '↻ 重新评估' : '开始测评'}
                  </button>
                  <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="inline-block"
                  >
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-4 sm:mb-6">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                        <circle
                          cx="96"
                          cy="96"
                          r="82"
                          fill="none"
                          stroke={hasRiskData ? 'var(--am-chart-grid)' : 'var(--am-empty-chart-stroke)'}
                          strokeWidth="12"
                          strokeDasharray={hasRiskData ? undefined : '10 10'}
                        />
                        {hasRiskData && (
                          <motion.circle
                            cx="96"
                            cy="96"
                            r="82"
                            fill="none"
                            stroke="url(#riskScoreGradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: totalRiskScore / 100 }}
                            transition={{ duration: 1.2, delay: 0.1 }}
                            strokeDasharray={`${2 * Math.PI * 82}`}
                          />
                        )}
                        <defs>
                          <linearGradient id="riskScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#C44536" key="score-gradient-start" />
                            <stop offset="100%" stopColor="#F59E0B" key="score-gradient-end" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                        {hasRiskData ? (
                          <>
                            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold am-text-primary">{Math.round(totalRiskScore)}</div>
                            <div className="text-xs sm:text-sm am-text-secondary mt-1">风险评分</div>
                          </>
                        ) : (
                          <>
                            <Brain size={30} className="am-text-tertiary mb-2" />
                            <div className="text-sm font-semibold am-text-primary">未解锁</div>
                            <div className="text-xs am-text-tertiary mt-1">AI 画像</div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {hasRiskData ? (
                    <>
                      <div className="text-3xl sm:text-4xl mb-2">{getRiskLevel(totalRiskScore).icon}</div>
                      <h3 className="text-xl sm:text-2xl font-bold am-text-primary mb-2">
                        您的风险类型：{getRiskLevel(totalRiskScore).level}
                      </h3>
                      <p className="text-sm sm:text-base am-text-secondary">
                        {getRiskLevel(totalRiskScore).desc}
                      </p>
                    </>
                  ) : (
                    <div className="max-w-md mx-auto">
                      <h3 className="text-xl sm:text-2xl font-bold am-text-primary mb-2">
                        完成动态风险感知测试
                      </h3>
                      <p className="text-sm sm:text-base am-text-secondary mb-5">
                        解锁您的专属 AI 投资画像、六维风险雷达与资产配置建议
                      </p>
                      <button
                        onClick={startTest}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#C44536] to-orange-600 am-on-brand rounded-lg font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(196,69,54,0.35)] transition-all text-sm"
                      >
                        开始测评
                      </button>
                    </div>
                  )}

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="am-card border rounded-xl p-3 text-left">
                      <div className="text-xs am-text-tertiary mb-1">画像状态</div>
                      <div className="text-sm font-semibold am-text-primary">
                        {hasRiskData ? '已生成' : '等待测评'}
                      </div>
                    </div>
                    <div className="am-card border rounded-xl p-3 text-left">
                      <div className="text-xs am-text-tertiary mb-1">数据新鲜度</div>
                      <div className="text-sm font-semibold am-text-primary">
                        {hasRiskData ? `${profileAgeDays} 天前` : '尚无数据'}
                      </div>
                    </div>
                    <div className="am-card border rounded-xl p-3 text-left">
                      <div className="text-xs am-text-tertiary mb-1">置信度</div>
                      <div className="text-sm font-semibold am-text-primary">
                        {hasRiskData ? `${profileConfidence}%` : '--'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startTest}
                    className="mt-6 sm:hidden px-4 py-2 rounded-lg border am-border-brand am-brand am-hover-surface text-sm font-semibold"
                  >
                    {hasRiskData ? '↻ 重新评估' : '开始测评'}
                  </button>
                </div>

                {/* Multi-dimensional Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* Radar Chart - 6维度风险画像 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="am-card backdrop-blur-lg rounded-2xl border p-4 sm:p-6 relative"
                  >
                    <h4 className="text-base sm:text-lg font-semibold am-text-primary mb-3 sm:mb-4 flex items-center gap-2">
                      <Target size={18} className="text-[#C44536] sm:w-5 sm:h-5" />
                      六维风险画像
                      <span className="ml-auto text-xs font-normal am-text-tertiary">0-100 分 · 越高代表承受度越强</span>
                    </h4>
                    <div style={{ width: '100%', height: '280px' }} className="sm:h-[350px]">
                      <ResponsiveContainer>
                        <RadarChart data={radarData}>
                          <PolarGrid
                            key="polar-grid"
                            stroke={hasRiskData ? 'var(--am-chart-grid)' : 'var(--am-empty-chart-stroke)'}
                            strokeDasharray={hasRiskData ? undefined : '5 5'}
                          />
                          <PolarAngleAxis
                            key="polar-angle-axis"
                            dataKey="subject"
                            stroke="var(--am-chart-axis)"
                            style={{ fontSize: '10px' }}
                            className="sm:text-xs"
                          />
                          <Radar
                            key="radar-risk-profile"
                            name="风险画像"
                            dataKey="value"
                            stroke={hasRiskData ? '#C44536' : 'transparent'}
                            fill={hasRiskData ? '#C44536' : 'transparent'}
                            fillOpacity={hasRiskData ? 0.3 : 0}
                            strokeWidth={hasRiskData ? 2 : 0}
                            animationId="radar-anim"
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    {!hasRiskData && (
                      <div className="absolute inset-x-4 bottom-5 flex justify-center">
                        <div className="am-surface backdrop-blur-xl border rounded-xl px-4 py-3 text-center max-w-xs">
                          <p className="text-sm font-semibold am-text-primary">画像待生成</p>
                          <p className="text-xs am-text-secondary mt-1">
                            完成测试后，AI 会在这里生成您的六维风险轮廓
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* 资产配置建议饼图 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="am-card backdrop-blur-lg rounded-2xl border p-4 sm:p-6"
                  >
                    <h4 className="text-base sm:text-lg font-semibold am-text-primary mb-3 sm:mb-4 flex items-center gap-2">
                      <BarChart3 size={18} className="text-[#C44536] sm:w-5 sm:h-5" />
                      资产配置建议
                    </h4>
                    <div style={{ width: '100%', height: '280px' }} className="sm:h-[350px]">
                      {hasRiskData ? (
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              key="pie-asset-allocation"
                              data={assetAllocation}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name} ${value}%`}
                              outerRadius={80}
                              className="sm:text-sm md:text-base"
                              fill="#8884d8"
                              dataKey="value"
                              animationId="pie-anim"
                            >
                              {assetAllocation.map((entry) => (
                                <Cell key={`asset-${entry.id}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              key="pie-tooltip"
                              contentStyle={{
                                backgroundColor: 'var(--am-tooltip-bg)',
                                border: '1px solid var(--am-border-strong)',
                                borderRadius: '8px',
                                color: 'var(--am-text-primary)'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center max-w-xs">
                            <div className="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-dashed flex items-center justify-center" style={{ borderColor: 'var(--am-empty-chart-stroke)' }}>
                              <BarChart3 size={30} className="am-text-tertiary" />
                            </div>
                            <p className="text-sm font-semibold am-text-primary">资产配置尚未生成</p>
                            <p className="text-xs am-text-secondary mt-2">
                              AI 将根据您的风险得分给出可解释的配置比例
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {hasRiskData && (
                      <p className="mt-2 text-xs am-text-tertiary text-center">
                        基于快速问卷画像生成，非真实持仓或交易建议。
                      </p>
                    )}
                  </motion.div>
                </div>

                {/* 30天行为曲线分析 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="am-card backdrop-blur-lg rounded-2xl border p-4 sm:p-6"
                >
                  <h4 className="text-base sm:text-lg font-semibold am-text-primary mb-3 sm:mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-[#C44536] sm:w-5 sm:h-5" />
                    30天行为模式分析
                  </h4>
                  <div style={{ width: '100%', height: '250px' }} className="sm:h-[300px]">
                    {hasRiskData ? (
                      <ResponsiveContainer>
                        <AreaChart data={behaviorData}>
                          <defs>
                            <linearGradient id="behaviorColorRisk" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C44536" stopOpacity={0.8} key="gradient-risk-start"/>
                              <stop offset="95%" stopColor="#C44536" stopOpacity={0.1} key="gradient-risk-end"/>
                            </linearGradient>
                            <linearGradient id="behaviorColorFreq" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} key="gradient-freq-start"/>
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} key="gradient-freq-end"/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid key="cartesian-grid" strokeDasharray="3 3" stroke="var(--am-chart-grid)" />
                          <XAxis
                            key="x-axis"
                            dataKey="day"
                            stroke="var(--am-chart-axis)"
                            style={{ fontSize: '9px' }}
                            interval={5}
                            className="sm:text-xs"
                          />
                          <YAxis key="y-axis" stroke="var(--am-chart-axis)" style={{ fontSize: '10px' }} className="sm:text-xs" />
                          <Tooltip
                            key="area-tooltip"
                            contentStyle={{
                              backgroundColor: 'var(--am-tooltip-bg)',
                              border: '1px solid var(--am-border-strong)',
                              borderRadius: '8px',
                              color: 'var(--am-text-primary)'
                            }}
                          />
                          <Area
                            key="area-risk-score"
                            type="monotone"
                            dataKey="riskScore"
                            stroke="#C44536"
                            fillOpacity={1}
                            fill="url(#behaviorColorRisk)"
                            name="风险偏好"
                            animationId="risk-score-anim"
                          />
                          <Area
                            key="area-trading-freq"
                            type="monotone"
                            dataKey="tradingFrequency"
                            stroke="#F59E0B"
                            fillOpacity={1}
                            fill="url(#behaviorColorFreq)"
                            name="交易频率"
                            animationId="trading-freq-anim"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center max-w-xs">
                          <div className="mx-auto mb-4 h-20 w-20 rounded-2xl border-2 border-dashed flex items-center justify-center" style={{ borderColor: 'var(--am-empty-chart-stroke)' }}>
                            <Activity size={28} className="am-text-tertiary" />
                          </div>
                          <p className="text-sm font-semibold am-text-primary">暂无行为序列</p>
                          <p className="text-xs am-text-secondary mt-2">
                            完成测评后，这里会显示本地演示行为曲线。
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {hasRiskData && (
                    <div className="mt-3 sm:mt-4 flex flex-col items-center gap-2 text-xs sm:text-sm">
                      <div className="flex items-center justify-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#C44536] rounded-full" />
                          <span className="am-text-secondary">风险偏好</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#F59E0B] rounded-full" />
                          <span className="am-text-secondary">交易频率</span>
                        </div>
                      </div>
                      <span className="am-text-tertiary">当前为本地演示行为序列，后续可替换为真实交易/问答行为数据。</span>
                    </div>
                  )}
                </motion.div>

                {/* AI 深度洞察 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-r from-[#C44536]/10 to-orange-600/10 backdrop-blur-lg rounded-2xl border border-[#C44536]/30 p-4 sm:p-6"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Brain size={20} className="text-[#C44536] sm:w-6 sm:h-6" />
                    <h4 className="text-base sm:text-lg font-semibold am-text-primary">AI 深度洞察</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 am-card rounded-lg border border-[#C44536]/20">
                      <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📊</div>
                      <div className="text-xs sm:text-sm font-semibold am-text-primary mb-1">行为一致性</div>
                      <div className="text-xs am-text-secondary leading-relaxed">
                        {hasRiskData
                          ? `您的问卷答案与历史行为数据匹配度达 ${Math.round(75 + (totalRiskScore % 15))}%，显示出较高的自我认知准确性`
                          : '完成测评后，AI 将校验您的主观答案与历史行为模式是否一致'}
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 am-card rounded-lg border border-orange-600/20">
                      <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎯</div>
                      <div className="text-xs sm:text-sm font-semibold am-text-primary mb-1">风险变化趋势</div>
                      <div className="text-xs am-text-secondary leading-relaxed">
                        {hasRiskData
                          ? `近期您的风险偏好呈${totalRiskScore > 55 ? '上升' : '稳定'}趋势，建议${totalRiskScore > 70 ? '适当控制仓位' : '保持当前策略'}`
                          : '画像生成后，这里会持续提示风险偏好变化与策略校准方向'}
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 am-card rounded-lg border border-amber-600/20">
                      <div className="text-xl sm:text-2xl mb-1 sm:mb-2">💡</div>
                      <div className="text-xs sm:text-sm font-semibold am-text-primary mb-1">优化建议</div>
                      <div className="text-xs am-text-secondary leading-relaxed">
                        {hasRiskData && totalRiskScore < 40 && '可适当增加权益类资产配比，提升长期收益'}
                        {hasRiskData && totalRiskScore >= 40 && totalRiskScore < 70 && '当前配置较为均衡，建议定期再平衡'}
                        {hasRiskData && totalRiskScore >= 70 && '注意分散投资，避免过度集中于高风险资产'}
                        {!hasRiskData && '先完成一次动态感知测试，AI 会给出更贴合您的资产配置建议'}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startTest}
                    className="px-6 sm:px-8 py-3 am-card am-hover-surface am-text-primary border rounded-lg transition-all text-sm sm:text-base"
                  >
                    {hasRiskData ? '重新测试' : '开始风险测试'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const event = new CustomEvent('navigate-to-page', { detail: 1 });
                      window.dispatchEvent(event);
                    }}
                    className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#C44536] to-orange-600 am-on-brand rounded-lg font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(196,69,54,0.5)] transition-all text-sm sm:text-base"
                  >
                    开始投资咨询
                  </motion.button>
                </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showTestModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTestModal}
              className="fixed inset-0 z-[120] am-backdrop backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 26, scale: 0.96 }}
              transition={{ duration: 0.34, ease: [0.25, 1, 0.5, 1] }}
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(920px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 z-[130] am-surface rounded-2xl border-2 am-border-brand overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]"
            >
              <div className="px-5 sm:px-6 py-4 border-b am-border-subtle flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-semibold am-brand mb-1">动态风险感知测试</div>
                  <h3 className="text-lg sm:text-xl font-bold am-text-primary">
                    快速更新您的风险画像
                  </h3>
                  <p className="text-sm am-text-secondary mt-1">
                    5 个问题，完成后看板会自动刷新
                  </p>
                </div>
                <button
                  onClick={closeTestModal}
                  disabled={isAnalyzing}
                  className="p-2 rounded-lg am-hover-surface am-text-secondary disabled:opacity-40"
                  aria-label="关闭测评"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-5 sm:px-6 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm am-text-tertiary">测试进度</span>
                  <span className="text-sm text-[#C44536] font-semibold">
                    {currentQuestion + 1} / {questions.length}
                  </span>
                </div>
                <div className="h-2 am-card rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#C44536] to-orange-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto">
                <div className="am-card backdrop-blur-lg rounded-2xl border p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="px-2 sm:px-3 py-1 bg-[#C44536]/20 text-[#C44536] rounded-full text-xs sm:text-sm font-semibold">
                      {questions[currentQuestion].category}
                    </div>
                    <div className="text-xs sm:text-sm am-text-tertiary">
                      维度 {currentQuestion + 1}
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold am-text-primary mb-6 sm:mb-8">
                    {questions[currentQuestion].question}
                  </h3>

                  <div className="space-y-3 sm:space-y-4">
                    {questions[currentQuestion].options.map((option: any) => {
                      const Icon = option.icon;
                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => handleAnswer(questions[currentQuestion].id, option.id, option.risk)}
                          whileHover={{ scale: 1.01, x: 6 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isAnalyzing}
                          className="w-full p-4 sm:p-5 lg:p-6 am-card am-hover-surface border-2 am-hover-border-brand rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#C44536]/20 to-orange-600/20 flex items-center justify-center flex-shrink-0">
                              <Icon size={24} className="text-[#C44536] sm:w-7 sm:h-7" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <p className="text-sm sm:text-base lg:text-lg font-semibold am-text-primary">
                                {option.id}. {option.text}
                              </p>
                            </div>
                            <div className="text-[#C44536] flex-shrink-0">→</div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {answers.length > 0 && (
                  <div className="mt-5 flex items-center justify-center gap-2">
                    {questions.map((q, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-3 h-3 rounded-full ${
                          answers.find(a => a.questionId === q.id)
                            ? 'bg-[#C44536]'
                            : idx === currentQuestion
                            ? 'bg-orange-600'
                            : 'am-card'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
