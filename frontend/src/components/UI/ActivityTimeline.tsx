'use client';

import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText,
  Star,
  Zap
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'highlight';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  category: 'sales' | 'inventory' | 'customers' | 'system' | 'general';
  priority: 'low' | 'medium' | 'high';
}

interface ActivityTimelineProps {
  className?: string;
  maxItems?: number;
}

export default function ActivityTimeline({ className = '', maxItems = 8 }: ActivityTimelineProps) {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'success',
      title: 'Yeni Sipariş Alındı',
      description: 'ABC Şirketi\'nden 15,000 TL değerinde sipariş alındı',
      time: '2 dakika önce',
      icon: <ShoppingCart className="w-4 h-4" />,
      category: 'sales',
      priority: 'high'
    },
    {
      id: '2',
      type: 'highlight',
      title: 'Stok Uyarısı',
      description: 'Ürün "XYZ-123" stok seviyesi kritik seviyede',
      time: '15 dakika önce',
      icon: <Package className="w-4 h-4" />,
      category: 'inventory',
      priority: 'high'
    },
    {
      id: '3',
      type: 'info',
      title: 'Yeni Müşteri Kaydı',
      description: 'DEF Ltd. şirketi sisteme kaydedildi',
      time: '1 saat önce',
      icon: <Users className="w-4 h-4" />,
      category: 'customers',
      priority: 'medium'
    },
    {
      id: '4',
      type: 'success',
      title: 'Fatura Oluşturuldu',
      description: 'GHI Şirketi için fatura #2024-001 oluşturuldu',
      time: '2 saat önce',
      icon: <FileText className="w-4 h-4" />,
      category: 'sales',
      priority: 'medium'
    },
    {
      id: '5',
      type: 'warning',
      title: 'Sistem Yedekleme',
      description: 'Günlük sistem yedeklemesi başlatıldı',
      time: '3 saat önce',
      icon: <Clock className="w-4 h-4" />,
      category: 'system',
      priority: 'low'
    },
    {
      id: '6',
      type: 'success',
      title: 'Performans Artışı',
      description: 'Bu ay satış performansı %25 arttı',
      time: '5 saat önce',
      icon: <TrendingUp className="w-4 h-4" />,
      category: 'general',
      priority: 'high'
    },
    {
      id: '7',
      type: 'info',
      title: 'Güncelleme Tamamlandı',
      description: 'Sistem güncellemesi başarıyla tamamlandı',
      time: '1 gün önce',
      icon: <Zap className="w-4 h-4" />,
      category: 'system',
      priority: 'medium'
    },
    {
      id: '8',
      type: 'highlight',
      title: 'Müşteri Memnuniyeti',
      description: 'Müşteri memnuniyet skoru %95\'e ulaştı',
      time: '1 gün önce',
      icon: <Star className="w-4 h-4" />,
      category: 'customers',
      priority: 'high'
    }
  ];

  const getTypeStyles = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'highlight':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getPriorityColor = (priority: ActivityItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getCategoryIcon = (category: ActivityItem['category']) => {
    switch (category) {
      case 'sales':
        return <ShoppingCart className="w-3 h-3 text-blue-500" />;
      case 'inventory':
        return <Package className="w-3 h-3 text-green-500" />;
      case 'customers':
        return <Users className="w-3 h-3 text-purple-500" />;
      case 'system':
        return <Zap className="w-3 h-3 text-yellow-500" />;
      case 'general':
        return <Star className="w-3 h-3 text-indigo-500" />;
      default:
        return <Info className="w-3 h-3 text-gray-500" />;
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Aktivite Zaman Çizelgesi
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Son {maxItems} aktivite
              </p>
            </div>
          </div>
          
          <motion.button
            className="px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Tümünü Gör
          </motion.button>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="space-y-4">
          {displayedActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`relative pl-6 border-l-2 ${getPriorityColor(activity.priority)} hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-r-lg transition-all duration-200 group`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-0 top-2 w-3 h-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full transform -translate-x-1.5 group-hover:scale-125 transition-transform duration-200" />
              
              {/* Activity Content */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg border ${getTypeStyles(activity.type)}`}>
                      {activity.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(activity.category)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </span>
                  </div>
                </div>
                
                {/* Priority Badge */}
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.priority === 'high' 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' 
                      : activity.priority === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  }`}>
                    {activity.priority === 'high' ? 'Yüksek' : activity.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Empty State */}
        {displayedActivities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Henüz aktivite bulunmuyor</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
