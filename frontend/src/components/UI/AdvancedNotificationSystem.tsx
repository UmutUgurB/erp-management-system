'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  Settings,
  Filter,
  Search,
  Clock,
  Star,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Zap,
  RefreshCw
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'user' | 'business' | 'security' | 'performance';
  timestamp: Date;
  read: boolean;
  archived: boolean;
  actions?: Array<{
    label: string;
    action: string;
    icon?: React.ComponentType<any>;
  }>;
  metadata?: {
    userId?: string;
    entityId?: string;
    entityType?: string;
    [key: string]: any;
  };
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  categories: string[];
  priorities: string[];
  autoArchive: boolean;
  archiveAfter: number; // hours
}

interface AdvancedNotificationSystemProps {
  className?: string;
}

const AdvancedNotificationSystem: React.FC<AdvancedNotificationSystemProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    desktop: true,
    email: false,
    categories: ['system', 'user', 'business', 'security', 'performance'],
    priorities: ['low', 'medium', 'high', 'critical'],
    autoArchive: true,
    archiveAfter: 24
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Mock notifications for demonstration
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Sistem Güncellemesi Tamamlandı',
        message: 'ERP sistemi başarıyla güncellendi. Yeni özellikler kullanıma hazır.',
        type: 'success',
        priority: 'medium',
        category: 'system',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        archived: false,
        actions: [
          { label: 'Detaylar', action: 'view_details' },
          { label: 'Arşivle', action: 'archive' }
        ]
      },
      {
        id: '2',
        title: 'Yüksek Stok Uyarısı',
        message: 'Laptop Dell XPS 13 stok seviyesi kritik seviyede (5 adet).',
        type: 'warning',
        priority: 'high',
        category: 'business',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        archived: false,
        actions: [
          { label: 'Stok Ekle', action: 'add_stock' },
          { label: 'Sipariş Ver', action: 'place_order' }
        ],
        metadata: {
          entityId: 'prod_123',
          entityType: 'product'
        }
      },
      {
        id: '3',
        title: 'Yeni Kullanıcı Girişi',
        message: 'Ahmet Yılmaz kullanıcısı sisteme giriş yaptı.',
        type: 'info',
        priority: 'low',
        category: 'security',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true,
        archived: false,
        metadata: {
          userId: 'user_456',
          entityType: 'user'
        }
      },
      {
        id: '4',
        title: 'Performans Uyarısı',
        message: 'Veritabanı sorgu süresi 5 saniyeyi aştı. Performans optimizasyonu gerekli.',
        type: 'warning',
        priority: 'medium',
        category: 'performance',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        read: true,
        archived: false,
        actions: [
          { label: 'Analiz Et', action: 'analyze' },
          { label: 'Optimize Et', action: 'optimize' }
        ]
      },
      {
        id: '5',
        title: 'Yedekleme Başarısız',
        message: 'Otomatik yedekleme işlemi başarısız oldu. Manuel müdahale gerekli.',
        type: 'error',
        priority: 'critical',
        category: 'system',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        read: false,
        archived: false,
        actions: [
          { label: 'Tekrar Dene', action: 'retry' },
          { label: 'Manuel Yedekle', action: 'manual_backup' }
        ]
      }
    ];

    setNotifications(mockNotifications);
    updateUnreadCount(mockNotifications);
  }, []);

  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.read && !n.archived).length;
    setUnreadCount(count);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    updateUnreadCount(notifications);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    updateUnreadCount(notifications);
  };

  const archiveNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, archived: true } : n)
    );
    updateUnreadCount(notifications);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    updateUnreadCount(notifications);
  };

  const handleAction = (notification: Notification, action: string) => {
    console.log(`Action ${action} for notification ${notification.id}`);
    
    switch (action) {
      case 'view_details':
        // Handle view details
        break;
      case 'archive':
        archiveNotification(notification.id);
        break;
      case 'add_stock':
        // Handle add stock
        break;
      case 'place_order':
        // Handle place order
        break;
      case 'analyze':
        // Handle analyze
        break;
      case 'optimize':
        // Handle optimize
        break;
      case 'retry':
        // Handle retry
        break;
      case 'manual_backup':
        // Handle manual backup
        break;
    }
  };

  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      const matchesType = filterType === 'all' || notification.type === filterType;
      const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
      const matchesSearch = !searchQuery || 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesType && matchesPriority && matchesCategory && matchesSearch && !notification.archived;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'system': return Zap;
      default: return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'system': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/10';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            ref={notificationRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Bildirimler
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Tümünü Okundu İşaretle"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Ayarlar"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Bildirim ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tüm Türler</option>
                  <option value="success">Başarı</option>
                  <option value="error">Hata</option>
                  <option value="warning">Uyarı</option>
                  <option value="info">Bilgi</option>
                  <option value="system">Sistem</option>
                </select>
                
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tüm Öncelikler</option>
                  <option value="critical">Kritik</option>
                  <option value="high">Yüksek</option>
                  <option value="medium">Orta</option>
                  <option value="low">Düşük</option>
                </select>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="system">Sistem</option>
                  <option value="user">Kullanıcı</option>
                  <option value="business">İş</option>
                  <option value="security">Güvenlik</option>
                  <option value="performance">Performans</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Bildirim bulunamadı</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.map((notification) => {
                    const Icon = getTypeIcon(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        } ${getPriorityColor(notification.priority)}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                                <button
                                  onClick={() => archiveNotification(notification.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                  title="Arşivle"
                                >
                                  <Archive className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                  title="Sil"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>{getTimeAgo(notification.timestamp)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  notification.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                                  notification.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                                  notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                  'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                }`}>
                                  {notification.priority}
                                </span>
                              </div>
                              
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                >
                                  Okundu İşaretle
                                </button>
                              )}
                            </div>
                            
                            {/* Actions */}
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex items-center space-x-2 mt-3">
                                {notification.actions.map((action, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleAction(notification, action.action)}
                                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                  >
                                    {action.icon && <action.icon className="w-3 h-3 inline mr-1" />}
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{filteredNotifications.length} bildirim</span>
                <button
                  onClick={() => {/* Handle view all */}}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Tümünü Görüntüle
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Bildirim Ayarları
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Bildirimleri Etkinleştir</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.enabled ? 'transform translate-x-6' : 'transform translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ses</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {settings.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Masaüstü Bildirimleri</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, desktop: !prev.desktop }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.desktop ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.desktop ? 'transform translate-x-6' : 'transform translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Otomatik Arşivleme</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, autoArchive: !prev.autoArchive }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.autoArchive ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.autoArchive ? 'transform translate-x-6' : 'transform translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedNotificationSystem;
