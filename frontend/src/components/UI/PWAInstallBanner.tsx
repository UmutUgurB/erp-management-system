'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  X, 
  Smartphone, 
  Wifi, 
  WifiOff,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useNotifications } from '@/hooks/useNotifications';

export default function PWAInstallBanner() {
  const { 
    canInstall, 
    isInstalled, 
    isOnline, 
    isUpdateAvailable, 
    installApp, 
    updateApp, 
    skipWaiting 
  } = usePWA();
  
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Show install banner if app can be installed and not already installed
    if (canInstall && !isInstalled) {
      setShowBanner(true);
    }

    // Show update banner if update is available
    if (isUpdateAvailable) {
      setShowBanner(true);
    }
  }, [canInstall, isInstalled, isUpdateAvailable]);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installApp();
      setShowBanner(false);
      addNotification('success', 'Başarılı!', 'Uygulama başarıyla yüklendi.');
    } catch (error) {
      addNotification('error', 'Hata!', 'Uygulama yüklenirken bir hata oluştu.');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      updateApp();
      skipWaiting();
      setShowBanner(false);
      addNotification('success', 'Başarılı!', 'Uygulama güncellendi. Sayfa yenileniyor...');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      addNotification('error', 'Hata!', 'Güncelleme sırasında bir hata oluştu.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Store dismissal in localStorage to avoid showing again for a while
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const handleClose = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isUpdateAvailable ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <Smartphone className="h-6 w-6" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-medium">
                  {isUpdateAvailable 
                    ? 'Yeni Güncelleme Mevcut' 
                    : 'ERP Sistemi Uygulamasını Yükleyin'
                  }
                </h3>
                <p className="text-xs opacity-90">
                  {isUpdateAvailable 
                    ? 'Yeni özellikler ve iyileştirmeler için uygulamayı güncelleyin.'
                    : 'Daha hızlı erişim için uygulamayı ana ekranınıza ekleyin.'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Online/Offline Status */}
              <div className="flex items-center space-x-1 text-xs">
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-300" />
                    <span className="text-green-300">Çevrimiçi</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-yellow-300" />
                    <span className="text-yellow-300">Çevrimdışı</span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {isUpdateAvailable ? (
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-white text-indigo-600 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Güncelleniyor...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3" />
                        <span>Güncelle</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling || !isOnline}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-white text-indigo-600 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {isInstalling ? (
                      <>
                        <Download className="h-3 w-3 animate-spin" />
                        <span>Yükleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3" />
                        <span>Yükle</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleDismiss}
                  className="px-2 py-1.5 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// PWA Status Indicator Component
export function PWAStatusIndicator() {
  const { isInstalled, isOnline, isUpdateAvailable } = usePWA();

  if (!isInstalled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full shadow-lg px-3 py-2">
        {isUpdateAvailable ? (
          <div className="flex items-center space-x-1 text-orange-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-xs font-medium">Güncelleme</span>
          </div>
        ) : isOnline ? (
          <div className="flex items-center space-x-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Çevrimiçi</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-yellow-600">
            <WifiOff className="h-4 w-4" />
            <span className="text-xs font-medium">Çevrimdışı</span>
          </div>
        )}
      </div>
    </div>
  );
} 