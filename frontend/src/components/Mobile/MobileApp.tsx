'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Share2, 
  Star, 
  CheckCircle,
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  Settings,
  Bell,
  User,
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  Menu,
  X,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Zap,
  Battery,
  Signal
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface MobileAppData {
  isInstalled: boolean;
  isOnline: boolean;
  batteryLevel: number;
  signalStrength: number;
  syncStatus: 'synced' | 'syncing' | 'error';
  lastSync: string;
  offlineData: {
    products: number;
    orders: number;
    customers: number;
  };
}

export default function MobileApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [appData, setAppData] = useState<MobileAppData>({
    isInstalled: false,
    isOnline: true,
    batteryLevel: 85,
    signalStrength: 4,
    syncStatus: 'synced',
    lastSync: '2 dakika önce',
    offlineData: {
      products: 156,
      orders: 23,
      customers: 89
    }
  });
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Check if app is installed
    const checkInstallation = () => {
      const isInstalled = localStorage.getItem('mobileAppInstalled') === 'true';
      setAppData(prev => ({ ...prev, isInstalled }));
    };

    checkInstallation();
    
    // Simulate network status changes
    const interval = setInterval(() => {
      setAppData(prev => ({
        ...prev,
        batteryLevel: Math.max(0, prev.batteryLevel - Math.random() * 2),
        signalStrength: Math.floor(Math.random() * 5) + 1
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleInstall = () => {
    setAppData(prev => ({ ...prev, isInstalled: true }));
    localStorage.setItem('mobileAppInstalled', 'true');
    addNotification('success', 'Başarılı!', 'Mobil uygulama başarıyla yüklendi.');
  };

  const handleSync = async () => {
    setAppData(prev => ({ ...prev, syncStatus: 'syncing' }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAppData(prev => ({ 
        ...prev, 
        syncStatus: 'synced',
        lastSync: 'Şimdi'
      }));
      addNotification('success', 'Senkronizasyon', 'Veriler başarıyla senkronize edildi.');
    } catch (error) {
      setAppData(prev => ({ ...prev, syncStatus: 'error' }));
      addNotification('error', 'Hata!', 'Senkronizasyon başarısız oldu.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ERP Mobil Uygulama',
        text: 'ERP sistemimizin mobil uygulamasını deneyin!',
        url: window.location.origin
      });
    } else {
      addNotification('info', 'Paylaşım', 'Uygulama linki kopyalandı.');
    }
  };

  const getSignalIcon = (strength: number) => {
    const bars = [];
    for (let i = 1; i <= 5; i++) {
      bars.push(
        <div
          key={i}
          className={`w-1 rounded-full ${
            i <= strength ? 'bg-green-500' : 'bg-gray-300'
          }`}
          style={{ height: `${i * 2}px` }}
        />
      );
    }
    return <div className="flex items-end space-x-0.5">{bars}</div>;
  };

  const getBatteryIcon = (level: number) => {
    let color = 'text-green-500';
    if (level < 20) color = 'text-red-500';
    else if (level < 50) color = 'text-yellow-500';
    
    return (
      <div className="flex items-center space-x-1">
        <Battery className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-gray-600">{Math.round(level)}%</span>
      </div>
    );
  };

  const getSyncIcon = (status: string) => {
    switch (status) {
      case 'syncing':
        return <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <CloudOff className="w-4 h-4 text-red-500" />;
      default:
        return <Cloud className="w-4 h-4 text-green-500" />;
    }
  };

  const renderHomeView = () => (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          {getSignalIcon(appData.signalStrength)}
          <span>ERP Mobile</span>
        </div>
        <div className="flex items-center space-x-2">
          {getBatteryIcon(appData.batteryLevel)}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
          <div className="text-lg font-bold">{appData.offlineData.products}</div>
          <div className="text-xs opacity-90">Ürün</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
          <div className="text-lg font-bold">{appData.offlineData.orders}</div>
          <div className="text-xs opacity-90">Sipariş</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
          <div className="text-lg font-bold">{appData.offlineData.customers}</div>
          <div className="text-xs opacity-90">Müşteri</div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getSyncIcon(appData.syncStatus)}
            <span className="text-sm">Senkronizasyon</span>
          </div>
          <button
            onClick={handleSync}
            disabled={appData.syncStatus === 'syncing'}
            className="text-xs text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            {appData.syncStatus === 'syncing' ? 'Senkronize ediliyor...' : 'Senkronize Et'}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Son güncelleme: {appData.lastSync}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Hızlı İşlemler</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Plus className="w-4 h-4 text-green-600" />
            <span className="text-sm">Yeni Sipariş</span>
          </button>
          <button className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm">Stok Kontrol</span>
          </button>
          <button className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <User className="w-4 h-4 text-purple-600" />
            <span className="text-sm">Müşteri Ekle</span>
          </button>
          <button className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <BarChart3 className="w-4 h-4 text-orange-600" />
            <span className="text-sm">Raporlar</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProductsView = () => (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Ürün ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
        />
      </div>

      {/* Product List */}
      <div className="space-y-2">
        {[
          { id: 1, name: 'Laptop Pro', stock: 15, price: '₺12,500', status: 'active' },
          { id: 2, name: 'Wireless Mouse', stock: 45, price: '₺250', status: 'active' },
          { id: 3, name: 'Mechanical Keyboard', stock: 8, price: '₺850', status: 'low' },
          { id: 4, name: '4K Monitor', stock: 0, price: '₺3,200', status: 'out' }
        ].map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
              <div className="text-sm text-gray-500">{product.price}</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                product.status === 'active' ? 'bg-green-100 text-green-800' :
                product.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {product.stock} adet
              </span>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Uygulama Ayarları</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Bildirimler</span>
            </div>
            <div className="w-10 h-6 bg-green-500 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Wifi className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Otomatik Senkronizasyon</span>
            </div>
            <div className="w-10 h-6 bg-gray-300 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Shield className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Güvenlik</span>
            </div>
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Cloud className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Yedekleme</span>
            </div>
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Hakkında</h3>
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <div>ERP Mobile v1.0.0</div>
            <div className="mt-1">Son güncelleme: 15 Ocak 2024</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile App Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
      >
        <Smartphone className="w-6 h-6" />
        {!appData.isInstalled && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            !
          </span>
        )}
      </motion.button>

      {/* Mobile App Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm h-[600px] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">ERP Mobile</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {appData.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'home', label: 'Ana Sayfa', icon: Home },
                  { id: 'products', label: 'Ürünler', icon: Package },
                  { id: 'settings', label: 'Ayarlar', icon: Settings }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
                        currentView === item.id
                          ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {currentView === 'home' && renderHomeView()}
                {currentView === 'products' && renderProductsView()}
                {currentView === 'settings' && renderSettingsView()}
              </div>

              {/* Install Banner */}
              {!appData.isInstalled && (
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mobil Uygulamayı İndirin</h4>
                      <p className="text-sm opacity-90">Çevrimdışı çalışma ve daha hızlı erişim</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowQR(true)}
                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleInstall}
                        className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                      >
                        İndir
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code Modal */}
              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center"
                    >
                      <QrCode className="w-32 h-32 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        QR Kodu Tarayın
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Mobil cihazınızla bu QR kodu tarayarak uygulamayı indirin
                      </p>
                      <button
                        onClick={() => setShowQR(false)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Kapat
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 