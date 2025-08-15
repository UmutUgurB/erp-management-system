'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { CardGradient } from '@/components/Dashboard/DashboardBuilder';
import { motion } from 'framer-motion';
import { Star, Award, Clock, Target, Search, Filter, TrendingUp, Bell, Zap, Sparkles, Heart, Target as TargetIcon, Rocket, Trophy, Users, BarChart3 } from 'lucide-react';
import AdvancedSearch from '@/components/UI/AdvancedSearch';
import { useToast } from '@/components/UI/Toast';
import { useConfetti } from '@/components/UI/Confetti';
import ProgressBar, { CircularProgressBar, GradientProgressBar } from '@/components/UI/ProgressBar';

export default function DashboardPage() {
  const { addToast } = useToast();
  const { isActive: confettiActive, trigger: triggerConfetti } = useConfetti();
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-16 h-16 text-indigo-400/20 dark:text-indigo-500/10"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-full h-full" />
          </motion.div>
          
          <motion.div
            className="absolute top-40 right-20 w-12 h-12 text-pink-400/20 dark:text-pink-500/10"
            animate={{ rotate: -360, y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="w-full h-full" />
          </motion.div>
          
          <motion.div
            className="absolute bottom-40 left-1/4 w-8 h-8 text-green-400/20 dark:text-green-500/10"
            animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <TargetIcon className="w-full h-full" />
          </motion.div>
          
          <motion.div
            className="absolute bottom-20 right-1/3 w-10 h-10 text-yellow-400/20 dark:text-yellow-500/10"
            animate={{ y: [0, -15, 0], rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <Rocket className="w-full h-full" />
          </motion.div>
        </div>

        {/* Enhanced Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CardGradient className="relative overflow-hidden">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-10 right-10 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-600 rounded-full blur-2xl animate-pulse delay-1000"></div>
              <div className="absolute bottom-10 left-20 w-20 h-20 bg-gradient-to-br from-pink-400 to-red-600 rounded-full blur-xl animate-pulse delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full blur-lg animate-pulse delay-1500"></div>
            </div>

            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <motion.div
                    className="flex items-center space-x-2 mb-3"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="w-6 h-6 text-yellow-400" />
                    <Award className="w-6 h-6 text-blue-400" />
                    <Trophy className="w-6 h-6 text-green-400" />
                  </motion.div>
                  
                  <motion.h2
                    className="text-3xl font-bold text-white mb-2"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Hoş Geldiniz! 🎉
                  </motion.h2>
                  
                  <motion.p
                    className="text-lg text-white/90 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    ERP sisteminizde günlük işlemlerinizi takip edin ve performansınızı analiz edin.
                  </motion.p>
                  
                  <motion.div
                    className="flex items-center space-x-4 text-sm text-white/80"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>12 Aktif Kullanıcı</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>%98 Sistem Performansı</span>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div
                  className="text-right"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-4xl font-bold text-white mb-1">24</div>
                  <div className="text-sm text-white/70">Aktif Proje</div>
                </motion.div>
              </div>
            </div>
          </CardGradient>
        </motion.div>

        {/* Enhanced New Components Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <motion.h3 
            className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Zap className="w-6 h-6 mr-2 text-yellow-500" />
            Yeni Özellikler Demo
          </motion.h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Advanced Search Demo */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-500" />
                Gelişmiş Arama
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <AdvancedSearch
                  placeholder="Arama yapın..."
                  onSearch={handleSearch}
                  onResultSelect={handleResultSelect}
                  className="w-full"
                />
              </div>
            </motion.div>
            
            {/* Enhanced Progress Bars Demo */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                İlerleme Göstergeleri
              </h4>
              <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <ProgressBar value={75} max={100} variant="gradient" />
                <GradientProgressBar value={60} max={100} />
                <ProgressBar value={90} max={100} variant="success" />
              </div>
            </motion.div>
          </div>
          
          {/* Enhanced Circular Progress and Demo Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-500" />
                Dairesel İlerleme
              </h4>
              <div className="flex space-x-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <CircularProgressBar value={75} max={100} variant="success" />
                <CircularProgressBar value={45} max={100} variant="warning" />
                <CircularProgressBar value={90} max={100} variant="danger" />
              </div>
            </motion.div>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-orange-500" />
                Demo Butonları
              </h4>
              <div className="flex flex-wrap gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <motion.button 
                  onClick={handleShowConfetti}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎉 Confetti Göster
                </motion.button>
                <motion.button 
                  onClick={() => handleShowToast('success')}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✅ Başarı Toast
                </motion.button>
                <motion.button 
                  onClick={() => handleShowToast('warning')}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ⚠️ Uyarı Toast
                </motion.button>
                <motion.button 
                  onClick={() => handleShowToast('celebration')}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎊 Kutlama Toast
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Stat Card 1 */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Satış</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₺124,500</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={75} max={100} variant="success" size="sm" />
            </div>
          </motion.div>

          {/* Stat Card 2 */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Projeler</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">24</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={60} max={100} variant="warning" size="sm" />
            </div>
          </motion.div>

          {/* Stat Card 3 */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Müşteri Memnuniyeti</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">%94</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={94} max={100} variant="gradient" size="sm" />
            </div>
          </motion.div>

          {/* Stat Card 4 */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sistem Uptime</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">99.9%</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={99.9} max={100} variant="success" size="sm" />
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-500" />
            Son Aktiviteler
          </h3>
          <div className="space-y-3">
            {[
              { text: 'Yeni sipariş oluşturuldu', time: '2 dakika önce', type: 'success' },
              { text: 'Stok güncellendi', time: '15 dakika önce', type: 'info' },
              { text: 'Müşteri raporu hazırlandı', time: '1 saat önce', type: 'warning' },
              { text: 'Sistem yedeklemesi tamamlandı', time: '2 saat önce', type: 'success' }
            ].map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <span className="text-gray-700 dark:text-gray-300">{activity.text}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Confetti Effect container */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {confettiActive && (
          <div className="absolute inset-0">
            {/* Confetti pieces will be rendered here */}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 