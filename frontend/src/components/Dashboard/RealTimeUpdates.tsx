'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Wifi,
  WifiOff,
  Server,
  Database,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Eye,
  EyeOff,
  Settings,
  Bell,
  Zap,
  Shield,
  BarChart3,
  X
} from 'lucide-react';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  lastUpdate: Date;
  trend: 'up' | 'down' | 'stable';
}

interface LiveActivity {
  id: string;
  type: 'user_login' | 'order_placed' | 'stock_update' | 'payment_received' | 'system_alert';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  icon: React.ComponentType<any>;
  metadata?: {
    userId?: string;
    entityId?: string;
    entityType?: string;
    [key: string]: any;
  };
}

interface RealTimeUpdatesProps {
  className?: string;
}

const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Mock system metrics
  useEffect(() => {
    const mockMetrics: SystemMetric[] = [
      {
        id: '1',
        name: 'CPU Kullanımı',
        value: 45,
        unit: '%',
        change: 2.3,
        changeType: 'increase',
        status: 'healthy',
        lastUpdate: new Date(),
        trend: 'up'
      },
      {
        id: '2',
        name: 'Bellek Kullanımı',
        value: 68,
        unit: '%',
        change: -1.2,
        changeType: 'decrease',
        status: 'healthy',
        lastUpdate: new Date(),
        trend: 'down'
      },
      {
        id: '3',
        name: 'Disk Kullanımı',
        value: 82,
        unit: '%',
        change: 0.8,
        changeType: 'increase',
        status: 'warning',
        lastUpdate: new Date(),
        trend: 'up'
      },
      {
        id: '4',
        name: 'Ağ Trafiği',
        value: 156,
        unit: 'MB/s',
        change: 12.5,
        changeType: 'increase',
        status: 'healthy',
        lastUpdate: new Date(),
        trend: 'up'
      },
      {
        id: '5',
        name: 'Aktif Kullanıcı',
        value: 23,
        unit: '',
        change: 3,
        changeType: 'increase',
        status: 'healthy',
        lastUpdate: new Date(),
        trend: 'up'
      },
      {
        id: '6',
        name: 'Veritabanı Bağlantıları',
        value: 18,
        unit: '',
        change: -2,
        changeType: 'decrease',
        status: 'healthy',
        lastUpdate: new Date(),
        trend: 'down'
      }
    ];

    setMetrics(mockMetrics);
  }, []);

  // Mock live activities
  useEffect(() => {
    const mockActivities: LiveActivity[] = [
      {
        id: '1',
        type: 'user_login',
        title: 'Yeni Kullanıcı Girişi',
        description: 'Ahmet Yılmaz sisteme giriş yaptı',
        timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
        priority: 'low',
        icon: Users,
        metadata: { userId: 'user_123' }
      },
      {
        id: '2',
        type: 'order_placed',
        title: 'Yeni Sipariş',
        description: 'Sipariş #ORD-2024-001 oluşturuldu',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        priority: 'medium',
        icon: ShoppingCart,
        metadata: { entityId: 'order_001', entityType: 'order' }
      },
      {
        id: '3',
        type: 'stock_update',
        title: 'Stok Güncellendi',
        description: 'Laptop Dell XPS 13 stok seviyesi güncellendi',
        timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
        priority: 'medium',
        icon: Package,
        metadata: { entityId: 'prod_456', entityType: 'product' }
      },
      {
        id: '4',
        type: 'payment_received',
        title: 'Ödeme Alındı',
        description: '₺2,500 ödeme başarıyla alındı',
        timestamp: new Date(Date.now() - 1000 * 60 * 12), // 12 minutes ago
        priority: 'high',
        icon: DollarSign,
        metadata: { entityId: 'payment_789', entityType: 'payment' }
      },
      {
        id: '5',
        type: 'system_alert',
        title: 'Sistem Uyarısı',
        description: 'Disk kullanımı %80\'i aştı',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        priority: 'high',
        icon: AlertCircle,
        metadata: { entityType: 'system' }
      }
    ];

    setActivities(mockActivities);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const updateMetrics = () => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 5)),
        change: Math.max(-10, Math.min(10, metric.change + (Math.random() - 0.5) * 2)),
        lastUpdate: new Date(),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      })));
    };

    const addActivity = () => {
      const activityTypes: LiveActivity['type'][] = ['user_login', 'order_placed', 'stock_update', 'payment_received', 'system_alert'];
      const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      
      const newActivity: LiveActivity = {
        id: Date.now().toString(),
        type: randomType,
        title: `Yeni ${randomType.replace('_', ' ')}`,
        description: `Otomatik olarak oluşturulan aktivite - ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(),
        priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        icon: getActivityIcon(randomType),
        metadata: {}
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only last 10
    };

    intervalRef.current = setInterval(() => {
      updateMetrics();
      if (Math.random() > 0.7) { // 30% chance to add new activity
        addActivity();
      }
      setLastUpdate(new Date());
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_login': return Users;
      case 'order_placed': return ShoppingCart;
      case 'stock_update': return Package;
      case 'payment_received': return DollarSign;
      case 'system_alert': return AlertCircle;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/10';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor(diff / 1000);

    if (minutes < 1) return `${seconds} saniye önce`;
    if (minutes < 60) return `${minutes} dakika önce`;
    return `${Math.floor(minutes / 60)} saat önce`;
  };

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdate(new Date());
    }, 1000);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gerçek Zamanlı Güncellemeler
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sistem durumu ve canlı aktiviteler
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Bağlı' : 'Bağlantı Yok'}</span>
          </div>
          
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            title="Ayarlar"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const TrendIcon = getTrendIcon(metric.trend);
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metric.name}
                </h3>
                <div className={`p-1 rounded-full text-xs ${getStatusColor(metric.status)}`}>
                  {metric.status === 'healthy' && <CheckCircle className="w-3 h-3" />}
                  {metric.status === 'warning' && <AlertCircle className="w-3 h-3" />}
                  {metric.status === 'critical' && <AlertCircle className="w-3 h-3" />}
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value.toFixed(1)}{metric.unit}
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendIcon className={`w-4 h-4 ${getTrendColor(metric.trend)}`} />
                    <span className={getTrendColor(metric.trend)}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  <div>Son güncelleme</div>
                  <div>{getTimeAgo(metric.lastUpdate)}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Live Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Canlı Aktiviteler
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleAutoRefresh}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  autoRefresh 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {autoRefresh ? 'Otomatik Açık' : 'Otomatik Kapalı'}
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Son güncelleme: {getTimeAgo(lastUpdate)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${getPriorityColor(activity.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activity.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                          activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        }`}>
                          {activity.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{getTimeAgo(activity.timestamp)}</span>
                        </div>
                        
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <button className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                            Detaylar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

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
                  Gerçek Zamanlı Ayarlar
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
                  <span className="text-sm text-gray-700 dark:text-gray-300">Otomatik Yenileme</span>
                  <button
                    onClick={toggleAutoRefresh}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      autoRefresh ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      autoRefresh ? 'transform translate-x-6' : 'transform translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Yenileme Aralığı (saniye)
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="30000"
                    step="1000"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {refreshInterval / 1000} saniye
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealTimeUpdates;
