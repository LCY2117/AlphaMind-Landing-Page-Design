import { motion } from 'motion/react';
import { Mic, TrendingDown, HelpCircle } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: '多模态隐式画像',
    description: '支持语音输入和 OCR 图片识别，全方位理解您的投资需求',
  },
  {
    icon: TrendingDown,
    title: '动态风险洞察',
    description: '实时监测市场波动，精准评估投资组合风险水平',
  },
  {
    icon: HelpCircle,
    title: '可解释性白盒决策',
    description: '透明展示决策逻辑链，让每一个投资建议都有据可依',
  },
];

export function FeatureCards() {
  return (
    <section className="w-full min-h-screen flex items-center am-page-bg">
      <div className="w-full py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center am-text-primary mb-8 sm:mb-10 lg:mb-12"
        >
          核心功能
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <div className="relative am-card backdrop-blur-lg rounded-2xl p-6 sm:p-8 border am-hover-border-brand transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(196,69,54,0.2)]">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl am-feature-icon flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-all">
                    <Icon size={28} strokeWidth={1.7} className="am-feature-icon-glyph sm:w-8 sm:h-8" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold am-text-primary mb-2 sm:mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-sm sm:text-base am-text-secondary leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="absolute inset-0 rounded-2xl am-feature-glow opacity-0 group-hover:opacity-10 transition-opacity blur-xl" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      </div>
    </section>
  );
}
