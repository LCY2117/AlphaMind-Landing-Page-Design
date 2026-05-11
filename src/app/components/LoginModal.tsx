import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../../imports/alphamind-logo.png';

export function LoginModal() {
  const { showLoginModal, closeLoginModal, login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'phone' | 'wechat'>('wechat');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = () => {
    if (phoneNumber.length === 11) {
      setCodeSent(true);
      setTimeout(() => setCodeSent(false), 60000);
    }
  };

  const handlePhoneLogin = () => {
    if (phoneNumber.length === 11 && verificationCode.length === 6) {
      login({
        id: 'user_' + Date.now(),
        name: `用户${phoneNumber.slice(-4)}`,
        phone: phoneNumber,
        loginMethod: 'phone',
      });
    }
  };

  const handleWeChatLogin = () => {
    // 模拟微信扫码登录
    login({
      id: 'user_wx_' + Date.now(),
      name: 'AlphaMind用户',
      loginMethod: 'wechat',
      avatar: logoImg,
    });
  };

  return (
    <AnimatePresence>
      {showLoginModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLoginModal}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#1E1E1E]/95 backdrop-blur-xl rounded-2xl shadow-2xl z-[201] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
            >
              <X size={20} className="text-white/60 hover:text-white" />
            </button>

            <div className="p-8">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img src={logoImg} alt="AlphaMind" className="h-14 w-auto" />
              </div>

              <h2 className="text-xl font-bold text-white text-center mb-2">欢迎来到 AlphaMind</h2>
              <p className="text-white/50 text-center mb-8 text-sm">登录开启您的智能投资之旅</p>

              {/* Login Method Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setLoginMethod('wechat')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                    loginMethod === 'wechat'
                      ? 'bg-[#C44536] text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <MessageSquare size={16} />
                  <span>微信登录</span>
                </button>
                <button
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                    loginMethod === 'phone'
                      ? 'bg-[#C44536] text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <Phone size={16} />
                  <span>手机登录</span>
                </button>
              </div>

              {/* WeChat QR Code Login */}
              {loginMethod === 'wechat' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col items-center space-y-4"
                >
                  {/* QR Code Placeholder */}
                  <div className="w-48 h-48 bg-white rounded-xl p-4 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <MessageSquare size={48} className="text-gray-400 mx-auto" />
                      <p className="text-xs text-gray-600">微信扫码登录</p>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-white/70">打开微信扫一扫</p>
                    <p className="text-xs text-white/40">安全快捷登录 AlphaMind</p>
                  </div>

                  {/* Demo: Auto Login Button */}
                  <button
                    onClick={handleWeChatLogin}
                    className="text-xs text-[#C44536] hover:underline"
                  >
                    （演示：点击模拟扫码登录）
                  </button>
                </motion.div>
              )}

              {/* Phone Login Form */}
              {loginMethod === 'phone' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs text-white/50 mb-2">手机号码</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="请输入手机号码"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C44536] focus:ring-2 focus:ring-[#C44536]/20 transition-all text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-white/50 mb-2">验证码</label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                        placeholder="请输入验证码"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C44536] focus:ring-2 focus:ring-[#C44536]/20 transition-all text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleSendCode}
                        disabled={phoneNumber.length !== 11 || codeSent}
                        className="px-4 py-3 bg-white/10 hover:bg-white/20 text-[#C44536] rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                      >
                        {codeSent ? '已发送' : '获取验证码'}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handlePhoneLogin}
                    disabled={phoneNumber.length !== 11 || verificationCode.length !== 6}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-[#C44536] to-orange-600 text-white rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(196,69,54,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>登录</span>
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

              {/* Terms */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-white/40 text-center">
                  登录即表示同意
                  <a href="#" className="text-[#C44536] hover:underline ml-1">《用户协议》</a>
                  和
                  <a href="#" className="text-[#C44536] hover:underline ml-1">《隐私政策》</a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
