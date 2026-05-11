import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Image as ImageIcon, History, Send, HelpCircle, AlertCircle, Upload, X, CheckCircle, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';

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

const riskTrendData = [
  { month: '1月', risk: 45 },
  { month: '2月', risk: 52 },
  { month: '3月', risk: 48 },
  { month: '4月', risk: 55 },
  { month: '5月', risk: 65 },
];

// Market trend data for inline charts
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

const mockSessions: Session[] = [
  { id: '089', title: '股票投资咨询', timestamp: '2小时前', messages: mockMessages, userProfile: { age: 30, amount: 200000 } },
  { id: '092', title: '退休规划', timestamp: '昨天', messages: [] },
  { id: '093', title: '基金定投', timestamp: '3天前', messages: [] },
];

const quickQuestions = [
  { icon: '💰', text: '如何开始投资理财？', category: 'beginner' },
  { icon: '📊', text: '帮我评估投资风险', category: 'risk' },
  { icon: '🎯', text: '制定退休储蓄计划', category: 'planning' },
  { icon: '💎', text: '推荐适合我的基金', category: 'product' },
];

// Smart intent detection
const detectIntent = (text: string) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('风险') || lowerText.includes('波动')) return 'risk_assessment';
  if (lowerText.includes('配置') || lowerText.includes('分配')) return 'allocation';
  if (lowerText.includes('推荐') || lowerText.includes('建议')) return 'recommendation';
  if (lowerText.includes('退休') || lowerText.includes('养老')) return 'retirement';
  if (lowerText.includes('基金') || lowerText.includes('股票')) return 'product';
  return 'general';
};

// Extract user info from text
const extractUserInfo = (text: string) => {
  const info: any = {};

  // Extract age
  const ageMatch = text.match(/(\d+)岁|年龄\s*(\d+)|我\s*(\d+)/);
  if (ageMatch) {
    info.age = parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3]);
  }

  // Extract amount
  const amountMatch = text.match(/(\d+)万/);
  if (amountMatch) {
    info.amount = parseInt(amountMatch[1]) * 10000;
  }

  // Risk tolerance
  if (text.includes('保守') || text.includes('稳健')) info.riskTolerance = '保守型';
  if (text.includes('波动') || text.includes('激进') || text.includes('进取')) info.riskTolerance = '进取型';

  return info;
};

// Get smart greeting based on time
const getSmartGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
};

export function AIAdvisorDemo() {
  // Load sessions from localStorage on mount
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
  const [showSidebar, setShowSidebar] = useState(true);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>({});
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate smart suggested questions based on conversation context
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

    // Save to localStorage
    try {
      localStorage.setItem('alphamind_sessions', JSON.stringify(updatedSessions));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }
  };

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

    // Don't delete if it's the only session
    if (sessions.length <= 1) return;

    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);

    // Save to localStorage
    try {
      localStorage.setItem('alphamind_sessions', JSON.stringify(updatedSessions));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }

    // If deleting current session, switch to first available
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
      // Extract user information intelligently
      const extractedInfo = extractUserInfo(messageText);
      if (Object.keys(extractedInfo).length > 0) {
        setUserProfile({ ...userProfile, ...extractedInfo });
      }

      // Detect intent
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

      // Simulate typing effect and intelligent response
      setTimeout(() => {
        setIsTyping(true);
        const shouldShowChart = intent === 'allocation' || Math.random() > 0.6;

        // Generate personalized response based on intent and user profile
        let responseContent = '';
        let reasons = [];

        if (intent === 'risk_assessment') {
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

        // Simulate typing
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
          if (currentIndex <= responseContent.length) {
            setTypingText(responseContent.substring(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typingInterval);
            setIsTyping(false);

            // Generate analysis message
            const riskScore = Math.floor(Math.random() * 40) + 50;
            const analysisMessage = {
              role: 'assistant',
              content: responseContent,
              type: 'analysis',
              showInlineChart: shouldShowChart,
              riskScore,
              riskLevel: riskScore < 40 ? '保守型' : riskScore < 70 ? '成长型' : '进取型',
              portfolio: [
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
            };

            // Ensure portfolio values sum to 100
            const total = analysisMessage.portfolio.reduce((sum, item) => sum + item.value, 0);
            analysisMessage.portfolio = analysisMessage.portfolio.map(item => ({
              ...item,
              value: Math.round((item.value / total) * 100)
            }));

            const updatedMessages = [...newMessages, analysisMessage];
            setMessages(updatedMessages);

            // Generate smart suggestions for next question
            setSuggestedQuestions(generateSuggestions(analysisMessage));

            // Update session with persistence
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

            // Save to localStorage for persistence
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
      // Fallback for browsers without speech recognition
      setInput('我想投资股票和债券');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        // Simulate OCR recognition
        setInput('识别到：资产负债表 - 总资产: ¥500,000, 负债: ¥100,000');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id="demo" className="w-full h-full bg-gradient-to-b from-[#1F1410] to-[#2D1B13] overflow-y-auto">
      <div className="w-full py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-center text-white mb-12"
        >
          对话式智能投顾
        </motion.h2>

        <div className="flex gap-6">
          {/* Left Sidebar: Session History */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                className="w-64 flex-shrink-0"
              >
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase">智能投顾</h3>
                  </div>

                  <button
                    onClick={createNewSession}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#C44536] to-orange-600 text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(196,69,54,0.4)] transition-all"
                  >
                    <Plus size={18} />
                    <span>新对话</span>
                  </button>

                  <div className="space-y-2 pt-2">
                    <p className="text-xs text-gray-500 uppercase px-2">历史会话</p>
                    {sessions.map((session) => (
                      <motion.div
                        key={session.id}
                        className="relative group"
                      >
                        <motion.button
                          onClick={() => switchSession(session.id)}
                          whileHover={{ x: 4 }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                            currentSessionId === session.id
                              ? 'bg-[#C44536]/20 border border-[#C44536]/50 text-[#C44536]'
                              : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare size={14} />
                            <span className="text-xs font-mono">#{session.id}</span>
                          </div>
                          <p className="text-sm truncate pr-6">{session.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{session.timestamp}</p>
                        </motion.button>

                        {/* Delete button */}
                        {sessions.length > 1 && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => deleteSession(session.id, e)}
                          >
                            <Trash2 size={12} />
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Chat Interface */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl border-2 border-[#FFA500]/30 overflow-hidden flex flex-col shadow-[0_0_30px_rgba(255,165,0,0.15)]"
              style={{ height: '700px' }}
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#FFA500]/20 to-transparent px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <History size={20} className="text-[#C44536]" />
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-white">AI 智能投顾</h3>
                    <p className="text-xs text-gray-400">会话 #{currentSessionId}</p>
                  </div>
                </div>
                <button
                  onClick={createNewSession}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#C44536] rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  <Plus size={16} />
                  新对话
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C44536] to-amber-700 flex items-center justify-center"
                    >
                      <span className="text-4xl">🤖</span>
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{getSmartGreeting()}！我是 AlphaMind AI</h3>
                      <p className="text-gray-400">您的专属智能投资顾问，让我帮您规划财富未来</p>
                    </div>

                    {/* Quick question cards */}
                    <div className="grid grid-cols-2 gap-3 max-w-md mt-8">
                      {quickQuestions.map((q, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          onClick={() => handleSend(q.text)}
                          className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C44536]/50 rounded-xl transition-all text-left group"
                        >
                          <div className="text-2xl mb-2">{q.icon}</div>
                          <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{q.text}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={`message-${index}-${message.role}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    {/* User/Bot Label */}
                    <div className={`text-xs font-semibold ${message.role === 'user' ? 'text-[#C44536]' : 'text-[#FFA500]'}`}>
                      {message.role === 'user' ? 'B:' : 'AI:'}
                    </div>

                    <div className={`${message.role === 'user' ? '' : 'border-2 border-[#FFA500]/40 rounded-xl p-4 bg-gradient-to-br from-[#FFA500]/5 to-transparent'}`}>
                      {message.role === 'user' ? (
                        <div className="bg-[#C44536]/10 border border-[#C44536]/30 text-white px-4 py-3 rounded-xl space-y-2">
                          {message.imageUrl && (
                            <img src={message.imageUrl} alt="Uploaded" className="w-full rounded-lg max-h-32 object-cover" />
                          )}
                          <div>{message.content}</div>
                        </div>
                      ) : message.type === 'analysis' ? (
                        <div className="space-y-4">
                          <div className="text-white">{message.content}</div>

                          {/* Inline Chart - inspired by your classmate's demo */}
                          {message.showInlineChart && (
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                              <div className="w-full" style={{ height: '150px' }}>
                                <ResponsiveContainer width="100%" height={150}>
                                  <AreaChart data={marketTrendData}>
                                    <defs>
                                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C44536" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#C44536" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="#C44536" style={{ fontSize: '10px' }} />
                                    <YAxis stroke="#C44536" style={{ fontSize: '10px' }} />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: 'rgba(31, 20, 16, 0.9)',
                                        border: '1px solid rgba(100, 255, 218, 0.3)',
                                        borderRadius: '8px',
                                      }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#C44536" fillOpacity={1} fill="url(#colorValue)" />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                              <p className="text-xs text-gray-400 mt-2 text-center">市场趋势图 - 近6个月</p>
                            </div>
                          )}

                          {/* M3 Risk Prediction Badge */}
                          <div className="flex items-center gap-2 text-xs flex-wrap">
                            <span className="px-3 py-1.5 bg-amber-600/20 text-amber-400 rounded-full font-semibold border border-amber-600/30">
                              🎯 M3风险评分: {message.riskScore}/100
                            </span>
                            <span className="px-3 py-1.5 bg-[#C44536]/20 text-[#C44536] rounded-full font-semibold border border-[#C44536]/30">
                              📊 {message.riskLevel}
                            </span>
                          </div>

                          {/* Inline Portfolio Chart */}
                          <div className="bg-white/5 rounded-lg p-4 border border-[#FFA500]/20">
                            <h4 className="text-sm font-semibold text-white mb-3">💼 M4 资产配置建议</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="w-full" style={{ height: '160px' }}>
                                <ResponsiveContainer width="100%" height={160}>
                                  <PieChart>
                                    <Pie
                                      data={message.portfolio}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={30}
                                      outerRadius={60}
                                      fill="#8884d8"
                                      dataKey="value"
                                      label={(entry) => `${entry.value}%`}
                                    >
                                      {message.portfolio.map((entry: any, idx: number) => (
                                        <Cell key={`inline-cell-${entry.name}-${idx}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="flex flex-col justify-center space-y-2">
                                {message.portfolio.map((item: any, idx: number) => (
                                  <div key={`inline-legend-${item.name}-${idx}`} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                      <span className="text-gray-300">{item.name}</span>
                                    </div>
                                    <span className="text-white font-semibold">{item.value}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* LLM Reasoning */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-white">💡 LLM 决策解释</h4>
                            {message.reasons.map((reason: any, idx: number) => (
                              <div
                                key={`inline-reason-${idx}`}
                                className="flex items-start gap-2 p-2 bg-white/5 rounded-lg text-sm text-gray-300"
                              >
                                <span>{reason.icon}</span>
                                <p className="flex-1">{reason.text}</p>
                              </div>
                            ))}
                          </div>

                          {/* Risk Warnings */}
                          {message.warnings && message.warnings.length > 0 && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                              {message.warnings.map((warning: string, idx: number) => (
                                <p key={idx} className="text-sm text-red-300">{warning}</p>
                              ))}
                            </div>
                          )}

                          {/* Smart Next Steps */}
                          {message.nextSteps && message.nextSteps.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-white">🎯 建议后续行动</h4>
                              <div className="grid gap-2">
                                {message.nextSteps.map((step: string, idx: number) => (
                                  <div
                                    key={`next-step-${idx}`}
                                    className="flex items-center gap-2 p-2 bg-[#C44536]/5 border border-[#C44536]/20 rounded-lg text-sm text-gray-300"
                                  >
                                    <CheckCircle size={14} className="text-[#C44536] flex-shrink-0" />
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-white">
                          {message.content}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {(isAnalyzing || isTyping) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="text-xs font-semibold text-[#FFA500]">AI:</div>
                    <div className="border-2 border-[#FFA500]/40 rounded-xl p-4 bg-gradient-to-br from-[#FFA500]/5 to-transparent">
                      {isTyping ? (
                        <div className="text-white">
                          <p className="text-sm">{typingText}<motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >|</motion.span></p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-white">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-[#C44536] border-t-transparent rounded-full"
                          />
                          <span className="text-sm">正在调用 M3 风险预测 + M4 资产配置 + LLM 解释...</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Smart suggested questions */}
                {suggestedQuestions.length > 0 && !isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2"
                  >
                    <span className="text-xs text-gray-500">💡 您可能还想问：</span>
                    {suggestedQuestions.map((q, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSend(q)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-[#C44536]/10 border border-white/10 hover:border-[#C44536]/30 rounded-full text-xs text-gray-300 hover:text-[#C44536] transition-all"
                      >
                        {q}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-[#FFA500]/20 bg-gradient-to-t from-[#FFA500]/5 to-transparent">
                {uploadedImage && (
                  <div className="mb-3 relative inline-block">
                    <img src={uploadedImage} alt="Preview" className="h-20 rounded-lg border-2 border-[#C44536]/30" />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <motion.button
                    onClick={handleVoiceInput}
                    animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
                    className={`p-2.5 rounded-lg transition-all ${
                      isListening
                        ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                        : 'bg-white/5 text-[#C44536] hover:bg-white/10 border border-white/10'
                    }`}
                    title="语音输入"
                  >
                    <Mic size={20} />
                  </motion.button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 bg-white/5 text-[#C44536] hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                    title="上传图片 (OCR识别)"
                  >
                    <ImageIcon size={20} />
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
                    placeholder="请输入您的投资问题或需求..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C44536]/50 focus:ring-2 focus:ring-[#C44536]/20"
                    disabled={isAnalyzing}
                  />
                </div>

                {/* Action Buttons - inspired by your classmate */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSend()}
                    disabled={isAnalyzing || isTyping || (!input.trim() && !uploadedImage)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#C44536] to-orange-600 text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(196,69,54,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    <span>{isTyping ? '正在回复...' : '提交问题'}</span>
                  </button>

                  <button
                    onClick={createNewSession}
                    disabled={isAnalyzing || isTyping}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-[#FFA500] border border-[#FFA500]/30 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">开始新对话</span>
                  </button>
                </div>

                {/* User Profile Display */}
                {Object.keys(userProfile).length > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>📋 已识别信息：</span>
                    {userProfile.age && <span className="px-2 py-1 bg-amber-600/10 text-amber-400 rounded">年龄 {userProfile.age}岁</span>}
                    {userProfile.amount && <span className="px-2 py-1 bg-[#C44536]/10 text-[#C44536] rounded">资金 {(userProfile.amount/10000).toFixed(0)}万</span>}
                    {userProfile.riskTolerance && <span className="px-2 py-1 bg-orange-500/10 text-orange-300 rounded">{userProfile.riskTolerance}</span>}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
      </div>
    </section>
  );
}
