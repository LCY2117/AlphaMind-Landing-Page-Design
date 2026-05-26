import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../../imports/alphamind-logo.png';

const LOCAL_CODE = '123456';

function maskPhone(phone: string) {
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export function LoginModal() {
  const { showLoginModal, closeLoginModal, login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'phone' | 'wechat'>('wechat');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const codeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (codeTimerRef.current) {
        window.clearTimeout(codeTimerRef.current);
      }
    };
  }, []);

  const handleSendCode = () => {
    if (phoneNumber.length === 11) {
      setCodeSent(true);
      setVerificationCode(LOCAL_CODE);
      if (codeTimerRef.current) {
        window.clearTimeout(codeTimerRef.current);
      }
      codeTimerRef.current = window.setTimeout(() => {
        setCodeSent(false);
        codeTimerRef.current = null;
      }, 60000);
    }
  };

  const handlePhoneLogin = () => {
    if (phoneNumber.length === 11 && verificationCode === LOCAL_CODE) {
      login({
        id: 'user_' + Date.now(),
        name: `本地用户${phoneNumber.slice(-4)}`,
        phone: maskPhone(phoneNumber),
        loginMethod: 'phone',
        mode: 'local',
        createdAt: Date.now(),
      });
    }
  };

  const handleWeChatLogin = () => {
    login({
      id: 'user_wx_' + Date.now(),
      name: 'AlphaMind 本地用户',
      loginMethod: 'wechat',
      avatar: logoImg,
      mode: 'local',
      createdAt: Date.now(),
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
            className="fixed inset-0 am-backdrop backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md am-surface backdrop-blur-xl rounded-2xl z-[201] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 p-2 am-hover-surface rounded-lg transition-colors z-10"
            >
              <X size={20} className="am-text-secondary" />
            </button>

            <div className="p-8">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img src={logoImg} alt="AlphaMind" className="h-14 w-auto" />
              </div>

              <h2 className="text-xl font-bold am-text-primary text-center mb-2">进入 AlphaMind 本地身份</h2>
              <p className="am-text-secondary text-center mb-5 text-sm">当前为本地登录，数据只保存在此浏览器</p>

              <div className="mb-6 flex items-start gap-2 rounded-xl am-banner border px-3 py-2 text-xs am-text-secondary">
                <ShieldCheck size={16} className="am-brand mt-0.5 shrink-0" />
                <span>无需真实注册、短信或微信授权；本地身份仅用于页面流程。</span>
              </div>

              {/* Login Method Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setLoginMethod('wechat')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                    loginMethod === 'wechat'
                      ? 'am-brand-bg am-on-brand'
                      : 'am-card am-text-secondary am-hover-surface'
                  }`}
                >
                  <MessageSquare size={16} />
                  <span>微信方式</span>
                </button>
                <button
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                    loginMethod === 'phone'
                      ? 'am-brand-bg am-on-brand'
                      : 'am-card am-text-secondary am-hover-surface'
                  }`}
                >
                  <Phone size={16} />
                  <span>手机方式</span>
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
                  <div className="w-48 h-48 bg-white rounded-xl p-4 flex items-center justify-center border border-black/10">
                    <div className="text-center space-y-2">
                      <MessageSquare size={48} className="text-gray-400 mx-auto" />
                      <p className="text-xs text-gray-600">二维码占位</p>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-sm am-text-secondary">这里不会调用真实微信授权</p>
                    <p className="text-xs am-text-tertiary">点击下方按钮进入本地身份</p>
                  </div>

                  <button
                    onClick={handleWeChatLogin}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-[#C44536] to-orange-600 am-on-brand rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(196,69,54,0.35)] transition-all"
                  >
                    模拟微信登录
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
                    <label className="block text-xs am-text-secondary mb-2">手机号</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="输入 11 位手机号，仅保存脱敏展示"
                      className="w-full px-4 py-3 am-input-surface border rounded-xl am-text-primary am-placeholder focus:outline-none focus:border-[#C44536] focus:ring-2 focus:ring-[#C44536]/20 transition-all text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs am-text-secondary mb-2">验证码</label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                        placeholder={codeSent ? LOCAL_CODE : '点击获取验证码'}
                        className="w-full px-4 py-3 am-input-surface border rounded-xl am-text-primary am-placeholder focus:outline-none focus:border-[#C44536] focus:ring-2 focus:ring-[#C44536]/20 transition-all text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleSendCode}
                        disabled={phoneNumber.length !== 11 || codeSent}
                        className="px-4 py-3 am-card am-hover-surface am-brand rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                      >
                        {codeSent ? `验证码 ${LOCAL_CODE}` : '获取验证码'}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handlePhoneLogin}
                    disabled={phoneNumber.length !== 11 || verificationCode !== LOCAL_CODE}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-[#C44536] to-orange-600 am-on-brand rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(196,69,54,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>进入本地身份</span>
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

              <div className="mt-6 pt-6 border-t am-border-subtle">
                <p className="text-xs am-text-tertiary text-center">
                  本地登录不会创建真实账号；正式认证、协议与隐私流程将在后端接入后启用。
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
