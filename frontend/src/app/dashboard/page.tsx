'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { CardGradient } from '@/components/Dashboard/DashboardBuilder';
import { motion } from 'framer-motion';
import { Star, Award, Clock, Target, Search, Filter, TrendingUp, Bell, Zap } from 'lucide-react';
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
      <div className="space-y-6">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CardGradient className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-10 right-10 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-600 rounded-full blur-2xl animate-pulse delay-1000"></div>
              <div className="absolute bottom-10 left-20 w-20 h-20 bg-gradient-to-br from-pink-400 to-red-600 rounded-full blur-xl animate-pulse delay-2000"></div>
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
                    className="text-white/90 text-lg mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    ERP sisteminizde <span className="bg-white/20 px-2 py-1 rounded-full text-sm">5 bekleyen sipariş</span> ve{' '}
                    <span className="bg-white/20 px-2 py-1 rounded-full text-sm">12 yeni müşteri</span> bulunuyor.
                  </motion.p>
                  
                  <motion.div
                    className="flex items-center space-x-4 text-white/80"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Bugün: {new Date().toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Hedef: %85 tamamlandı</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </CardGradient>
        </motion.div>

        {/* New Components Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            <span>Yeni Özellikler Demo</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Advanced Search Demo */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                <Search className="w-4 h-4 text-blue-500" />
                <span>Gelişmiş Arama</span>
              </h4>
              <AdvancedSearch
                placeholder="Ürün, müşteri veya sipariş arayın..."
                onSearch={handleSearch}
                onResultSelect={handleResultSelect}
                showFilters={true}
                showHistory={true}
                showTrending={true}
              />
            </div>

            {/* Progress Bars Demo */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>İlerleme Göstergeleri</span>
              </h4>
              
              <div className="space-y-3">
                <ProgressBar
                  value={75}
                  max={100}
                  variant="success"
                  showLabel={true}
                  showIcon={true}
                  size="md"
                />
                
                <GradientProgressBar
                  value={45}
                  max={100}
                  showLabel={true}
                  size="sm"
                />
                
                <ProgressBar
                  value={90}
                  max={100}
                  variant="warning"
                  showLabel={true}
                  size="lg"
                />
              </div>
            </div>
          </div>

          {/* Circular Progress and Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Dairesel İlerleme</h4>
              <div className="flex space-x-6">
                <CircularProgressBar
                  value={65}
                  max={100}
                  variant="success"
                  size="md"
                />
                <CircularProgressBar
                  value={85}
                  max={100}
                  variant="default"
                  size="sm"
                />
                <CircularProgressBar
                  value={45}
                  max={100}
                  variant="warning"
                  size="lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Demo Butonları</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleShowConfetti}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  🎉 Confetti Göster
                </button>
                
                <button
                  onClick={() => handleShowToast('success')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200"
                >
                  ✅ Başarı Toast
                </button>
                
                <button
                  onClick={() => handleShowToast('warning')}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200"
                >
                  ⚠️ Uyarı Toast
                </button>
                
                <button
                  onClick={() => handleShowToast('celebration')}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200"
                >
                  🎊 Kutlama Toast
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Satış</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₺125,430</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={78} max={100} variant="success" size="sm" showLabel={false} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Geçen aya göre %12 artış</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Yeni Müşteriler</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={60} max={100} variant="default" size="sm" showLabel={false} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bu hafta 24 yeni müşteri</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Siparişler</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">18</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={45} max={100} variant="warning" size="sm" showLabel={false} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ortalama 2.5 gün bekleme</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stok Uyarıları</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">7</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Filter className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={30} max={100} variant="danger" size="sm" showLabel={false} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">7 ürün kritik stok seviyesinde</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confetti Effect */}
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