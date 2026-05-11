import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon, Monitor, Globe, User, Database, FileText, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'account' | 'data' | 'terms';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [language, setLanguage] = useState<'zh-CN' | 'en-US'>('zh-CN');

  const tabs = [
    { id: 'general' as TabType, label: '通用设置', icon: SettingsIcon },
    { id: 'account' as TabType, label: '账号管理', icon: User },
    { id: 'data' as TabType, label: '数据管理', icon: Database },
    { id: 'terms' as TabType, label: '服务协议', icon: FileText },
  ];

  const themes = [
    { id: 'light' as const, label: '浅色', icon: Sun },
    { id: 'dark' as const, label: '深色', icon: Moon },
    { id: 'system' as const, label: '跟随系统', icon: Monitor },
  ];

  const languages = [
    { id: 'zh-CN' as const, label: '简体中文' },
    { id: 'en-US' as const, label: 'English' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-4xl sm:h-auto sm:max-h-[80vh] bg-gradient-to-br from-[#1F1410] via-[#2D1B13] to-[#1F1410] rounded-2xl border-2 border-[#C44536]/30 shadow-[0_0_50px_rgba(196,69,54,0.3)] z-[101] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white">设置</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar - Tabs */}
              <div className="w-48 sm:w-56 bg-white/5 border-r border-white/10 p-4 space-y-2 overflow-y-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#C44536] text-white shadow-lg'
                          : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Content Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    {/* Theme Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Sun size={20} className="text-[#C44536]" />
                        主题设置
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {themes.map((themeOption) => {
                          const Icon = themeOption.icon;
                          return (
                            <button
                              key={themeOption.id}
                              onClick={() => setTheme(themeOption.id)}
                              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                theme === themeOption.id
                                  ? 'border-[#C44536] bg-[#C44536]/10'
                                  : 'border-white/10 bg-white/5 hover:border-white/30'
                              }`}
                            >
                              <Icon size={24} className={theme === themeOption.id ? 'text-[#C44536]' : 'text-gray-400'} />
                              <span className={`text-sm font-medium ${theme === themeOption.id ? 'text-[#C44536]' : 'text-gray-400'}`}>
                                {themeOption.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Language Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-[#C44536]" />
                        语言设置
                      </h3>
                      <div className="space-y-2">
                        {languages.map((lang) => (
                          <button
                            key={lang.id}
                            onClick={() => setLanguage(lang.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                              language === lang.id
                                ? 'border-[#C44536] bg-[#C44536]/10 text-[#C44536]'
                                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                            }`}
                          >
                            <span className="text-sm font-medium">{lang.label}</span>
                            {language === lang.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 rounded-full bg-[#C44536] flex items-center justify-center"
                              >
                                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                  <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              </motion.div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <User size={20} className="text-[#C44536]" />
                      账号管理
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-gray-400 mb-2">账号信息</p>
                        {isAuthenticated ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C44536] to-orange-600 flex items-center justify-center">
                                  <User size={20} className="text-white" />
                                </div>
                              )}
                              <div>
                                <p className="text-white font-semibold">{user?.name}</p>
                                {user?.phone && (
                                  <p className="text-xs text-gray-400">{user.phone}</p>
                                )}
                              </div>
                            </div>
                            <div className="pt-2 border-t border-white/10">
                              <p className="text-xs text-gray-400">
                                登录方式: {user?.loginMethod === 'phone' ? '手机号' : '微信'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-white font-semibold">未登录</p>
                        )}
                      </div>
                      {isAuthenticated ? (
                        <button
                          onClick={() => {
                            logout();
                            onClose();
                          }}
                          className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 text-red-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <LogOut size={18} />
                          <span>退出登录</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onClose();
                            openLoginModal();
                          }}
                          className="w-full px-4 py-3 bg-gradient-to-r from-[#C44536] to-orange-600 text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(196,69,54,0.4)] transition-all"
                        >
                          登录账号
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Database size={20} className="text-[#C44536]" />
                      数据管理
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-gray-400 mb-2">本地数据</p>
                        <p className="text-white text-sm">会话历史、用户配置等数据存储在本地浏览器中</p>
                      </div>
                      <button className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 text-red-400 rounded-lg font-semibold transition-all">
                        清除所有数据
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'terms' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-[#C44536]" />
                      服务协议
                    </h3>
                    <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="font-semibold text-white mb-2">用户协议</h4>
                        <p>使用 AlphaMind 智能投顾服务即表示您同意我们的用户协议和隐私政策。</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="font-semibold text-white mb-2">隐私政策</h4>
                        <p>我们重视您的隐私，所有数据处理均遵循相关法律法规。</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="font-semibold text-white mb-2">免责声明</h4>
                        <p>本服务提供的投资建议仅供参考，不构成投资决策依据。投资有风险，入市需谨慎。</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
