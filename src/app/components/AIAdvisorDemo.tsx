import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Image as ImageIcon,
  Menu,
  Mic,
  Plus,
  MessageSquare,
  ScanSearch,
  Sparkles,
  Target,
  Trash2,
  ArrowUp,
  X,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const mockMessages = [
  {
    role: 'user',
    content: '我今年30岁,有20万闲钱,能接受一些波动',
    type: 'text'
  },
  {
    role: 'assistant',
    content: '已为您生成稳健增长型配置方案',
    type: 'analysis',
    riskScore: 65,
    riskLevel: '成长型',
    portfolio: [
      { name: '科技', value: 50, color: '#C44536' },
      { name: '债券', value: 30, color: '#D97706' },
      { name: '黄金', value: 20, color: '#FBBF24' },
    ],
    reasons: [
      {
        icon: '📊',
        text: '您的风险偏好为成长型，适合配置较高比例的权益类资产',
      },
      {
        icon: '💹',
        text: '当前科技板块估值合理，具备中长期投资价值',
      },
      {
        icon: '🛡️',
        text: '债券和黄金配置提供下行保护，平衡整体波动',
      },
    ]
  },
];

const marketTrendData = [
  { date: '1/1', value: 3200 },
  { date: '2/1', value: 3350 },
  { date: '3/1', value: 3280 },
  { date: '4/1', value: 3450 },
  { date: '5/1', value: 3580 },
  { date: '6/1', value: 3520 },
];

interface Session {
  id: string;
  title: string;
  timestamp: string;
  messages: any[];
  userProfile?: {
    age?: number;
    amount?: number;
    riskTolerance?: string;
  };
}

interface AIAdvisorDemoProps {
  currentPage?: number;
  onNavigate?: (page: number) => void;
  onOpenAssetXRay?: (symbol: string) => void;
  newChatRequest?: number;
}

const mockSessions: Session[] = [
  { id: '089', title: '股票投资咨询', timestamp: '2小时前', messages: mockMessages, userProfile: { age: 30, amount: 200000 } },
  { id: '092', title: '退休规划', timestamp: '昨天', messages: [] },
  { id: '093', title: '基金定投', timestamp: '3天前', messages: [] },
];

const globalNavItems = [
  { label: '首页', page: 0, icon: Home },
  { label: '对话投顾', page: 1, icon: MessageSquare },
  { label: '风险测试', page: 2, icon: Target },
  { label: '资产透视', page: 3, icon: ScanSearch },
  { label: '核心功能', page: 4, icon: Sparkles },
];

const quickQuestions = [
  { icon: '💰', text: '如何开始投资理财？', category: 'beginner' },
  { icon: '📊', text: '帮我评估投资风险', category: 'risk' },
  { icon: '🎯', text: '制定退休储蓄计划', category: 'planning' },
  { icon: '💎', text: '推荐适合我的基金', category: 'product' },
];

const STOCK_NAME_MAP: Record<string, string> = {
  特斯拉: 'TSLA',
  英伟达: 'NVDA',
  辉达: 'NVDA',
  苹果: 'AAPL',
  微软: 'MSFT',
  谷歌: 'GOOGL',
  亚马逊: 'AMZN',
  超微: 'AMD',
  阿里: 'BABA',
  腾讯: 'TCEHY',
};

const detectIntent = (text: string) => {
  const lowerText = text.toLowerCase();
  const hasStockSymbol = Boolean(extractStockSymbol(text));
  if (
    (/(?:分析|看看|检测|透视|研究|x-ray|xray)/i.test(text) && hasStockSymbol) ||
    (hasStockSymbol && /(?:怎么样|能买吗|能不能买|持有|买入|卖出)/i.test(text))
  ) return 'asset_xray';
  if (lowerText.includes('风险') || lowerText.includes('波动')) return 'risk_assessment';
  if (lowerText.includes('配置') || lowerText.includes('分配')) return 'allocation';
  if (lowerText.includes('推荐') || lowerText.includes('建议')) return 'recommendation';
  if (lowerText.includes('退休') || lowerText.includes('养老')) return 'retirement';
  if (lowerText.includes('基金') || lowerText.includes('股票')) return 'product';
  return 'general';
};

const extractStockSymbol = (text: string) => {
  const upper = text.toUpperCase();
  const ticker = upper.match(/\b[A-Z]{1,5}(?:[.-][A-Z])?\b/)?.[0];
  if (ticker) return ticker;
  for (const [name, symbol] of Object.entries(STOCK_NAME_MAP)) {
    if (text.includes(name)) return symbol;
  }
  return null;
};

const extractUserInfo = (text: string) => {
  const info: any = {};
  const ageMatch = text.match(/(\d+)岁|年龄\s*(\d+)|我\s*(\d+)/);
  if (ageMatch) {
    info.age = parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3]);
  }
  const amountMatch = text.match(/(\d+)万/);
  if (amountMatch) {
    info.amount = parseInt(amountMatch[1]) * 10000;
  }
  if (text.includes('保守') || text.includes('稳健')) info.riskTolerance = '保守型';
  if (text.includes('波动') || text.includes('激进') || text.includes('进取')) info.riskTolerance = '进取型';
  return info;
};

const getSmartGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
};

export function AIAdvisorDemo({ currentPage = 1, onNavigate, onOpenAssetXRay, newChatRequest = 0 }: AIAdvisorDemoProps) {
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const saved = localStorage.getItem('alphamind_sessions');
      return saved ? JSON.parse(saved) : mockSessions;
    } catch {
      return mockSessions;
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState('089');
  const [messages, setMessages] = useState(() => {
    const currentSession = sessions.find(s => s.id === '089');
    return currentSession?.messages || mockMessages;
  });
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  });
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>({});
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastNewChatRequestRef = useRef(newChatRequest);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateSuggestions = (lastMessage: any) => {
    if (lastMessage.type === 'analysis') {
      return [
        '这个配置方案的预期收益是多少？',
        '如果市场下跌该怎么调整？',
        '能帮我优化一下这个方案吗？',
      ];
    }
    return [
      '我想了解更多投资产品',
      '帮我评估一下风险',
      '制定一个长期投资计划',
    ];
  };

  const closeMobileSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handlePageNavigate = (page: number) => {
    onNavigate?.(page);
    closeMobileSidebar();
  };

  const createNewSession = () => {
    const newSession: Session = {
      id: String(Math.floor(Math.random() * 900) + 100),
      title: '新对话',
      timestamp: '刚刚',
      messages: [],
      userProfile: {},
    };
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setUserProfile({});

    try {
      localStorage.setItem('alphamind_sessions', JSON.stringify(updatedSessions));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }
  };

  useEffect(() => {
    if (newChatRequest === lastNewChatRequestRef.current) return;

    lastNewChatRequestRef.current = newChatRequest;
    createNewSession();
  }, [newChatRequest]);

  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages.length > 0 ? session.messages : []);
      setUserProfile(session.userProfile || {});
    }
  };

  const deleteSession = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (sessions.length <= 1) return;

    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);

    try {
      localStorage.setItem('alphamind_sessions', JSON.stringify(updatedSessions));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }

    if (currentSessionId === sessionId) {
      const firstSession = updatedSessions[0];
      setCurrentSessionId(firstSession.id);
      setMessages(firstSession.messages.length > 0 ? firstSession.messages : []);
      setUserProfile(firstSession.userProfile || {});
    }
  };

  const handleSend = (questionText?: string) => {
    const messageText = questionText || input;
    if (messageText.trim() || uploadedImage) {
      const extractedInfo = extractUserInfo(messageText);
      if (Object.keys(extractedInfo).length > 0) {
        setUserProfile({ ...userProfile, ...extractedInfo });
      }

      const intent = detectIntent(messageText);

      const userMessage: any = {
        role: 'user',
        content: messageText || '已上传图片进行分析',
        type: uploadedImage ? 'image' : 'text',
        imageUrl: uploadedImage,
        intent,
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput('');
      setUploadedImage(null);
      setSuggestedQuestions([]);
      setIsAnalyzing(true);

      setTimeout(() => {
        setIsTyping(true);
        const shouldShowChart = intent !== 'asset_xray' && (intent === 'allocation' || Math.random() > 0.6);

        let responseContent = '';
        let reasons = [];

        if (intent === 'asset_xray') {
          const symbol = extractStockSymbol(messageText) ?? 'TSLA';
          responseContent = `我已识别到 ${symbol} 个股深度检测请求，可以为您打开资产透视仪表盘`;
          reasons = [
            { icon: '🔎', text: `${symbol} 的完整检测会进入 Asset X-Ray，包含雷达评分、情绪仪表盘、概率预测锥和 AI 诊断结论。` },
            { icon: '🧠', text: '当前 AlphaMind 已支持通过数据适配层接入 QuantDinger；服务不可用时会自动保留本地 mock fallback。' },
            { icon: '🛡️', text: '该流程只做研究分析，不触发实盘交易。' },
          ];
        } else if (intent === 'risk_assessment') {
          responseContent = `${getSmartGreeting()}！我已为您完成风险评估分析`;
          reasons = [
            { icon: '🎯', text: `M3模型分析：基于您${userProfile.age ? `${userProfile.age}岁的年龄` : '的情况'}，风险承受能力评估为中等偏上` },
            { icon: '📊', text: 'M4引擎建议：当前可适度提高权益类资产配置比例' },
            { icon: '💡', text: 'LLM提示：建议定期review风险偏好，随年龄调整配置策略' },
          ];
        } else if (intent === 'allocation') {
          responseContent = '根据您的资产情况，我为您定制了以下配置方案';
          reasons = [
            { icon: '🎯', text: `M3预测：${userProfile.amount ? `以${(userProfile.amount/10000).toFixed(0)}万元资金` : '您的资金'}进行配置，建议采用核心-卫星策略` },
            { icon: '📈', text: 'M4优化：科技板块当前估值合理，可作为核心配置' },
            { icon: '💡', text: 'LLM建议：定投策略可平滑市场波动，建议每月固定投入' },
          ];
        } else if (intent === 'retirement') {
          responseContent = '退休规划需要长期视角，我为您制定了以下方案';
          reasons = [
            { icon: '🎯', text: `M3测算：假设${userProfile.age || 30}岁退休，需要提前${65-(userProfile.age || 30)}年规划` },
            { icon: '📈', text: 'M4建议：采用目标日期策略，随年龄递减风险资产配置' },
            { icon: '💡', text: 'LLM提示：考虑通货膨胀因素，建议配置部分抗通胀资产' },
          ];
        } else {
          responseContent = shouldShowChart ? '根据当前市场趋势分析，我为您准备了以下投资建议' : '基于您的信息，我已完成风险评估和资产配置分析';
          reasons = [
            { icon: '🎯', text: 'M3模型预测：当前市场波动率处于中等水平，建议适度配置权益资产' },
            { icon: '📈', text: 'M4配置引擎：基于您的年龄和风险承受能力，优化了科技板块配置' },
            { icon: '💡', text: 'LLM解释：债券和黄金作为防御性资产，可在市场下跌时提供保护' },
          ];
        }

        let currentIndex = 0;
        const typingInterval = setInterval(() => {
          if (currentIndex <= responseContent.length) {
            setTypingText(responseContent.substring(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typingInterval);
            setIsTyping(false);

            const riskScore = Math.floor(Math.random() * 40) + 50;
            const analysisMessage = {
              role: 'assistant',
              content: responseContent,
              type: 'analysis',
              showInlineChart: shouldShowChart,
              riskScore,
              riskLevel: riskScore < 40 ? '保守型' : riskScore < 70 ? '成长型' : '进取型',
              portfolio: intent === 'asset_xray'
                ? []
                : [
                    { name: '科技', value: Math.floor(Math.random() * 30) + 30, color: '#C44536' },
                    { name: '债券', value: Math.floor(Math.random() * 20) + 20, color: '#D97706' },
                    { name: '黄金', value: Math.floor(Math.random() * 20) + 10, color: '#FBBF24' },
                  ],
              reasons,
              warnings: riskScore > 75 ? ['⚠️ 高风险配置，请确保您能承受较大波动'] : [],
              nextSteps: [
                '📝 定期复盘投资表现',
                '💰 考虑定投策略分批入场',
                '🎓 学习相关投资知识',
              ],
              assetSymbol: intent === 'asset_xray' ? extractStockSymbol(messageText) ?? 'TSLA' : undefined,
            };

            if (analysisMessage.portfolio.length > 0) {
              const total = analysisMessage.portfolio.reduce((sum, item) => sum + item.value, 0);
              analysisMessage.portfolio = analysisMessage.portfolio.map(item => ({
                ...item,
                value: Math.round((item.value / total) * 100)
              }));
            }

            const updatedMessages = [...newMessages, analysisMessage];
            setMessages(updatedMessages);

            setSuggestedQuestions(generateSuggestions(analysisMessage));

            const updatedSessions = sessions.map(s =>
              s.id === currentSessionId
                ? {
                    ...s,
                    messages: updatedMessages,
                    title: messageText.substring(0, 12) + '...',
                    timestamp: '刚刚',
                    userProfile: { ...s.userProfile, ...extractedInfo }
                  }
                : s
            );
            setSessions(updatedSessions);

            try {
              localStorage.setItem('alphamind_sessions', JSON.stringify(updatedSessions));
            } catch (e) {
              console.error('Failed to save sessions:', e);
            }

            setIsAnalyzing(false);
          }
        }, 30);
      }, 800);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      setInput('我想投资股票和债券');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setInput('识别到：资产负债表 - 总资产: ¥500,000, 负债: ¥100,000');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id="demo" className="w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] am-page-bg flex overflow-hidden">
      {/* Backdrop for mobile sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 am-backdrop backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed md:relative left-0 top-0 bottom-0 w-64 am-sidebar-surface border-r am-border-subtle z-50 md:z-auto flex flex-col"
          >
            <div className="p-3 border-b am-border-subtle">
              <div className="space-y-1">
                {globalNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;

                  return (
                    <button
                      key={item.label}
                      onClick={() => handlePageNavigate(item.page)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        isActive
                          ? 'am-brand-soft am-brand'
                          : 'am-text-secondary am-hover-surface am-hover-text-primary'
                      }`}
                    >
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  createNewSession();
                  closeMobileSidebar();
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 am-card am-hover-surface am-text-primary rounded-lg transition-all"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">开启新对话</span>
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto px-2 py-3">
              <div className="px-2 pb-2 text-xs font-medium am-text-tertiary">历史记录</div>
              <div className="space-y-1">
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    className="relative group"
                  >
                    <button
                      onClick={() => {
                        switchSession(session.id);
                        closeMobileSidebar();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        currentSessionId === session.id
                          ? 'am-card-strong am-text-primary'
                          : 'am-text-secondary am-hover-surface am-hover-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={14} />
                        <span className="text-xs opacity-60">#{session.id}</span>
                      </div>
                      <p className="text-sm truncate pr-6">{session.title}</p>
                      <p className="text-xs opacity-40 mt-1">{session.timestamp}</p>
                    </button>

                    {sessions.length > 1 && (
                      <button
                        className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => deleteSession(session.id, e)}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        {/* Mobile Menu Button */}
        <div className="md:hidden p-3 border-b am-border-subtle">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 am-hover-surface rounded-lg transition-colors"
          >
            <Menu size={20} className="am-text-secondary" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 pt-8 pb-40 sm:pb-44">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C44536] to-orange-600 flex items-center justify-center">
                  <span className="text-3xl">🤖</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold am-text-primary mb-2">{getSmartGreeting()}！我是 AlphaMind AI</h2>
                  <p className="am-text-secondary">您的专属智能投资顾问</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mt-8">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q.text)}
                      className="p-4 am-card am-hover-surface rounded-xl transition-all text-left"
                    >
                      <div className="text-2xl mb-2">{q.icon}</div>
                      <p className="text-sm am-text-secondary">{q.text}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={`message-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {message.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] am-brand-soft rounded-2xl px-4 py-3">
                          {message.imageUrl && (
                            <img src={message.imageUrl} alt="Uploaded" className="w-full rounded-lg mb-2 max-h-32 object-cover" />
                          )}
                          <p className="am-text-primary text-sm">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C44536] to-orange-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">🤖</span>
                          </div>
                          <div className="flex-1 space-y-3">
                            <p className="am-text-primary text-sm leading-relaxed">{message.content}</p>

                            {message.type === 'analysis' && (
                              <>
                                {message.showInlineChart && (
                                  <div className="am-card rounded-xl p-4">
                                    <ResponsiveContainer width="100%" height={150}>
                                      <AreaChart data={marketTrendData}>
                                        <defs>
                                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C44536" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#C44536" stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--am-chart-grid)" />
                                        <XAxis dataKey="date" stroke="var(--am-chart-axis)" style={{ fontSize: '10px' }} />
                                        <YAxis stroke="var(--am-chart-axis)" style={{ fontSize: '10px' }} />
                                        <Tooltip
                                          contentStyle={{
                                            backgroundColor: 'var(--am-tooltip-bg)',
                                            border: '1px solid var(--am-border-subtle)',
                                            borderRadius: '8px',
                                            color: 'var(--am-text-primary)',
                                          }}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#C44536" fillOpacity={1} fill="url(#colorValue)" />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                    <p className="text-xs am-text-tertiary mt-2 text-center">市场趋势图 - 近6个月</p>
                                  </div>
                                )}

                                {!message.assetSymbol && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-3 py-1 bg-amber-600/10 text-amber-400 rounded-full text-xs">
                                      🎯 M3风险评分: {message.riskScore}/100
                                    </span>
                                    <span className="px-3 py-1 am-brand-soft am-brand rounded-full text-xs">
                                      📊 {message.riskLevel}
                                    </span>
                                  </div>
                                )}

                                {message.portfolio?.length > 0 && (
                                  <div className="am-card rounded-xl p-4">
                                  <h4 className="text-sm font-medium am-text-primary mb-3">💼 资产配置建议</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <ResponsiveContainer width="100%" height={140}>
                                      <PieChart>
                                        <Pie
                                          data={message.portfolio}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={25}
                                          outerRadius={50}
                                          dataKey="value"
                                          label={(entry) => `${entry.value}%`}
                                        >
                                          {message.portfolio.map((entry: any, idx: number) => (
                                            <Cell key={`cell-${idx}`} fill={entry.color} />
                                          ))}
                                        </Pie>
                                      </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-col justify-center space-y-2">
                                      {message.portfolio.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                          <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="am-text-secondary">{item.name}</span>
                                          </div>
                                          <span className="am-text-primary font-medium">{item.value}%</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium am-text-primary">💡 决策解释</h4>
                                  {message.reasons.map((reason: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm am-text-secondary am-card rounded-lg p-3">
                                      <span>{reason.icon}</span>
                                      <p className="flex-1">{reason.text}</p>
                                    </div>
                                  ))}
                                </div>

                                {message.warnings && message.warnings.length > 0 && (
                                  <div className="am-danger-surface border rounded-lg p-3">
                                    {message.warnings.map((warning: string, idx: number) => (
                                      <p key={idx} className="text-sm">{warning}</p>
                                    ))}
                                  </div>
                                )}

                                {message.assetSymbol && (
                                  <button
                                    onClick={() => {
                                      if (onOpenAssetXRay) {
                                        onOpenAssetXRay(message.assetSymbol);
                                      } else {
                                        onNavigate?.(3);
                                      }
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg am-brand-soft am-brand border am-border-brand text-sm font-semibold"
                                  >
                                    <ScanSearch size={16} />
                                    打开 {message.assetSymbol} 资产透视
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {(isAnalyzing || isTyping) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C44536] to-orange-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🤖</span>
                    </div>
                    <div className="flex-1">
                      {isTyping ? (
                        <p className="am-text-primary text-sm">
                          {typingText}
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >|</motion.span>
                        </p>
                      ) : (
                        <div className="flex items-center gap-2 am-text-secondary">
                          <div className="w-4 h-4 border-2 border-[#C44536] border-t-transparent rounded-full am-loader-spin" />
                          <span className="text-sm">正在分析...</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {suggestedQuestions.length > 0 && !isAnalyzing && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs am-text-tertiary w-full mb-1">💡 您可能还想问：</span>
                    {suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className="px-3 py-1.5 am-card am-hover-surface rounded-full text-xs am-text-secondary am-hover-text-primary transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Sticky Input Area */}
        <div className="sticky bottom-0 z-20 border-t am-sticky-input backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-4 py-4">
            {uploadedImage && (
              <div className="mb-3 relative inline-block">
                <img src={uploadedImage} alt="Preview" className="h-16 rounded-lg" />
                <button
                  onClick={() => setUploadedImage(null)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 am-on-brand rounded-full flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1 am-input-surface border rounded-2xl flex items-center gap-2 px-3 py-2">
                <button
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-lg transition-all ${
                    isListening ? 'bg-red-500 am-on-brand' : 'am-hover-surface am-text-secondary'
                  }`}
                >
                  <Mic size={18} />
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 am-hover-surface rounded-lg transition-colors am-text-secondary"
                >
                  <ImageIcon size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleSend()}
                  placeholder="输入投资问题..."
                  className="flex-1 bg-transparent am-text-primary am-placeholder focus:outline-none text-sm"
                  disabled={isAnalyzing}
                />
              </div>

              <button
                onClick={() => handleSend()}
                disabled={isAnalyzing || isTyping || (!input.trim() && !uploadedImage)}
                className="p-3 am-brand-bg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUp size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
