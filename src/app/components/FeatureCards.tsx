import { motion } from 'motion/react';
import { Mic, Eye, FileText, TrendingDown, HelpCircle } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: '多模态隐式画像',
    description: '支持语音输入和 OCR 图片识别，全方位理解您的投资需求',
    gradient: 'from-[#C44536] to-orange-600',
  },
  {
    icon: TrendingDown,
    title: '动态风险洞察',
    description: '实时监测市场波动，精准评估投资组合风险水平',
    gradient: 'from-amber-700 to-yellow-600',
  },
  {
    icon: HelpCircle,
    title: '可解释性白盒决策',
    description: '透明展示决策逻辑链，让每一个投资建议都有据可依',
    gradient: 'from-red-800 to-orange-700',
  },
];

export function FeatureCards() {
  return (
    <section className="w-full h-full flex items-center bg-[#1F1410] overflow-y-auto">
      <div className="w-full py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-center text-white mb-12"
        >
          核心功能
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
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
                <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-[#C44536]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(196,69,54,0.2)]">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon size={32} className="text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity blur-xl`} />
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
