import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sanitizeBdPhone, isValidBdPhone, handleNumericKeyDown } from '../utils/validation';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    showToast, 
    cms, 
    loginCustomer, 
    registerCustomer, 
    loginWithGoogle,
    setCurrentView 
  } = useStore();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize real Google Identity Services if Client ID is configured in Admin CMS
  useEffect(() => {
    const clientId = cms?.googleAuth?.clientId?.trim();
    const isEnabled = Boolean(cms?.googleAuth?.enabled);
    if (!clientId || !isEnabled || typeof window === 'undefined') return;

    let script = document.getElementById('google-gsi-client') as HTMLScriptElement;
    const initGsi = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response?.credential) {
              setLoading(true);
              const res = await loginWithGoogle(response.credential);
              setLoading(false);
              if (res.success) {
                setIsAuthModalOpen(false);
                setCurrentView('customer-dashboard');
              }
            }
          }
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.head.appendChild(script);
    } else {
      initGsi();
    }
  }, [cms?.googleAuth?.clientId, cms?.googleAuth?.enabled]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.');
      return;
    }

    setLoading(true);
    if (isRegister) {
      if (!name) {
        showToast('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (phone.trim() && !isValidBdPhone(phone)) {
        showToast('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).');
        setLoading(false);
        return;
      }
      const res = await registerCustomer(name, email, password, phone);
      setLoading(false);
      if (res.success) {
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
        setCurrentView('customer-dashboard');
      }
    } else {
      const res = await loginCustomer(email, password);
      setLoading(false);
      if (res.success) {
        setEmail('');
        setPassword('');
        setCurrentView('customer-dashboard');
      }
    }
  };

  const handleGoogleClick = () => {
    const clientId = cms?.googleAuth?.clientId?.trim();
    const isEnabled = Boolean(cms?.googleAuth?.enabled);

    if (!isEnabled) {
      showToast('Google Sign-In is currently disabled.');
      return;
    }

    if (!clientId) {
      showToast('Google Sign-In is not configured yet. Please configure your Google Client ID in Admin CMS > API Integrations.');
      return;
    }

    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          showToast('Please select your Google account to sign in.');
        }
      });
    } else {
      showToast('Loading Google Sign-in services... Please try again in a moment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-backdrop"
        onClick={() => setIsAuthModalOpen(false)}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#EDE9E1] overflow-hidden z-10 animate-modal-pop">
        
        {/* Header with Close */}
        <div className="p-6 bg-[#FCFBF8] border-b border-[#EDE9E1] relative text-center">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#7A7369] hover:text-[#1C1A18] hover:bg-[#F2ECE1] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span className="w-2.5 h-2.5 rotate-45 bg-[#8B2628]"></span>
            <span className="font-serif font-bold text-xl tracking-[0.2em] text-[#1C1A18] uppercase">
              {cms.siteInfo.brandName}
            </span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1C1A18]">
            {isRegister ? 'Create an Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-[#7A7369] mt-1">
            {isRegister 
              ? 'Join Zinnia for personalized ordering, address book, and loyalty perks'
              : 'Enter your credentials to access your account & saved orders'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#4A443D] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9E978C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                />
              </div>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#4A443D] mb-1.5">
                Phone Number (Optional - শুধুমাত্র ১১ ডিজিটের নম্বর)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#9E978C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={phone}
                  onKeyDown={handleNumericKeyDown}
                  onChange={(e) => setPhone(sanitizeBdPhone(e.target.value))}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#4A443D] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9E978C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A443D] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9E978C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-xs text-[#1C1A18] focus:outline-none focus:border-[#8B2628]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-press w-full py-3 bg-[#8B2628] hover:bg-[#721E20] text-white rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span>{loading ? 'Please wait...' : (isRegister ? 'Register Account' : 'Sign In')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Social Sign In Button (Only shown if Google Sign-In is enabled in Admin CMS) */}
          {cms?.googleAuth?.enabled && (
            <>
              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#EDE9E1]"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-white px-2 text-[#9E978C]">or continue with</span>
                </div>
              </div>

              {/* Social Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleClick}
                className="btn-press w-full py-2.5 border border-[#DDD5C7] hover:bg-[#FAF8F5] text-[#2C2926] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* Toggle Register / Login */}
          <div className="pt-2 text-center text-xs text-[#7A7369]">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-bold text-[#8B2628] hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="font-bold text-[#8B2628] hover:underline"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
