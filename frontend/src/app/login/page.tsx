'use client';

import { useState, useEffect, useRef } from 'react';
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
  Zap,
  Copy,
  Check,
  Star,
  Sparkles,
  Heart,
  Target,
  Moon,
  Sun,
  Palette,
  Music,
  Volume2,
  VolumeX
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  rememberMe: z.boolean().optional(),
  require2FA: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

// Password strength checker
const getPasswordStrength = (password: string | undefined) => {
  // Return default values if password is undefined or null
  if (!password) {
    return { strength: 'Şifre girin', color: 'bg-gray-300', width: 'w-0' };
  }
  
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 1) return { strength: 'Zayıf', color: 'bg-red-500', width: 'w-1/5' };
  if (score <= 2) return { strength: 'Orta', color: 'bg-yellow-500', width: 'w-2/5' };
  if (score <= 3) return { strength: 'İyi', color: 'bg-blue-500', width: 'w-3/5' };
  if (score <= 4) return { strength: 'Güçlü', color: 'bg-green-500', width: 'w-4/5' };
  return { strength: 'Çok Güçlü', color: 'bg-emerald-500', width: 'w-full' };
};

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
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number, type: string}>>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const { login } = useAuth();
  const router = useRouter();
  const emailInputRef = useRef<HTMLInputElement>(null);

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
  const passwordStrength = getPasswordStrength(watchedPassword);

  // Auto-focus email input on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Load last used email from localStorage
  useEffect(() => {
    const lastEmail = localStorage.getItem('lastEmail');
    if (lastEmail) {
      setValue('email', lastEmail);
    }
  }, [setValue]);

  // Save email to localStorage when it changes
  useEffect(() => {
    if (watchedEmail && watchedEmail.includes('@')) {
      localStorage.setItem('lastEmail', watchedEmail);
    }
  }, [watchedEmail]);

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

  // Generate enhanced floating particles
  useEffect(() => {
    const particleTypes = ['star', 'circle', 'diamond', 'triangle'];
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      delay: Math.random() * 3,
      type: particleTypes[Math.floor(Math.random() * particleTypes.length)]
    }));
    setParticles(newParticles);
  }, []);

  // Theme switching
  const themes = {
    default: 'from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900',
    sunset: 'from-orange-50 via-red-50 to-pink-50 dark:from-orange-900 dark:via-red-950 dark:to-pink-900',
    ocean: 'from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900 dark:via-blue-950 dark:to-indigo-900',
    forest: 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-900 dark:via-emerald-950 dark:to-teal-900'
  };

  const currentThemeClass = themes[currentTheme as keyof typeof themes] || themes.default;

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

  const copyToClipboard = async (text: string, accountType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccount(accountType);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br ${currentThemeClass} relative overflow-hidden transition-all duration-1000`}>
      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute ${
              particle.type === 'star' ? 'text-yellow-400/40' :
              particle.type === 'circle' ? 'text-blue-400/40' :
              particle.type === 'diamond' ? 'text-purple-400/40' :
              'text-green-400/40'
            }`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.3, 0.8],
              rotate: particle.type === 'star' ? [0, 180, 360] : [0, 90, 180, 270, 360]
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {particle.type === 'star' && <Star className="w-full h-full" />}
            {particle.type === 'circle' && <div className="w-full h-full rounded-full bg-current" />}
            {particle.type === 'diamond' && <div className="w-full h-full bg-current transform rotate-45" />}
            {particle.type === 'triangle' && <div className="w-full h-full bg-current clip-path-polygon" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />}
          </motion.div>
        ))}
      </div>

      {/* Theme Switcher */}
      <motion.div 
        className="absolute top-4 right-4 flex items-center space-x-2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-200"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.button>
        
        <motion.button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </motion.button>
        
        <motion.div
          className="relative group"
          whileHover={{ scale: 1.05 }}
        >
          <motion.button
            onClick={() => {
              const themeKeys = Object.keys(themes);
              const currentIndex = themeKeys.indexOf(currentTheme);
              const nextIndex = (currentIndex + 1) % themeKeys.length;
              setCurrentTheme(themeKeys[nextIndex]);
            }}
            className="p-2 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-200"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <Palette className="w-4 h-4" />
          </motion.button>
          
          {/* Theme Tooltip */}
          <div className="absolute right-0 mt-2 w-32 bg-gray-900 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
            Tema Değiştir
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Background Decorations */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10 animate-pulse" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-pink-400/20 blur-3xl dark:bg-pink-500/10 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-yellow-400/10 blur-2xl dark:bg-yellow-500/5 animate-bounce" />
      
      {/* New floating elements */}
      <motion.div
        className="absolute top-20 left-20 w-16 h-16 text-indigo-400/30 dark:text-indigo-500/20"
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-full h-full" />
      </motion.div>
      
      <motion.div
        className="absolute bottom-20 right-20 w-12 h-12 text-pink-400/30 dark:text-pink-500/20"
        animate={{ rotate: -360, y: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="w-full h-full" />
      </motion.div>
      
      <motion.div
        className="absolute top-1/3 right-1/4 w-8 h-8 text-green-400/30 dark:text-green-500/20"
        animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Target className="w-full h-full" />
      </motion.div>

      {/* Music Visualizer Bars */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-end space-x-1 z-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-white/30 dark:bg-gray-300/30 rounded-full"
            animate={{
              height: [10, 30, 10],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1 + Math.random() * 2,
              delay: i * 0.1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="group relative max-w-md w-full">
        {/* Enhanced glassmorphism border */}
        <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-indigo-200/80 via-purple-200/80 to-pink-200/80 dark:from-indigo-500/30 dark:via-purple-500/30 dark:to-pink-500/30 shadow-2xl backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={error ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { opacity: 1, y: 0, scale: 1 }}
            transition={error ? { duration: 0.4 } : { duration: 0.35, ease: 'easeOut' }}
            className="rounded-2xl bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-xl ring-1 ring-black/5 relative overflow-hidden"
          >
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 rounded-2xl" />
            
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-full space-y-8 p-6 sm:p-8 relative z-10">
              {/* Enhanced Header */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div 
                  className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 relative overflow-hidden"
                  whileHover={{ rotate: 5 }}
                >
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 animate-pulse" />
                  
                  {/* Floating particles inside logo */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute top-2 left-2 w-2 h-2 bg-white/30 rounded-full" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full" />
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-white/30 rounded-full" />
                    <div className="absolute bottom-2 right-2 w-2 h-2 bg-white/30 rounded-full" />
                  </motion.div>
                  
                  <LogIn className="h-8 w-8 text-white relative z-10" />
                </motion.div>
                
                <motion.h2 
                  className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  ERP Sistemine Giriş
                </motion.h2>
                
                <motion.p 
                  className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Hesabınıza giriş yapın
                </motion.p>
                
                <motion.div 
                  className="mt-2 flex items-center justify-center space-x-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/50 px-3 py-1 rounded-full backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span>Ctrl + Enter ile hızlı giriş</span>
                </motion.div>
              </motion.div>

              {/* Enhanced Social Login */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    onClick={() => handleSocialLogin('Google')}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/90 dark:bg-gray-800/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Chrome className="w-4 h-4 mr-2 text-red-500" />
                    Google
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => handleSocialLogin('GitHub')}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/90 dark:bg-gray-800/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Github className="w-4 h-4 mr-2 text-gray-800 dark:text-gray-200" />
                    GitHub
                  </motion.button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white/80 dark:bg-gray-800/70 text-gray-500 dark:text-gray-400">veya</span>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Login Form */}
              <motion.form 
                className="mt-8 space-y-6" 
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="space-y-4">
                  {/* Enhanced Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center justify-between">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Email Adresi
                      </label>
                      <div className="relative group">
                        <Info className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
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
                        ref={emailInputRef}
                        type="email"
                        className="pl-10 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-md bg-white/90 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600"
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
                  </motion.div>
                  
                  {/* Enhanced Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Şifre
                      </label>
                      <div className="relative group">
                        <Info className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
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
                        className="pl-10 appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-md bg-white/90 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600"
                        placeholder="••••••••"
                      />
                      <motion.button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                    
                    {/* Enhanced Password Strength Indicator */}
                    {watchedPassword && watchedPassword.length > 0 && (
                      <motion.div 
                        className="mt-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Şifre gücü:</span>
                          <span className={`font-medium ${
                            passwordStrength.strength === 'Zayıf' ? 'text-red-500' :
                            passwordStrength.strength === 'Orta' ? 'text-yellow-500' :
                            passwordStrength.strength === 'İyi' ? 'text-blue-500' :
                            passwordStrength.strength === 'Güçlü' ? 'text-green-500' :
                            'text-emerald-500'
                          }`}>
                            {passwordStrength.strength}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <motion.div 
                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: passwordStrength.width.replace('w-', '').replace('/', '') + '%' }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    )}
                    
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
                  </motion.div>

                  {/* Enhanced Options */}
                  <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center">
                      <input
                        {...register('rememberMe')}
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 rounded transition-colors"
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
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 rounded transition-colors"
                      />
                      <label htmlFor="require-2fa" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 flex items-center">
                        <KeyRound className="h-4 w-4 mr-1 text-indigo-600" />
                        2FA kullan
                      </label>
                    </div>
                  </motion.div>

                  {/* Enhanced 2FA Section */}
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
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white/90 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                            placeholder="000000"
                          />
                          <motion.button
                            type="button"
                            onClick={handleVerify2FA}
                            disabled={isLoading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Doğrula'
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Enhanced Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="bg-red-50/90 dark:bg-red-900/30 border border-red-200/90 dark:border-red-800/50 rounded-md p-3 shadow-sm"
                    >
                      <p className="text-sm text-red-600 dark:text-red-300 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {error}
                      </p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="bg-green-50/90 dark:bg-green-900/30 border border-green-200/90 dark:border-green-800/50 rounded-md p-3 shadow-sm"
                    >
                      <p className="text-sm text-green-600 dark:text-green-300 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {success}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Enhanced Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.button
                    type="submit"
                    disabled={isLoading || isLocked || !isValid}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 rounded-md animate-pulse" />
                    
                    <div className="relative z-10 flex items-center">
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          {isLocked ? `Kilitli (${lockoutTime}s)` : 'Giriş Yap'}
                        </>
                      )}
                    </div>
                  </motion.button>
                </motion.div>

                {/* Enhanced Forgot Password */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors hover:underline"
                    whileHover={{ scale: 1.05 }}
                  >
                    Şifremi unuttum
                  </motion.button>
                </motion.div>

                {/* Enhanced Demo Accounts */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 flex items-center justify-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    Demo Hesaplar:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        type="button"
                        onClick={() => handleDemoLogin('admin@example.com', '123456')}
                        disabled={isLoading || isLocked}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/90 dark:bg-gray-800/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Shield className="w-4 h-4 mr-2 text-indigo-600" />
                        Admin Hesabı
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => copyToClipboard('admin@example.com / 123456', 'admin')}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="Bilgileri kopyala"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {copiedAccount === 'admin' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        type="button"
                        onClick={() => handleDemoLogin('manager@example.com', '123456')}
                        disabled={isLoading || isLocked}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/90 dark:bg-gray-800/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <User className="w-4 h-4 mr-2 text-green-600" />
                        Manager Hesabı
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => copyToClipboard('manager@example.com / 123456', 'manager')}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="Bilgileri kopyala"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {copiedAccount === 'manager' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 