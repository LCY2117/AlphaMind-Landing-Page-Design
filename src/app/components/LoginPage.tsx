import { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, MessageSquare, ArrowRight, Download } from 'lucide-react';
import logoImg from '../../imports/alphamind-logo.png';

export function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'wechat'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = () => {
    if (phoneNumber.length === 11) {
      setCodeSent(true);
    }
  };

  const handleLogin = () => {
    console.log('Logging in with phone:', phoneNumber);
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1F1410] via-[#2D1B13] to-[#1F1410] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C44536]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1F1410]/90 via-[#2D1B13]/90 to-[#1F1410]/90 backdrop-blur-xl rounded-2xl border-2 border-[#C44536]/30 p-8 shadow-[0_0_50px_rgba(196,69,54,0.2)]"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logoImg} alt="AlphaMind" className="h-16 w-auto" />
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">AlphaMind 演示入口</h1>
          <p className="text-gray-400 text-center mb-8">当前为本地演示登录，不会发起真实认证</p>

          {/* Login Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                loginMethod === 'phone'
                  ? 'bg-gradient-to-r from-[#C44536] to-orange-600 text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Phone size={18} />
              <span>手机演示</span>
            </button>
            <button
              onClick={() => setLoginMethod('wechat')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                loginMethod === 'wechat'
                  ? 'bg-gradient-to-r from-[#C44536] to-orange-600 text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <MessageSquare size={18} />
              <span>微信演示</span>
            </button>
          </div>

          {/* Phone Login Form */}
          {loginMethod === 'phone' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-gray-400 mb-2">演示手机号</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="输入 11 位手机号，仅用于演示"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C44536] focus:ring-2 focus:ring-[#C44536]/20 transition-all"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">演示验证码</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                    placeholder="演示码 123456"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C44536] focus:ring-2 focus:ring-[#C44536]/20 transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSendCode}
                    disabled={phoneNumber.length !== 11 || codeSent}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 text-[#C44536] rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {codeSent ? '演示码 123456' : '获取演示码'}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={phoneNumber.length !== 11 || verificationCode.length !== 6}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#C44536] to-orange-600 text-white rounded-xl font-bold hover:shadow-[0_0_30px_rgba(196,69,54,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                <span>进入演示</span>
                <ArrowRight size={20} />
              </button>

              <p className="text-xs text-gray-500 text-center">
                正式认证、协议与隐私流程将在后端接入后启用
              </p>
            </motion.div>
          )}

          {/* WeChat QR Code Login */}
          {loginMethod === 'wechat' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col items-center space-y-4"
            >
              {/* QR Code Placeholder */}
              <div className="w-56 h-56 bg-white rounded-xl p-4 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <MessageSquare size={64} className="text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">演示二维码</p>
                </div>
              </div>

              <p className="text-sm text-gray-400 text-center">
                这里不会调用真实微信授权
                <br />
                请使用弹窗演示登录完成体验
              </p>

              <div className="w-full pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                  演示二维码不可扫码；正式微信授权待后端接入
                </p>
              </div>
            </motion.div>
          )}

          {/* Download Desktop Version Button */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <button className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C44536]/50 text-gray-300 hover:text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
              <Download size={18} />
              <span>下载电脑版</span>
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          © 2026 AlphaMind. 认知驱动的财富管理
        </p>
      </div>
    </section>
  );
}
