import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Home, MessageSquare, Plus, Sparkles, Target } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { FeatureCards } from './components/FeatureCards';
import { AIAdvisorDemo } from './components/AIAdvisorDemo';
import { RiskAssessment } from './components/RiskAssessment';
import { LoginModal } from './components/LoginModal';
import { AuthProvider } from './contexts/AuthContext';

const PAGE_NAMES = ['首页', '对话投顾', '风险测试', '核心功能'];
const PAGE_NAV_ITEMS = [
  { label: PAGE_NAMES[0], page: 0, icon: Home },
  { label: PAGE_NAMES[1], page: 1, icon: MessageSquare },
  { label: PAGE_NAMES[2], page: 2, icon: Target },
  { label: PAGE_NAMES[3], page: 3, icon: Sparkles },
];

interface DesktopSidebarProps {
  currentPage: number;
  onNavigate: (page: number) => void;
  onNewChat: () => void;
}

function DesktopSidebar({ currentPage, onNavigate, onNewChat }: DesktopSidebarProps) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 bg-[#1E1E1E] border-r border-white/5 flex-col">
      <div className="p-3 border-b border-white/5">
        <div className="space-y-1">
          {PAGE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;

            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-[#C44536]/15 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                }`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onNewChat}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/90 rounded-lg transition-all"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">开启新对话</span>
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={() => onNavigate(1)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white/90 transition-all"
        >
          <History size={17} />
          <span>历史记录</span>
        </button>
      </div>
    </aside>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [newChatRequest, setNewChatRequest] = useState(0);

  const handleNavigate = useCallback((newPage: number) => {
    setCurrentPage((previousPage) => {
      if (newPage === previousPage) return previousPage;

      setDirection(newPage > previousPage ? 1 : -1);
      return newPage;
    });
  }, []);

  const handleNewChat = useCallback(() => {
    setNewChatRequest((request) => request + 1);
    handleNavigate(1);
  }, [handleNavigate]);

  const pages = [
    { component: <HeroSection />, name: PAGE_NAMES[0] },
    {
      component: (
        <AIAdvisorDemo
          currentPage={currentPage}
          onNavigate={handleNavigate}
          newChatRequest={newChatRequest}
        />
      ),
      name: PAGE_NAMES[1],
    },
    { component: <RiskAssessment />, name: PAGE_NAMES[2] },
    { component: <FeatureCards />, name: PAGE_NAMES[3] },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (currentPage < pages.length - 1) {
          handleNavigate(currentPage + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (currentPage > 0) {
          handleNavigate(currentPage - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, handleNavigate, pages.length]);

  // Custom navigation event
  useEffect(() => {
    const handleCustomNavigate = (e: CustomEvent) => {
      handleNavigate(e.detail);
    };

    window.addEventListener('navigate-to-page', handleCustomNavigate as EventListener);
    return () => window.removeEventListener('navigate-to-page', handleCustomNavigate as EventListener);
  }, [handleNavigate]);


  return (
    <AuthProvider>
      <div className="relative w-full min-h-screen bg-[#1F1410] text-white font-sans">
        {/* Navigation - always visible */}
        <Navigation />

        {/* Page Content with Transitions */}
        <div className="relative w-full min-h-screen pt-14 sm:pt-16">
          <div className="flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
            {currentPage !== 1 && (
              <DesktopSidebar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onNewChat={handleNewChat}
              />
            )}

            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  initial={{
                    opacity: 0,
                    x: direction > 0 ? '100%' : '-100%',
                    scale: 0.9
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    x: direction > 0 ? '-100%' : '100%',
                    scale: 0.9
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 80,
                    damping: 18,
                    mass: 0.8
                  }}
                  className="w-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]"
                >
                  {pages[currentPage].component}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Global Login Modal */}
        <LoginModal />
      </div>
    </AuthProvider>
  );
}
