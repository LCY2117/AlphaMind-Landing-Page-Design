import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Home, MessageSquare, Plus, ScanSearch, Sparkles, Target } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { FeatureCards } from './components/FeatureCards';
import { AIAdvisorDemo } from './components/AIAdvisorDemo';
import { RiskAssessment } from './components/RiskAssessment';
import { AssetXRay } from './components/AssetXRay';
import { LoginModal } from './components/LoginModal';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const PAGE_NAMES = ['首页', '对话投顾', '风险测试', '资产透视', '核心功能'];
const PAGE_NAV_ITEMS = [
  { label: PAGE_NAMES[0], page: 0, icon: Home },
  { label: PAGE_NAMES[1], page: 1, icon: MessageSquare },
  { label: PAGE_NAMES[2], page: 2, icon: Target },
  { label: PAGE_NAMES[3], page: 3, icon: ScanSearch },
  { label: PAGE_NAMES[4], page: 4, icon: Sparkles },
];

const PAGE_TRANSITION = {
  duration: 0.36,
  ease: [0.25, 1, 0.5, 1],
};

const pageStackVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-20%',
    zIndex: direction > 0 ? 2 : 1,
  }),
  center: (direction: number) => ({
    x: '0%',
    zIndex: direction > 0 ? 2 : 1,
  }),
  exit: (direction: number) => ({
    x: direction > 0 ? '-20%' : '100%',
    zIndex: direction > 0 ? 1 : 2,
  }),
};

const pageDimVariants = {
  enter: (direction: number) => ({
    opacity: direction > 0 ? 0 : 0.28,
  }),
  center: {
    opacity: 0,
  },
  exit: (direction: number) => ({
    opacity: direction > 0 ? 0.28 : 0,
  }),
};

const pageEdgeShadowVariants = {
  enter: (direction: number) => ({
    opacity: direction > 0 ? 1 : 0,
  }),
  center: {
    opacity: 0,
  },
  exit: (direction: number) => ({
    opacity: direction > 0 ? 0 : 1,
  }),
};

interface DesktopSidebarProps {
  currentPage: number;
  onNavigate: (page: number) => void;
  onNewChat: () => void;
}

function DesktopSidebar({ currentPage, onNavigate, onNewChat }: DesktopSidebarProps) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 am-sidebar-surface border-r flex-col">
      <div className="p-3 border-b am-border-subtle">
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
          onClick={onNewChat}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 am-card am-hover-surface am-text-primary rounded-lg transition-all"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">开启新对话</span>
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={() => onNavigate(1)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm am-text-secondary am-hover-surface am-hover-text-primary transition-all"
        >
          <History size={17} />
          <span>历史记录</span>
        </button>
      </div>
    </aside>
  );
}

interface PageShellProps {
  children: React.ReactNode;
  currentPage: number;
  onNavigate: (page: number) => void;
  onNewChat: () => void;
}

function PageShell({ children, currentPage, onNavigate, onNewChat }: PageShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
      <DesktopSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onNewChat={onNewChat}
      />
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
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
    {
      component: (
        <PageShell
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onNewChat={handleNewChat}
        >
          <HeroSection />
        </PageShell>
      ),
      name: PAGE_NAMES[0],
    },
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
    {
      component: (
        <PageShell
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onNewChat={handleNewChat}
        >
          <RiskAssessment />
        </PageShell>
      ),
      name: PAGE_NAMES[2],
    },
    {
      component: (
        <PageShell
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onNewChat={handleNewChat}
        >
          <AssetXRay />
        </PageShell>
      ),
      name: PAGE_NAMES[3],
    },
    {
      component: (
        <PageShell
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onNewChat={handleNewChat}
        >
          <FeatureCards />
        </PageShell>
      ),
      name: PAGE_NAMES[4],
    },
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
    <ThemeProvider>
      <AuthProvider>
        <div className="relative w-full min-h-screen am-app-bg font-sans">
          {/* Navigation - always visible */}
          <Navigation />

          {/* Page Content with Transitions */}
          <div className="relative w-full min-h-screen pt-14 sm:pt-16 am-page-bg">
            <div className="relative h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  variants={pageStackVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={PAGE_TRANSITION}
                  className="absolute inset-0 min-w-0 overflow-hidden am-page-bg will-change-transform [backface-visibility:hidden] [transform:translate3d(0,0,0)]"
                >
                  <div className="relative z-0 h-full overflow-y-auto">
                    {pages[currentPage].component}
                  </div>

                  <motion.div
                    custom={direction}
                    variants={pageDimVariants}
                    transition={PAGE_TRANSITION}
                    className="pointer-events-none absolute inset-0 z-10 bg-black"
                  />
                  <motion.div
                    custom={direction}
                    variants={pageEdgeShadowVariants}
                    transition={PAGE_TRANSITION}
                    className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-black/45 to-transparent"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Global Login Modal */}
          <LoginModal />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
