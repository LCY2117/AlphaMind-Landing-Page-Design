import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { FeatureCards } from './components/FeatureCards';
import { AIAdvisorDemo } from './components/AIAdvisorDemo';
import { RiskAssessment } from './components/RiskAssessment';
import { PageNavigation } from './components/PageNavigation';
import { FadeScaleTransition } from './components/PageTransition';
import { LoginModal } from './components/LoginModal';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const pages = [
    { component: <HeroSection />, name: '首页' },
    { component: <AIAdvisorDemo />, name: '对话投顾' },
    { component: <RiskAssessment />, name: '风险测试' },
    { component: <FeatureCards />, name: '核心功能' },
  ];

  const handleNavigate = (newPage: number) => {
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
  };

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
  }, [currentPage]);

  // Custom navigation event
  useEffect(() => {
    const handleCustomNavigate = (e: CustomEvent) => {
      handleNavigate(e.detail);
    };

    window.addEventListener('navigate-to-page', handleCustomNavigate as EventListener);
    return () => window.removeEventListener('navigate-to-page', handleCustomNavigate as EventListener);
  }, []);


  return (
    <AuthProvider>
      <div className="relative w-full min-h-screen bg-[#1F1410] text-white font-sans">
        {/* Navigation - always visible */}
        <Navigation />

        {/* Page Content with Transitions */}
        <div className="relative w-full min-h-screen pt-14 sm:pt-16 pb-28 sm:pb-20">
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
              className="w-full min-h-[calc(100vh-10.5rem)] sm:min-h-[calc(100vh-9rem)]"
            >
              {pages[currentPage].component}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Page Navigation Controls */}
        <PageNavigation
          currentPage={currentPage}
          totalPages={pages.length}
          onNavigate={handleNavigate}
          pageNames={pages.map(p => p.name)}
        />

        {/* Footer - always visible */}
        <footer className="fixed bottom-20 sm:bottom-0 left-0 right-0 z-20 bg-[#1F1410]/80 backdrop-blur-sm border-t border-white/5 py-2 sm:py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-500 text-[10px] sm:text-xs">
              <p>© 2026 AlphaMind. 认知驱动的财富管理平台</p>
            </div>
          </div>
        </footer>

        {/* Global Login Modal */}
        <LoginModal />
      </div>
    </AuthProvider>
  );
}