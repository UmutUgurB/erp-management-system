'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { CardGradient } from '@/components/Dashboard/DashboardBuilder';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Award, Clock, Target, Search, Filter, TrendingUp, Bell, Zap, Sparkles, Heart, Target as TargetIcon, Rocket, Trophy, Users, BarChart3, Eye, EyeOff, Settings, RefreshCw, Download, Share2, Bookmark, MoreHorizontal, Keyboard, Calendar, PieChart, LineChart, Activity, Globe, Shield, Database, Cloud, Cpu, Smartphone, Monitor, Server, Wifi, Lock, Unlock, CheckCircle, AlertTriangle, Info, XCircle, Plus, Minus, ArrowUp, ArrowDown, DollarSign, ShoppingCart, Package, Truck, CreditCard, Wallet, PiggyBank, TrendingDown, BarChart, PieChart as PieChartIcon, LineChart as LineChartIcon, AreaChart, ScatterChart, RadarChart, Gauge, Thermometer, Battery, Signal, Wifi as WifiIcon, Bluetooth, Satellite, Navigation, Compass, MapPin, Home, Building, Factory, Warehouse, Store, Office, School, Hospital, Bank, Hotel, Restaurant, Coffee, Car, Bus, Train, Plane, Ship, Bike, Motorcycle, Scooter, Skateboard, RollerSkate, Snowboard, Surfboard, Tent, Camping, Hiking, Climbing, Swimming, Running, Cycling, Yoga, Meditation, Music, Video, Camera, Phone, Tablet, Laptop, Desktop, Watch, Headphones, Speaker, Microphone, Keyboard as KeyboardIcon, Mouse, Printer, Scanner, Projector, Router, Switch, Hub, Modem, Antenna, Satellite as SatelliteIcon, Dish, Tower, Mast, Flag, Banner, Sign, TrafficLight, StopSign, YieldSign, WarningSign, InfoSign, QuestionMark, ExclamationMark, Period, Comma, Semicolon, Colon, Quote, Apostrophe, Hyphen, Underscore, Slash, Backslash, Pipe, Ampersand, At, Hash, Dollar, Percent, Caret, Tilde, Backtick, Bracket, Brace, Parenthesis, Angle, Equal, Plus as PlusIcon, Minus as MinusIcon, Multiply, Divide, Infinity, Pi, Sigma, Omega, Alpha, Beta, Gamma, Delta, Epsilon, Zeta, Eta, Theta, Iota, Kappa, Lambda, Mu, Nu, Xi, Omicron, Rho, Tau, Upsilon, Phi, Chi, Psi, Omega as OmegaIcon, FileText } from 'lucide-react';
import AdvancedSearch from '@/components/UI/AdvancedSearch';
import { useToast } from '@/components/UI/Toast';
import { useConfetti } from '@/components/UI/Confetti';
import ProgressBar, { CircularProgressBar, GradientProgressBar } from '@/components/UI/ProgressBar';
import QuickActions from '@/components/UI/QuickActions';
import ActivityTimeline from '@/components/UI/ActivityTimeline';
import WeatherWidget from '@/components/UI/WeatherWidget';
import KeyboardShortcuts from '@/components/UI/KeyboardShortcuts';

export default function DashboardPage() {
  const { addToast } = useToast();
  const { isActive: confettiActive, trigger: triggerConfetti } = useConfetti();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      if (event.key === 'F2') {
        event.preventDefault();
        setShowQuickActions(!showQuickActions);
      }
      if (event.key === 'F3') {
        event.preventDefault();
        setShowNotifications(!showNotifications);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showQuickActions, showNotifications]);

  const handleSearch = (query: string, filters: any) => {
    console.log('Search:', query, filters);
    addToast({
      type: 'info',
      title: 'Arama Yapıldı',
      message: `"${query}" için arama sonuçları getiriliyor...`,
      duration: 3000
    });
  };

  const handleResultSelect = (result: any) => {
    addToast({
      type: 'success',
      title: 'Sonuç Seçildi',
      message: `${result.title} seçildi`,
      duration: 3000
    });
  };

  const handleShowConfetti = () => {
    triggerConfetti(4000);
    addToast({
      type: 'celebration',
      title: '🎉 Kutlama!',
      message: 'Confetti efekti aktif!',
      duration: 4000
    });
  };

  const handleShowToast = (type: 'success' | 'error' | 'warning' | 'info' | 'celebration') => {
    const messages = {
      success: { title: 'Başarılı!', message: 'İşlem başarıyla tamamlandı.' },
      error: { title: 'Hata!', message: 'Bir hata oluştu, lütfen tekrar deneyin.' },
      warning: { title: 'Uyarı!', message: 'Dikkatli olun, bu işlem geri alınamaz.' },
      info: { title: 'Bilgi', message: 'Bu özellik hakkında bilgi almak istiyorsunuz.' },
      celebration: { title: '🎉 Kutlama!', message: 'Harika bir iş çıkardınız!' }
    };

    addToast({
      type,
      title: messages[type].title,
      message: messages[type].message,
      duration: 4000
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast({
        type: 'success',
        title: 'Yenilendi!',
        message: 'Dashboard verileri güncellendi.',
        duration: 2000
      });
    }, 1500);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    addToast({
      type: 'info',
      title: 'Sekme Değişti',
      message: `${tab.charAt(0).toUpperCase() + tab.slice(1)} sekmesine geçildi`,
      duration: 2000
    });
  };

  const handleQuickAction = (action: string) => {
    addToast({
      type: 'success',
      title: 'Hızlı İşlem',
      message: `${action} işlemi başlatıldı`,
      duration: 3000
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
        {/* Enhanced Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* New floating elements */}
          <motion.div
            className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
              >
                Hoş Geldiniz! 👋
              </motion.h1>
                             <motion.p
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.6, delay: 0.2 }}
                 className="text-gray-600 dark:text-gray-300 text-lg"
               >
                 Bugün {new Date().toLocaleDateString('tr-TR', { 
                   weekday: 'long', 
                   year: 'numeric', 
                   month: 'long', 
                   day: 'numeric' 
                 })} - Sistem durumu mükemmel! 🚀
               </motion.p>
               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.6, delay: 0.25 }}
                 className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
               >
                 <Clock className="w-4 h-4" />
                 <span className="font-mono">
                   {new Date().toLocaleTimeString('tr-TR', { 
                     hour: '2-digit', 
                     minute: '2-digit', 
                     second: '2-digit' 
                   })}
                 </span>
               </motion.div>
            </div>

            {/* Enhanced Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Zap className="w-4 h-4" />
                Hızlı İşlemler
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Bell className="w-4 h-4" />
                Bildirimler
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Yenileniyor...' : 'Yenile'}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10"
        >
          <div className="flex flex-wrap items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
              { id: 'analytics', label: 'Analitik', icon: PieChart },
              { id: 'performance', label: 'Performans', icon: TrendingUp },
              { id: 'reports', label: 'Raporlar', icon: FileText },
              { id: 'settings', label: 'Ayarlar', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {[
            {
              title: 'Toplam Satış',
              value: '₺2,847,392',
              change: '+12.5%',
              changeType: 'positive',
              icon: DollarSign,
              color: 'from-green-500 to-emerald-600',
              bgColor: 'bg-green-50 dark:bg-green-900/20'
            },
            {
              title: 'Yeni Müşteriler',
              value: '1,247',
              change: '+8.2%',
              changeType: 'positive',
              icon: Users,
              color: 'from-blue-500 to-purple-600',
              bgColor: 'bg-blue-50 dark:bg-blue-900/20'
            },
            {
              title: 'Siparişler',
              value: '892',
              change: '+15.3%',
              changeType: 'positive',
              icon: ShoppingCart,
              color: 'from-orange-500 to-red-600',
              bgColor: 'bg-orange-50 dark:bg-orange-900/20'
            },
            {
              title: 'Stok Değeri',
              value: '₺1,234,567',
              change: '-2.1%',
              changeType: 'negative',
              icon: Package,
              color: 'from-purple-500 to-pink-600',
              bgColor: 'bg-purple-50 dark:bg-purple-900/20'
            },
            {
              title: 'Aktif Projeler',
              value: '24',
              change: '+3.2%',
              changeType: 'positive',
              icon: Target,
              color: 'from-indigo-500 to-cyan-600',
              bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`${stat.bgColor} p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1">
                    {stat.changeType === 'positive' ? (
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">geçen aya göre</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Welcome Card */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-purple-900/20 rounded-2xl border border-gray-200 dark:border-gray-700 p-8"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Sistem Durumu Mükemmel! 🎯
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Tüm sistemler optimal performansta çalışıyor
                        </p>
                      </div>
                    </div>
                                         <div className="grid grid-cols-2 gap-4">
                       <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                         <CheckCircle className="w-4 h-4 text-green-500" />
                         Veritabanı: Aktif
                       </div>
                       <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                         <CheckCircle className="w-4 h-4 text-green-500" />
                         API: Çalışıyor
                       </div>
                       <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                         <CheckCircle className="w-4 h-4 text-green-500" />
                         WebSocket: Bağlı
                       </div>
                       <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                         <CheckCircle className="w-4 h-4 text-green-500" />
                         Backup: Güncel
                       </div>
                       <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                         <CheckCircle className="w-4 h-4 text-green-500" />
                         SSL: Güvenli
                       </div>
                       <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                         <CheckCircle className="w-4 h-4 text-green-500" />
                         Cache: Aktif
                       </div>
                     </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      99.9%
                    </div>
                    <div className="text-sm text-gray-500">
                      Uptime
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Activity Timeline */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Son Aktiviteler
                </h3>
                <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                  Tümünü Gör
                </button>
              </div>
              <ActivityTimeline />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Weather Widget */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <WeatherWidget />
            </motion.div>

            {/* Enhanced Quick Actions */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Hızlı İşlemler
                </h3>
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <QuickActions onAction={handleQuickAction} />
            </motion.div>

            {/* Enhanced System Info */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sistem Bilgileri
                </h3>
                <Server className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">CPU Kullanımı</span>
                  <span className="font-medium text-gray-900 dark:text-white">23%</span>
                </div>
                <ProgressBar value={23} max={100} className="h-2" />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">RAM Kullanımı</span>
                  <span className="font-medium text-gray-900 dark:text-white">67%</span>
                </div>
                <ProgressBar value={67} max={100} className="h-2" />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Disk Kullanımı</span>
                  <span className="font-medium text-gray-900 dark:text-white">45%</span>
                </div>
                <ProgressBar value={45} max={100} className="h-2" />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Ağ Trafiği</span>
                  <span className="font-medium text-gray-900 dark:text-white">12%</span>
                </div>
                <ProgressBar value={12} max={100} className="h-2" />
              </div>
            </motion.div>
          </div>
        </motion.div>

                 {/* Enhanced Floating Action Button */}
         <motion.div
           initial={{ opacity: 0, scale: 0 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.6, delay: 1 }}
           className="fixed bottom-6 right-6 z-50 group"
         >
           <motion.button
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             onClick={handleShowConfetti}
             className="relative p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
           >
             <Sparkles className="w-6 h-6" />
             {/* Tooltip */}
             <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
               🎉 Confetti Göster
               <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
             </div>
           </motion.button>
         </motion.div>

        {/* Enhanced Search Overlay */}
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl"
              >
                <AdvancedSearch
                  onSearch={handleSearch}
                  onResultSelect={handleResultSelect}
                  placeholder="Arama yapın..."
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Keyboard Shortcuts Modal */}
        <AnimatePresence>
          {showKeyboardShortcuts && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              >
                <KeyboardShortcuts onClose={() => setShowKeyboardShortcuts(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Quick Actions Modal */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Hızlı İşlemler
                  </h3>
                  <button
                    onClick={() => setShowQuickActions(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Plus, label: 'Yeni Ürün', action: 'createProduct' },
                    { icon: Users, label: 'Yeni Müşteri', action: 'createCustomer' },
                    { icon: ShoppingCart, label: 'Yeni Sipariş', action: 'createOrder' },
                    { icon: FileText, label: 'Rapor Oluştur', action: 'createReport' },
                    { icon: Download, label: 'Veri Dışa Aktar', action: 'exportData' },
                    { icon: Settings, label: 'Sistem Ayarları', action: 'systemSettings' }
                  ].map((item) => (
                    <motion.button
                      key={item.action}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleQuickAction(item.label);
                        setShowQuickActions(false);
                      }}
                      className="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <item.icon className="w-8 h-8 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Notifications Modal */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Bildirimler
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { type: 'success', title: 'Sipariş Onaylandı', message: 'Sipariş #12345 başarıyla onaylandı', time: '2 dakika önce' },
                    { type: 'info', title: 'Sistem Güncellemesi', message: 'Yeni özellikler eklendi', time: '1 saat önce' },
                    { type: 'warning', title: 'Stok Uyarısı', message: '5 ürün stokta az', time: '3 saat önce' },
                    { type: 'error', title: 'Bağlantı Hatası', message: 'API bağlantısında sorun', time: '5 saat önce' }
                  ].map((notification, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <div className={`p-2 rounded-full ${
                        notification.type === 'success' ? 'bg-green-100 text-green-600' :
                        notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                         notification.type === 'info' ? <Info className="w-4 h-4" /> :
                         notification.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                         <XCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
} 