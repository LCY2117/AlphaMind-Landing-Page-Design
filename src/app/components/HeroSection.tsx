import { motion } from 'motion/react';
import { TrendingUp, Brain, Shield } from 'lucide-react';
import { CodeRain, StockLines, DataStream, HexGrid } from './TechVisualization';

export function HeroSection() {
  return (
    <section id="home" className="w-full h-full flex items-center bg-gradient-to-br from-[#1F1410] via-[#2D1B13] to-[#1F1410]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              认知驱动的<span className="text-[#C44536]">财富管理</span>
              <br />
              从工具到伴侣的进化
            </h1>
            <p className="text-lg sm:text-xl text-gray-400">
              基于千亿级金融语料大模型，精准捕捉动态交易意图
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const event = new CustomEvent('navigate-to-page', { detail: 1 });
                  window.dispatchEvent(event);
                }}
                className="px-8 py-4 bg-[#C44536] text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(196,69,54,0.5)] transition-shadow"
              >
                开始体验
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const event = new CustomEvent('navigate-to-page', { detail: 3 });
                  window.dispatchEvent(event);
                }}
                className="px-8 py-4 border-2 border-[#C44536] text-[#C44536] rounded-lg font-semibold hover:bg-[#C44536]/10 transition-colors"
              >
                了解更多
              </motion.button>
            </div>
          </motion.div>

          {/* Right: Enhanced 3D Neural Network Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Tech background effects */}
              <HexGrid />
              <CodeRain />
              <StockLines />
              <DataStream />

              {/* Central glowing core with enhanced effects */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-1/4 bg-gradient-to-r from-[#C44536] via-orange-600 to-[#C44536] rounded-full blur-3xl"
              />

              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-4/5 h-4/5 rounded-full border-2 border-dashed border-[#C44536]/30" />
              </motion.div>

              {/* Data particles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 bg-[#C44536] rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos((i * Math.PI) / 4) * 150],
                    y: [0, Math.sin((i * Math.PI) / 4) * 150],
                    opacity: [1, 0],
                    scale: [1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: 'easeOut',
                  }}
                />
              ))}

              {/* Network nodes */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Center brain node with enhanced glow */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute w-28 h-28 bg-gradient-to-br from-[#C44536] via-orange-600 to-[#C44536] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(196,69,54,0.8)]"
                  style={{
                    boxShadow: '0 0 50px rgba(196,69,54,0.8), inset 0 0 20px rgba(255,255,255,0.2)',
                  }}
                >
                  <Brain size={44} className="text-white drop-shadow-lg" />

                  {/* Pulse rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#C44536]"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.8, 0, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-orange-600"
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.5,
                    }}
                  />
                </motion.div>

                {/* Asset node with stock chart background */}
                <motion.div
                  animate={{
                    y: [-20, 20, -20],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-[#1F1410] to-[#2D1B13] border-2 border-[#C44536] rounded-full flex items-center justify-center backdrop-blur-sm shadow-[0_0_20px_rgba(196,69,54,0.4)]"
                  style={{
                    boxShadow: '0 0 20px rgba(196,69,54,0.4), inset 0 0 10px rgba(196,69,54,0.2)',
                  }}
                >
                  <TrendingUp size={32} className="text-[#C44536] drop-shadow-lg" />

                  {/* Mini chart lines */}
                  <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
                    <motion.path
                      d="M 20 60 L 35 45 L 50 50 L 65 35 L 80 40"
                      stroke="#C44536"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </svg>
                </motion.div>

                {/* Behavior node with code background */}
                <motion.div
                  animate={{
                    x: [-20, 20, -20],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-0 -left-10 w-20 h-20 bg-gradient-to-br from-[#1F1410] to-[#2D1B13] border-2 border-amber-600 rounded-full flex items-center justify-center backdrop-blur-sm shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  style={{
                    boxShadow: '0 0 20px rgba(245,158,11,0.4), inset 0 0 10px rgba(245,158,11,0.2)',
                  }}
                >
                  <Shield size={32} className="text-amber-500 drop-shadow-lg" />

                  {/* Binary code */}
                  <div className="absolute inset-0 overflow-hidden rounded-full opacity-20">
                    <div className="text-[8px] font-mono text-amber-600">
                      01001101
                    </div>
                  </div>
                </motion.div>

                {/* Intent node with AI pattern */}
                <motion.div
                  animate={{
                    x: [20, -20, 20],
                  }}
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-0 -right-10 w-20 h-20 bg-gradient-to-br from-[#1F1410] to-[#2D1B13] border-2 border-amber-600 rounded-full flex items-center justify-center backdrop-blur-sm shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  style={{
                    boxShadow: '0 0 20px rgba(245,158,11,0.4), inset 0 0 10px rgba(245,158,11,0.2)',
                  }}
                >
                  <Brain size={32} className="text-amber-500 drop-shadow-lg" />

                  {/* Neural network pattern */}
                  <svg className="absolute inset-2 opacity-20" viewBox="0 0 40 40">
                    <circle cx="20" cy="10" r="2" fill="#F59E0B" />
                    <circle cx="10" cy="30" r="2" fill="#F59E0B" />
                    <circle cx="30" cy="30" r="2" fill="#F59E0B" />
                    <line x1="20" y1="10" x2="10" y2="30" stroke="#F59E0B" strokeWidth="0.5" />
                    <line x1="20" y1="10" x2="30" y2="30" stroke="#F59E0B" strokeWidth="0.5" />
                  </svg>
                </motion.div>
              </div>

              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                <motion.line
                  x1="50%" y1="50%" x2="50%" y2="10%"
                  stroke="#C44536"
                  strokeWidth="2"
                  strokeOpacity="0.3"
                  animate={{ strokeOpacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.line
                  x1="50%" y1="50%" x2="10%" y2="90%"
                  stroke="rgb(217, 119, 6)"
                  strokeWidth="2"
                  strokeOpacity="0.3"
                  animate={{ strokeOpacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                <motion.line
                  x1="50%" y1="50%" x2="90%" y2="90%"
                  stroke="rgb(217, 119, 6)"
                  strokeWidth="2"
                  strokeOpacity="0.3"
                  animate={{ strokeOpacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                />
              </svg>
            </div>

            {/* Floating labels */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 text-[#C44536] text-sm font-semibold"
            >
              资产
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute bottom-8 -left-16 text-amber-500 text-sm font-semibold"
            >
              行为
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.2, repeat: Infinity }}
              className="absolute bottom-8 -right-16 text-amber-500 text-sm font-semibold"
            >
              意图
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
