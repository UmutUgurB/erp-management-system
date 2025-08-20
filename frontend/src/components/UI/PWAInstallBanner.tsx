'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  X, 
  Smartphone, 
  Globe, 
  Star, 
  Zap,
  CheckCircle,
  Info
} from 'lucide-react';

interface PWAInstallBannerProps {
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
  showInstallButton?: boolean;
  customMessage?: string;
  position?: 'top' | 'bottom' | 'floating';
  theme?: 'light' | 'dark' | 'auto';
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  className = '',
  onInstall,
  onDismiss,
  showInstallButton = true,
  customMessage,
  position = 'top',
  theme = 'auto'
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [installStep, setInstallStep] = useState<'idle' | 'installing' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Check if PWA is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show banner after a delay
      setTimeout(() => {
        if (!checkIfInstalled() && !isDismissed) {
          setIsVisible(true);
        }
      }, 3000);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setInstallStep('success');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setInstallStep('idle');
      }, 3000);
    };

    // Check if already installed
    if (!checkIfInstalled()) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isDismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setInstallStep('installing');
    
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallStep('success');
        onInstall?.();
        
        // Hide banner after success
        setTimeout(() => {
          setIsVisible(false);
          setInstallStep('idle');
        }, 2000);
      } else {
        setInstallStep('idle');
      }
    } catch (error) {
      console.error('Installation failed:', error);
      setInstallStep('error');
      
      setTimeout(() => {
        setInstallStep('idle');
      }, 3000);
    }
    
    // Clear the deferred prompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    onDismiss?.();
    
    // Store dismissal in localStorage
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-0 left-0 right-0';
      case 'floating':
        return 'bottom-4 right-4';
      default: // top
        return 'top-0 left-0 right-0';
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-white border-gray-700';
      case 'light':
        return 'bg-white text-gray-900 border-gray-200';
      default: // auto
        return 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700';
    }
  };

  const getInstallStepContent = () => {
    switch (installStep) {
      case 'installing':
        return (
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            <span>Kuruluyor...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>Başarıyla kuruldu!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <Info className="w-4 h-4" />
            <span>Kurulum başarısız</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Don't show if already installed, dismissed, or no install prompt
  if (isInstalled || isDismissed || !deferredPrompt || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed z-50 ${getPositionClasses()} ${className}`}
        initial={{ 
          opacity: 0, 
          y: position === 'top' ? -100 : 100,
          scale: position === 'floating' ? 0.8 : 1
        }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: 1
        }}
        exit={{ 
          opacity: 0, 
          y: position === 'top' ? -100 : 100,
          scale: position === 'floating' ? 0.8 : 1
        }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 300 
        }}
      >
        <div className={`border-b ${getThemeClasses()} shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                    <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="hidden sm:flex items-center space-x-1 text-sm">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="font-medium">PWA Kurulumu</span>
                  </div>
                </div>
                
                <div className="text-sm">
                  {customMessage || (
                    <span>
                      Bu uygulamayı <strong>ana ekranınıza</strong> kurarak hızlı erişim sağlayın
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Install Step Indicator */}
                {getInstallStepContent()}
                
                {/* Install Button */}
                {showInstallButton && installStep === 'idle' && (
                  <motion.button
                    onClick={handleInstall}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Kur</span>
                  </motion.button>
                )}
                
                {/* Dismiss Button */}
                <button
                  onClick={handleDismiss}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallBanner;

// Specialized PWA banner components
export const TopPWAInstallBanner: React.FC<{
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
}> = (props) => (
  <PWAInstallBanner position="top" {...props} />
);

export const BottomPWAInstallBanner: React.FC<{
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
}> = (props) => (
  <PWAInstallBanner position="bottom" {...props} />
);

export const FloatingPWAInstallBanner: React.FC<{
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
}> = (props) => (
  <PWAInstallBanner position="floating" {...props} />
);

export const DarkPWAInstallBanner: React.FC<{
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
}> = (props) => (
  <PWAInstallBanner theme="dark" {...props} />
); 