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

const REFERENCE_STOCKS: Stock[] = [
  { symbol: '000001', name: '上证指数', price: '3245.67', change: '+12.34', changePercent: '+0.38%', isUp: true },
  { symbol: '399001', name: '深证成指', price: '10987.23', change: '+45.67', changePercent: '+0.42%', isUp: true },
  { symbol: '399006', name: '创业板指', price: '2234.56', change: '-8.90', changePercent: '-0.40%', isUp: false },
  { symbol: '000300', name: '沪深300', price: '3876.45', change: '+15.23', changePercent: '+0.39%', isUp: true },
  { symbol: '600519', name: '贵州茅台', price: '1678.90', change: '+12.30', changePercent: '+0.74%', isUp: true },
  { symbol: '300750', name: '宁德时代', price: '203.40', change: '+4.35', changePercent: '+2.18%', isUp: true },
  { symbol: '518880', name: '华安黄金ETF', price: '5.68', change: '+0.02', changePercent: '+0.34%', isUp: true },
  { symbol: '600036', name: '招商银行', price: '34.56', change: '-0.23', changePercent: '-0.66%', isUp: false },
  { symbol: '000858', name: '五粮液', price: '145.67', change: '+1.89', changePercent: '+1.31%', isUp: true },
];

const TICKER_STOCKS = [...REFERENCE_STOCKS, ...REFERENCE_STOCKS];

export function StockTicker() {
  return (
    <div className="w-full am-nav-surface border-t border-b overflow-hidden">
      <div className="relative flex items-center">
        <div className="relative z-10 shrink-0 self-stretch flex items-center border-r am-border-subtle am-nav-surface px-3 sm:px-4">
          <span className="rounded-full am-banner border px-2.5 py-1 text-xs font-semibold am-brand whitespace-nowrap">
            参考行情 · 非实时
          </span>
        </div>
        {/* Scrolling Container */}
        <motion.div
          className="flex gap-8 py-3"
          animate={{
            x: [0, -1920],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {TICKER_STOCKS.map((stock, index) => (
            <div
              key={`${stock.symbol}-${index}`}
              className="flex items-center gap-3 whitespace-nowrap px-4"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold am-text-primary">{stock.symbol}</span>
                  <span className="text-xs am-text-tertiary">{stock.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono am-text-primary">{stock.price}</span>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${
                    stock.isUp ? 'text-[#00ff41]' : 'text-red-400'
                  }`}>
                    {stock.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{stock.change}</span>
                    <span>({stock.changePercent})</span>
                  </div>
                </div>
              </div>
              <div className="w-px h-8 am-card" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
