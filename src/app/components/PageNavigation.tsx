import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Home, MessageSquare, Target, History as HistoryIcon } from 'lucide-react';

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  onNavigate: (page: number) => void;
  pageNames: string[];
}

export function PageNavigation({ currentPage, totalPages, onNavigate, pageNames }: PageNavigationProps) {
  const icons = [Home, MessageSquare, Target, HistoryIcon];

  return (
    <>
      {/* Bottom Navigation Bar - Enhanced */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#C44536] via-orange-600 to-[#C44536] opacity-30 blur-2xl rounded-full" />

          {/* Main navigation container */}
          <div className="relative bg-gradient-to-br from-[#1F1410]/95 via-[#2D1B13]/95 to-[#1F1410]/95 backdrop-blur-xl px-8 py-4 rounded-2xl border-2 border-[#C44536]/40 shadow-[0_0_50px_rgba(196,69,54,0.3)]">
            {/* Animated border */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(196,69,54,0.5), transparent)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '200% 0%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            <div className="relative flex items-center gap-6">
              {Array.from({ length: totalPages }).map((_, index) => {
                const Icon = icons[index];
                const isActive = currentPage === index;

                return (
                  <motion.button
                    key={index}
                    onClick={() => onNavigate(index)}
                    whileHover={{ scale: 1.15, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                  >
                    {/* Active indicator background */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-br from-[#C44536] to-orange-600 rounded-xl shadow-[0_0_20px_rgba(196,69,54,0.6)]"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Icon container */}
                    <div className={`relative w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-500 hover:text-[#C44536] hover:bg-white/5'
                    }`}>
                      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />

                      {/* Page number */}
                      <span className={`text-[10px] font-mono mt-0.5 ${
                        isActive ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-[#C44536] to-orange-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-lg pointer-events-none">
                      {pageNames[index]}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#C44536] rotate-45" />
                    </div>

                    {/* Active pulse effect */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-[#C44536]"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Tech decoration lines */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-8 bg-gradient-to-b from-transparent via-[#C44536] to-transparent opacity-50" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-8 bg-gradient-to-b from-transparent via-[#C44536] to-transparent opacity-50" />
          </div>

          {/* Current page indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-[#C44536] font-mono"
          >
            <span className="text-white/60">[</span> {pageNames[currentPage]} <span className="text-white/60">]</span>
          </motion.div>
        </div>
      </motion.div>


      {/* Side Page Menu */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
        {Array.from({ length: totalPages }).map((_, index) => {
          const Icon = icons[index] || Home;
          return (
            <motion.button
              key={index}
              onClick={() => onNavigate(index)}
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative group ${
                currentPage === index
                  ? 'bg-[#C44536] text-white shadow-[0_0_15px_rgba(196,69,54,0.6)]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-[#C44536] border border-white/10'
              }`}
            >
              <Icon size={18} />

              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#C44536] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {pageNames[index]}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Scroll Hint (only on first page) */}
      {currentPage === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2"
        >
          <p className="text-sm text-gray-400">点击导航</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronRight size={20} className="text-[#C44536] rotate-90" />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
