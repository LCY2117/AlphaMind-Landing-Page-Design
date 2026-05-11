import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isUp: boolean;
}

// 模拟实时股票数据
const generateStockData = (): Stock[] => {
  // 使用固定数据模拟"实时"行情，确保可重现性
  return [
    { symbol: '000001', name: '上证指数', price: '3245.67', change: '+12.34', changePercent: '+0.38%', isUp: true },
    { symbol: '399001', name: '深证成指', price: '10987.23', change: '+45.67', changePercent: '+0.42%', isUp: true },
    { symbol: '399006', name: '创业板指', price: '2234.56', change: '-8.90', changePercent: '-0.40%', isUp: false },
    { symbol: '000300', name: '沪深300', price: '3876.45', change: '+15.23', changePercent: '+0.39%', isUp: true },
    { symbol: 'AAPL', name: 'Apple Inc.', price: '178.45', change: '+2.15', changePercent: '+1.22%', isUp: true },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '245.67', change: '-3.45', changePercent: '-1.38%', isUp: false },
    { symbol: 'MSFT', name: 'Microsoft', price: '389.12', change: '+4.56', changePercent: '+1.19%', isUp: true },
    { symbol: '600519', name: '贵州茅台', price: '1678.90', change: '+12.30', changePercent: '+0.74%', isUp: true },
    { symbol: '600036', name: '招商银行', price: '34.56', change: '-0.23', changePercent: '-0.66%', isUp: false },
    { symbol: '000858', name: '五粮液', price: '145.67', change: '+1.89', changePercent: '+1.31%', isUp: true },
  ];
};

export function StockTicker() {
  const stocks = generateStockData();

  return (
    <div className="w-full bg-gradient-to-r from-[#1F1410]/90 via-[#2D1B13]/90 to-[#1F1410]/90 border-t border-b border-[#C44536]/20 py-3 overflow-hidden">
      <div className="relative flex items-center">
        {/* Scrolling Container */}
        <motion.div
          className="flex gap-8"
          animate={{
            x: [0, -1920],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Render stocks twice for seamless loop */}
          {[...stocks, ...stocks].map((stock, index) => (
            <div
              key={`${stock.symbol}-${index}`}
              className="flex items-center gap-3 whitespace-nowrap px-4"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{stock.symbol}</span>
                  <span className="text-xs text-gray-500">{stock.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-white">{stock.price}</span>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${
                    stock.isUp ? 'text-[#00ff41]' : 'text-red-400'
                  }`}>
                    {stock.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{stock.change}</span>
                    <span>({stock.changePercent})</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
