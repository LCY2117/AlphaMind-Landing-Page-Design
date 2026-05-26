import { Settings, LogIn, User, LogOut, ChevronDown, ShieldCheck, Menu, Home, MessageSquare, Target, ScanSearch, Sparkles, Plus, X, BriefcaseBusiness } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from '../../imports/alphamind-logo.png';
import { SettingsModal } from './SettingsModal';
import { useAuth } from '../contexts/AuthContext';

const mobileNavItems = [
  { label: '首页', page: 0, icon: Home },
  { label: '对话投顾', page: 1, icon: MessageSquare },
  { label: '风险测试', page: 2, icon: Target },
  { label: '资产透视', page: 3, icon: ScanSearch },
  { label: '持仓监控', page: 4, icon: BriefcaseBusiness },
  { label: '核心功能', page: 5, icon: Sparkles },
];

interface NavigationProps {
  currentPage: number;
  onNavigate: (page: number) => void;
  onNewChat: () => void;
}

export function Navigation({ currentPage, onNavigate, onNewChat }: NavigationProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();

  const handleMobileNavigate = (page: number) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 am-nav-surface backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 am-hover-surface rounded-lg transition-colors"
                aria-label="打开页面导航"
              >
                <Menu size={20} className="am-text-secondary" />
              </button>
              <img
                src={logoImg}
                alt="AlphaMind Logo"
                className="h-8 sm:h-10 lg:h-12 w-auto cursor-pointer"
                onClick={() => onNavigate(0)}
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Settings Button */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 am-hover-surface rounded-lg transition-colors"
                title="设置"
              >
                <Settings size={20} className="am-text-secondary" />
              </button>

              {/* Login/User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 am-hover-surface rounded-lg transition-colors"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#C44536] to-orange-600 flex items-center justify-center">
                        <User size={14} className="am-on-brand" />
                      </div>
                    )}
                    <span className="text-sm am-text-primary hidden sm:inline">{user?.name}</span>
                    <span className="hidden lg:inline-flex rounded-full am-banner border px-2 py-0.5 text-[10px] am-brand">
                      本地
                    </span>
                    <ChevronDown size={16} className="am-text-tertiary" />
                  </button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setUserMenuOpen(false)}
                          className="fixed inset-0 z-40"
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-full mt-2 w-60 am-surface backdrop-blur-xl border am-border-brand rounded-lg z-50 overflow-hidden"
                        >
                          <div className="p-3 border-b am-border-subtle">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm am-text-primary font-medium">{user?.name}</p>
                              <span className="rounded-full am-banner border px-2 py-0.5 text-[10px] am-brand">
                                本地身份
                              </span>
                            </div>
                            {user?.phone && (
                              <p className="text-xs am-text-secondary mt-1">{user.phone}</p>
                            )}
                            <p className="mt-2 flex items-center gap-1.5 text-xs am-text-tertiary">
                              <ShieldCheck size={13} />
                              数据仅保存在当前浏览器
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              setSettingsOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm am-text-secondary am-hover-surface am-hover-text-primary transition-colors"
                          >
                            <Settings size={16} />
                            <span>身份设置</span>
                          </button>
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut size={16} />
                            <span>退出登录</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C44536] to-orange-600 am-on-brand rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(196,69,54,0.4)] transition-all text-sm"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">进入 AlphaMind</span>
                  <span className="sm:hidden">进入</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[80] am-backdrop backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
              className="fixed left-0 top-0 bottom-0 z-[90] w-72 am-sidebar-surface border-r am-border-subtle p-4 md:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <img src={logoImg} alt="AlphaMind" className="h-10 w-auto" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg am-hover-surface am-text-secondary"
                  aria-label="关闭页面导航"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-1">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleMobileNavigate(item.page)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${
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
                  onNewChat();
                  setMobileMenuOpen(false);
                }}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 am-card am-hover-surface am-text-primary rounded-lg transition-all"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">开启新对话</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
