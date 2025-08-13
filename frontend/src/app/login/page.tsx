'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  User, 
  Shield, 
  Info, 
  KeyRound, 
  Mail, 
  Lock, 
  Github, 
  Chrome,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Zap
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  rememberMe: z.boolean().optional(),
  require2FA: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && isValid) {
        handleSubmit(onSubmit)();
      }
      if (e.key === 'Escape') {
        setError('');
        setSuccess('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isValid]);

  // Lockout timer
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const onSubmit = async (data: LoginForm) => {
    if (isLocked) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const success = await login(data.email, data.password);
      if (success) {
        setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
        setLoginAttempts(0);
        
        if (data.require2FA) {
          setShowTwoFA(true);
        } else {
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setIsLocked(true);
          setLockoutTime(30);
          setError('Çok fazla başarısız giriş denemesi. 30 saniye bekleyin.');
        } else {
          setError(`Email veya şifre hatalı. Kalan deneme: ${3 - newAttempts}`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
    setValue('rememberMe', true);
    setValue('require2FA', true);
    setTimeout(() => handleSubmit(onSubmit)(), 100);
  };

  const handleVerify2FA = async () => {
    if (!twoFACode || twoFACode.length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu giriniz');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate 2FA verification
    setTimeout(() => {
      if (twoFACode === '123456') {
        setSuccess('2FA doğrulaması başarılı! Yönlendiriliyorsunuz...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setError('Doğrulama kodu geçersiz. Lütfen tekrar deneyin.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSocialLogin = (provider: string) => {
    setSuccess(`${provider} ile giriş yapılıyor...`);
    // Implement social login logic here
  };

  const handleForgotPassword = () => {
    setSuccess('Şifre sıfırlama linki email adresinize gönderildi.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="group relative max-w-md w-full">
        {/* Background decorations */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10 animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-pink-400/20 blur-3xl dark:bg-pink-500/10 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-yellow-400/10 blur-2xl dark:bg-yellow-500/5 animate-bounce" />

        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-indigo-200/80 via-transparent to-pink-200/80 dark:from-indigo-500/30 dark:to-pink-500/30">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={error ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { opacity: 1, y: 0, scale: 1 }}
            transition={error ? { duration: 0.4 } : { duration: 0.35, ease: 'easeOut' }}
            className="rounded-2xl bg-white/70 dark:bg-gray-800/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-xl ring-1 ring-black/5"
          >
            <div className="w-full space-y-8 p-6 sm:p-8">
              {/* Header */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
                  <LogIn className="h-8 w-8 text-white" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  ERP Sistemine Giriş
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
                  Hesabınıza giriş yapın
                </p>
                <div className="mt-2 flex items-center justify-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Zap className="h-3 w-3" />
                  <span>Ctrl + Enter ile hızlı giriş</span>
                </div>
              </motion.div>

              {/* Social Login */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Google')}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <Chrome className="w-4 h-4 mr-2 text-red-500" />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('GitHub')}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <Github className="w-4 h-4 mr-2 text-gray-800 dark:text-gray-200" />
                    GitHub
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white/70 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400">veya</span>
                  </div>
                </div>
              </motion.div>

              {/* Login Form */}
              <motion.form 
                className="mt-8 space-y-6" 
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Email Adresi
                      </label>
                      <div className="relative group">
                        <Info className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        <div className="pointer-events-none absolute right-0 mt-2 w-56 rounded-md bg-gray-900 text-gray-100 text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                          Geçerli bir email formatı kullanın. Örnek: ad@site.com
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('email')}
                        type="email"
                        className="pl-10 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-md bg-white/80 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200"
                        placeholder="ornek@email.com"
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-1 text-sm text-red-600 flex items-center"
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.email.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Şifre
                      </label>
                      <div className="relative group">
                        <Info className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        <div className="pointer-events-none absolute right-0 mt-2 w-56 rounded-md bg-gray-900 text-gray-100 text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                          En az 6 karakter girin. Güçlü şifre için rakam ve sembol ekleyin.
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="pl-10 appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-md bg-white/80 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-1 text-sm text-red-600 flex items-center"
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.password.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Options */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        {...register('rememberMe')}
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Beni hatırla
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        {...register('require2FA')}
                        id="require-2fa"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 rounded"
                      />
                      <label htmlFor="require-2fa" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 flex items-center">
                        <KeyRound className="h-4 w-4 mr-1 text-indigo-600" />
                        2FA kullan
                      </label>
                    </div>
                  </div>

                  {/* 2FA Section */}
                  <AnimatePresence>
                    {showTwoFA && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6"
                      >
                        <div className="flex items-center mb-3">
                          <KeyRound className="h-5 w-5 text-indigo-600 mr-2" />
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">İki Aşamalı Doğrulama</h3>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">Uygulamanıza gönderilen 6 haneli kodu girin. Demo kod: 123456</p>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={twoFACode}
                            onChange={(e) => setTwoFACode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white/80 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="000000"
                          />
                          <button
                            type="button"
                            onClick={handleVerify2FA}
                            disabled={isLoading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Doğrula'
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50/80 dark:bg-red-900/20 border border-red-200/80 dark:border-red-800/40 rounded-md p-3"
                    >
                      <p className="text-sm text-red-600 dark:text-red-300 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {error}
                      </p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-green-50/80 dark:bg-green-900/20 border border-green-200/80 dark:border-green-800/40 rounded-md p-3"
                    >
                      <p className="text-sm text-green-600 dark:text-green-300 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {success}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading || isLocked || !isValid}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        {isLocked ? `Kilitli (${lockoutTime}s)` : 'Giriş Yap'}
                      </>
                    )}
                  </button>
                </div>

                {/* Forgot Password */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                  >
                    Şifremi unuttum
                  </button>
                </div>

                {/* Demo Accounts */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Demo Hesaplar:
                  </p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('admin@example.com', '123456')}
                      disabled={isLoading || isLocked}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                    >
                      <Shield className="w-4 h-4 mr-2 text-indigo-600" />
                      Admin Hesabı
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('manager@example.com', '123456')}
                      disabled={isLoading || isLocked}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                    >
                      <User className="w-4 h-4 mr-2 text-green-600" />
                      Manager Hesabı
                    </button>
                  </div>
                </div>
              </motion.form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 