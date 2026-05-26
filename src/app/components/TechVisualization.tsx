import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

// Financial code matrix effect
export function CodeRain() {
  const [drops, setDrops] = useState<number[]>([]);

  useEffect(() => {
    setDrops(Array.from({ length: 20 }, () => Math.random() * 100));
  }, []);

  const financialSymbols = ['$', '¥', '€', '£', '₿', '↑', '↓', '→', '←', '◆', '■', '●', '▲', '▼'];

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      {drops.map((drop, index) => (
        <motion.div
          key={index}
          className="absolute text-[#C44536] font-mono text-xs"
          style={{
            left: `${(index * 5) % 100}%`,
            top: `${drop}%`,
          }}
          animate={{
            y: ['0vh', '100vh'],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 2,
          }}
        >
          {financialSymbols[Math.floor(Math.random() * financialSymbols.length)]}
        </motion.div>
      ))}
    </div>
  );
}

// Stock chart lines
export function StockLines() {
  const generatePath = () => {
    const points = 50;
    let path = 'M 0 50';
    let value = 50;

    for (let i = 1; i < points; i++) {
      value += (Math.random() - 0.5) * 10;
      value = Math.max(20, Math.min(80, value));
      path += ` L ${(i / points) * 100} ${value}`;
    }

    return path;
  };

  const [paths] = useState([generatePath(), generatePath(), generatePath()]);

  return (
    <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C44536" stopOpacity="0" />
          <stop offset="50%" stopColor="#C44536" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#C44536" stopOpacity="0" />
        </linearGradient>
      </defs>

      {paths.map((path, index) => (
        <motion.path
          key={index}
          d={path}
          fill="none"
          stroke="url(#lineGradient1)"
          strokeWidth="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.5,
          }}
        />
      ))}
    </svg>
  );
}

// Data stream effect
export function DataStream() {
  const codes = [
    'if(market.trend === "bullish")',
    'const portfolio = allocate()',
    'predict(riskScore)',
    'analyze(volatility)',
    'optimize(returns)',
    'explain(decision)',
  ];

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: 'var(--am-topology-data-opacity, 0.1)' }}
    >
      {codes.map((code, index) => (
        <motion.div
          key={index}
          className="absolute font-mono text-[10px] whitespace-nowrap"
          style={{
            left: `${20 + (index * 15) % 80}%`,
            top: `${10 + (index * 20) % 80}%`,
            color: 'var(--am-topology-data-color, #C44536)',
          }}
          animate={{
            opacity: [0, 0.5, 0],
            x: [0, 50, 100],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: index * 0.7,
            ease: 'easeInOut',
          }}
        >
          {code}
        </motion.div>
      ))}
    </div>
  );
}

// Hexagonal grid
export function HexGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 'var(--am-topology-hex-opacity, 0.05)' }}
    >
      <svg width="100%" height="100%">
        <defs>
          <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <polygon
              points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"
              fill="none"
              stroke="var(--am-topology-hex-stroke, #C44536)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  );
}
