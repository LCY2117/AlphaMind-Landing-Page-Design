import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon, Monitor, Globe, User, Database, FileText, Settings as SettingsIcon, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeMode, useThemeMode } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'account' | 'data' | 'terms';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useThemeMode();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [language, setLanguage] = useState<'zh-CN' | 'en-US'>('zh-CN');
  const [clearMessage, setClearMessage] = useState('');

  const tabs = [
    { id: 'general' as TabType, label: '通用设置', icon: SettingsIcon },
    { id: 'account' as TabType, label: '演示身份', icon: User },
    { id: 'data' as TabType, label: '数据管理', icon: Database },
    { id: 'terms' as TabType, label: '服务协议', icon: FileText },
  ];

  const themes = [
    { id: 'light' as ThemeMode, label: '浅色', icon: Sun },
    { id: 'dark' as ThemeMode, label: '深色', icon: Moon },
    { id: 'system' as ThemeMode, label: '跟随系统', icon: Monitor },
  ];

  const languages = [
    { id: 'zh-CN' as const, label: '简体中文' },
    { id: 'en-US' as const, label: 'English' },
  ];

  const handleClearLocalData = () => {
    ['alphamind_user', 'alphamind_sessions', 'alphamind_risk_profile', 'alphamind_theme'].forEach((key) => {
      localStorage.removeItem(key);
    });
    logout();
    setClearMessage('本地演示数据已清除，刷新后将恢复默认演示状态。');
  };

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
            className="fixed inset-0 am-backdrop backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-4xl sm:h-auto sm:max-h-[80vh] am-surface rounded-2xl border-2 am-border-brand z-[101] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b am-border-subtle">
              <h2 className="text-xl sm:text-2xl font-bold am-text-primary">设置</h2>
              <button
                onClick={onClose}
                className="p-2 am-hover-surface rounded-lg transition-colors"
              >
                <X size={24} className="am-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar - Tabs */}
              <div className="w-48 sm:w-56 am-card border-r am-border-subtle p-4 space-y-2 overflow-y-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'am-brand-bg am-on-brand shadow-lg'
                          : 'bg-transparent am-text-secondary am-hover-surface am-hover-text-primary'
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
                      <h3 className="text-lg font-semibold am-text-primary mb-4 flex items-center gap-2">
                        <Sun size={20} className="text-[#C44536]" />
                        主题设置
                        <span className="text-xs font-normal am-text-secondary">
                          当前为{resolvedTheme === 'dark' ? '深色' : '浅色'}
                        </span>
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
                                  ? 'am-border-brand am-brand-soft'
                                  : 'am-card am-hover-border-brand'
                              }`}
                            >
                              <Icon size={24} className={theme === themeOption.id ? 'am-brand' : 'am-text-secondary'} />
                              <span className={`text-sm font-medium ${theme === themeOption.id ? 'am-brand' : 'am-text-secondary'}`}>
                                {themeOption.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Language Selection */}
                    <div>
                      <h3 className="text-lg font-semibold am-text-primary mb-4 flex items-center gap-2">
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
                                : 'am-card am-text-secondary am-hover-border-brand'
                            }`}
                          >
                            <span className="text-sm font-medium">{lang.label}</span>
                            {language === lang.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 rounded-full am-brand-bg am-on-brand flex items-center justify-center"
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
                    <h3 className="text-lg font-semibold am-text-primary mb-4 flex items-center gap-2">
                      <User size={20} className="text-[#C44536]" />
                      演示身份
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 am-card rounded-lg border">
                        <p className="text-sm am-text-secondary mb-2">身份信息</p>
                        {isAuthenticated ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C44536] to-orange-600 flex items-center justify-center">
                                  <User size={20} className="am-on-brand" />
                                </div>
                              )}
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="am-text-primary font-semibold">{user?.name}</p>
                                  <span className="rounded-full am-banner border px-2 py-0.5 text-[10px] am-brand">
                                    本地演示
                                  </span>
                                </div>
                                {user?.phone && (
                                  <p className="text-xs am-text-secondary">{user.phone}</p>
                                )}
                              </div>
                            </div>
                            <div className="pt-2 border-t am-border-subtle">
                              <p className="text-xs am-text-secondary">
                                进入方式: {user?.loginMethod === 'phone' ? '演示手机号' : '模拟微信'}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-xs am-text-tertiary">
                                <ShieldCheck size={13} />
                                当前不是正式注册账号，数据仅保存在当前浏览器。
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="am-text-primary font-semibold">未进入演示身份</p>
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
                          <span>退出演示身份</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onClose();
                            openLoginModal();
                          }}
                          className="w-full px-4 py-3 bg-gradient-to-r from-[#C44536] to-orange-600 am-on-brand rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(196,69,54,0.4)] transition-all"
                        >
                          进入演示身份
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold am-text-primary mb-4 flex items-center gap-2">
                      <Database size={20} className="text-[#C44536]" />
                      数据管理
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 am-card rounded-lg border">
                        <p className="text-sm am-text-secondary mb-2">本地数据</p>
                        <p className="am-text-primary text-sm">演示身份、会话历史、风险画像和主题偏好存储在本地浏览器中</p>
                      </div>
                      <button
                        onClick={handleClearLocalData}
                        className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 text-red-400 rounded-lg font-semibold transition-all"
                      >
                        清除本地演示数据
                      </button>
                      {clearMessage && (
                        <p className="text-xs am-text-secondary text-center">{clearMessage}</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'terms' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold am-text-primary mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-[#C44536]" />
                      服务协议
                    </h3>
                    <div className="space-y-4 text-sm am-text-secondary leading-relaxed">
                      <div className="p-4 am-card rounded-lg border">
                        <h4 className="font-semibold am-text-primary mb-2">用户协议</h4>
                        <p>当前版本用于产品演示，不会创建真实账号或发起实盘交易。</p>
                      </div>
                      <div className="p-4 am-card rounded-lg border">
                        <h4 className="font-semibold am-text-primary mb-2">隐私政策</h4>
                        <p>演示数据保存在浏览器本地；接入正式后端前不上传个人认证信息。</p>
                      </div>
                      <div className="p-4 am-card rounded-lg border">
                        <h4 className="font-semibold am-text-primary mb-2">免责声明</h4>
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
