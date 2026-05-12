import { Settings, LogIn, User, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from '../../imports/alphamind-logo.png';
import { SettingsModal } from './SettingsModal';
import { useAuth } from '../contexts/AuthContext';

export function Navigation() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 am-nav-surface backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src={logoImg}
                alt="AlphaMind Logo"
                className="h-8 sm:h-10 lg:h-12 w-auto"
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
                          className="absolute right-0 top-full mt-2 w-48 am-surface backdrop-blur-xl border am-border-brand rounded-lg z-50 overflow-hidden"
                        >
                          <div className="p-3 border-b am-border-subtle">
                            <p className="text-sm am-text-primary font-medium">{user?.name}</p>
                            {user?.phone && (
                              <p className="text-xs am-text-secondary mt-1">{user.phone}</p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              setSettingsOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm am-text-secondary am-hover-surface am-hover-text-primary transition-colors"
                          >
                            <Settings size={16} />
                            <span>账号设置</span>
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
                  <span className="hidden sm:inline">登录 / 注册</span>
                  <span className="sm:hidden">登录</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
