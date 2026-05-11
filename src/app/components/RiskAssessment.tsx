import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingDown, TrendingUp, Minus, Check, Target, Award, Brain, Activity, BarChart3, Zap } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface TestAnswer {
  questionId: number;
  answer: string;
  riskScore: number;
  timestamp: number;
}

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

export function RiskAssessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [totalRiskScore, setTotalRiskScore] = useState(0);
  const [riskProfile, setRiskProfile] = useState<any>(null);
  const [aiAnalysisSteps, setAiAnalysisSteps] = useState<string[]>([]);
  const [behaviorData] = useState(generateBehaviorData());
  const [showAiPanel, setShowAiPanel] = useState(false);

  const questions = [
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
    }
  ];

  const handleAnswer = (questionId: number, answerId: string, riskScore: number) => {
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
    const stepInterval = setInterval(() => {
      if (stepIndex < analysisSteps.length) {
        setAiAnalysisSteps(prev => [...prev, analysisSteps[stepIndex]]);
        stepIndex++;
      } else {
        clearInterval(stepInterval);
      }
    }, 300);

    setTimeout(() => {
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
    setShowAiPanel(true);
    setIsAnalyzing(true);

    // 详细的AI分析步骤
    const finalAnalysisSteps = [
      '📊 整合5个维度的评估数据...',
      '🧠 应用千亿参数风险模型...',
      '📈 分析30天历史行为曲线...',
      '🎯 计算动态风险容忍度...',
      '💡 生成个性化资产配置建议...',
      '✅ 风险画像构建完成！',
    ];

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < finalAnalysisSteps.length) {
        setAiAnalysisSteps(prev => [...prev, finalAnalysisSteps[stepIndex]]);
        stepIndex++;
      } else {
        clearInterval(stepInterval);
      }
    }, 400);

    setTimeout(() => {
      const avgScore = allAnswers.reduce((sum, a) => sum + a.riskScore, 0) / allAnswers.length;

      // 结合历史行为数据调整风险评分
      const recentBehaviorAvg = behaviorData.slice(-7).reduce((sum, d) => sum + d.riskScore, 0) / 7;
      const adjustedScore = avgScore * 0.7 + recentBehaviorAvg * 0.3;

      setTotalRiskScore(adjustedScore);

      // Generate comprehensive radar chart data
      const profile = {
        marketVolatility: allAnswers.find(a => a.questionId === 1)?.riskScore || 50,
        investmentGoal: allAnswers.find(a => a.questionId === 2)?.riskScore || 50,
        experience: allAnswers.find(a => a.questionId === 3)?.riskScore || 50,
        liquidity: allAnswers.find(a => a.questionId === 4)?.riskScore || 50,
        lossAcceptance: allAnswers.find(a => a.questionId === 5)?.riskScore || 50,
        behaviorPattern: recentBehaviorAvg,
      };

      setRiskProfile(profile);
      setIsAnalyzing(false);
      setShowResults(true);

      setTimeout(() => {
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

  const radarData = riskProfile ? [
    { id: 'market-volatility', subject: '市场波动', value: riskProfile.marketVolatility, fullMark: 100 },
    { id: 'investment-goal', subject: '投资目标', value: riskProfile.investmentGoal, fullMark: 100 },
    { id: 'experience', subject: '投资经验', value: riskProfile.experience, fullMark: 100 },
    { id: 'liquidity', subject: '流动性', value: riskProfile.liquidity, fullMark: 100 },
    { id: 'loss-acceptance', subject: '损失容忍', value: riskProfile.lossAcceptance, fullMark: 100 },
    { id: 'behavior-pattern', subject: '行为模式', value: riskProfile.behaviorPattern, fullMark: 100 },
  ] : [];

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
  const assetAllocation = showResults ? getAssetAllocation(totalRiskScore) : [];

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setTotalRiskScore(0);
    setRiskProfile(null);
    setAiAnalysisSteps([]);
    setShowAiPanel(false);
  };

  return (
    <section id="risk-test" className="w-full h-full flex items-center bg-gradient-to-br from-[#1F1410] via-[#2D1B13] to-[#1F1410] overflow-y-auto">
      <div className="w-full py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              动态风险感知测试
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              基于AI多维度实时分析，结合您的历史行为数据，精准刻画动态风险画像
            </p>

            {/* Progress bar */}
            {!showResults && (
              <div className="mt-8 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">测试进度</span>
                  <span className="text-sm text-[#C44536] font-semibold">
                    {currentQuestion + 1} / {questions.length}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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

          {/* AI Analysis Panel - Floating */}
          <AnimatePresence>
            {showAiPanel && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="fixed bottom-8 right-8 z-50 w-96 bg-gradient-to-br from-[#C44536]/20 to-orange-600/20 backdrop-blur-xl border-2 border-[#C44536]/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(196,69,54,0.4)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain size={24} className="text-[#C44536]" />
                  </motion.div>
                  <h4 className="text-white font-semibold">AI 实时分析</h4>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {aiAnalysisSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-gray-300"
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

          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key="questions"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="max-w-4xl mx-auto"
              >
                {/* Current Question */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="px-3 py-1 bg-[#C44536]/20 text-[#C44536] rounded-full text-sm font-semibold">
                      {questions[currentQuestion].category}
                    </div>
                    <div className="text-sm text-gray-500">
                      维度 {currentQuestion + 1}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-8">
                    {questions[currentQuestion].question}
                  </h3>

                  <div className="space-y-4">
                    {questions[currentQuestion].options.map((option: any) => {
                      const Icon = option.icon;
                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => handleAnswer(questions[currentQuestion].id, option.id, option.risk)}
                          whileHover={{ scale: 1.02, x: 10 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isAnalyzing}
                          className="w-full p-6 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-[#C44536]/50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C44536]/20 to-orange-600/20 flex items-center justify-center">
                              <Icon size={28} className="text-[#C44536]" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-lg font-semibold text-white">
                                {option.id}. {option.text}
                              </p>
                            </div>
                            <div className="text-[#C44536]">→</div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Progress dots */}
                {answers.length > 0 && (
                  <div className="flex items-center justify-center gap-2">
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
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              // Results Screen
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Risk Score Display */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl border-2 border-[#C44536]/30 p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-block"
                  >
                    <div className="relative w-48 h-48 mx-auto mb-6">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="12"
                        />
                        <motion.circle
                          cx="96"
                          cy="96"
                          r="88"
                          fill="none"
                          stroke="url(#riskScoreGradient)"
                          strokeWidth="12"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: totalRiskScore / 100 }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          strokeDasharray={`${2 * Math.PI * 88}`}
                        />
                        <defs>
                          <linearGradient id="riskScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#C44536" key="score-gradient-start" />
                            <stop offset="100%" stopColor="#F59E0B" key="score-gradient-end" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-5xl font-bold text-white">{Math.round(totalRiskScore)}</div>
                        <div className="text-sm text-gray-400 mt-1">风险评分</div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="text-4xl mb-2">{getRiskLevel(totalRiskScore).icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    您的风险类型：{getRiskLevel(totalRiskScore).level}
                  </h3>
                  <p className="text-gray-400">
                    {getRiskLevel(totalRiskScore).desc}
                  </p>
                </div>

                {/* Multi-dimensional Analysis */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Radar Chart - 6维度风险画像 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6"
                  >
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Target size={20} className="text-[#C44536]" />
                      六维风险画像
                    </h4>
                    <div style={{ width: '100%', height: '350px' }}>
                      <ResponsiveContainer>
                        <RadarChart data={radarData}>
                          <PolarGrid key="polar-grid" stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis
                            key="polar-angle-axis"
                            dataKey="subject"
                            stroke="#fff"
                            style={{ fontSize: '12px' }}
                          />
                          <Radar
                            key="radar-risk-profile"
                            name="风险画像"
                            dataKey="value"
                            stroke="#C44536"
                            fill="#C44536"
                            fillOpacity={0.3}
                            strokeWidth={2}
                            animationId="radar-anim"
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* 资产配置建议饼图 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6"
                  >
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 size={20} className="text-[#C44536]" />
                      资产配置建议
                    </h4>
                    <div style={{ width: '100%', height: '350px' }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            key="pie-asset-allocation"
                            data={assetAllocation}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name} ${value}%`}
                            outerRadius={100}
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
                              backgroundColor: 'rgba(31, 20, 16, 0.9)',
                              border: '1px solid rgba(196, 69, 54, 0.3)',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>

                {/* 30天行为曲线分析 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6"
                >
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-[#C44536]" />
                    30天行为模式分析
                  </h4>
                  <div style={{ width: '100%', height: '300px' }}>
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
                        <CartesianGrid key="cartesian-grid" strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                          key="x-axis"
                          dataKey="day"
                          stroke="#888"
                          style={{ fontSize: '10px' }}
                          interval={4}
                        />
                        <YAxis key="y-axis" stroke="#888" style={{ fontSize: '12px' }} />
                        <Tooltip
                          key="area-tooltip"
                          contentStyle={{
                            backgroundColor: 'rgba(31, 20, 16, 0.9)',
                            border: '1px solid rgba(196, 69, 54, 0.3)',
                            borderRadius: '8px',
                            color: '#fff'
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
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#C44536] rounded-full" />
                      <span className="text-gray-400">风险偏好曲线</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#F59E0B] rounded-full" />
                      <span className="text-gray-400">交易频率曲线</span>
                    </div>
                  </div>
                </motion.div>

                {/* AI 深度洞察 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-r from-[#C44536]/10 to-orange-600/10 backdrop-blur-lg rounded-2xl border border-[#C44536]/30 p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Brain size={24} className="text-[#C44536]" />
                    <h4 className="text-lg font-semibold text-white">AI 深度洞察</h4>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-[#C44536]/20">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-sm font-semibold text-white mb-1">行为一致性</div>
                      <div className="text-xs text-gray-400">
                        您的问卷答案与历史行为数据匹配度达 {Math.round(75 + (totalRiskScore % 15))}%，
                        显示出较高的自我认知准确性
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-orange-600/20">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="text-sm font-semibold text-white mb-1">风险变化趋势</div>
                      <div className="text-xs text-gray-400">
                        近期您的风险偏好呈{totalRiskScore > 55 ? '上升' : '稳定'}趋势，
                        建议{totalRiskScore > 70 ? '适当控制仓位' : '保持当前策略'}
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-amber-600/20">
                      <div className="text-2xl mb-2">💡</div>
                      <div className="text-sm font-semibold text-white mb-1">优化建议</div>
                      <div className="text-xs text-gray-400">
                        {totalRiskScore < 40 && '可适当增加权益类资产配比，提升长期收益'}
                        {totalRiskScore >= 40 && totalRiskScore < 70 && '当前配置较为均衡，建议定期再平衡'}
                        {totalRiskScore >= 70 && '注意分散投资，避免过度集中于高风险资产'}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTest}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all"
                  >
                    重新测试
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const event = new CustomEvent('navigate-to-page', { detail: 1 });
                      window.dispatchEvent(event);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-[#C44536] to-orange-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(196,69,54,0.5)] transition-all"
                  >
                    开始投资咨询
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
