'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  User, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Info,
  MoreHorizontal,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'user' | 'product' | 'order' | 'customer' | 'system' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  icon?: React.ComponentType<any>;
  metadata?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface ActivityTimelineProps {
  activities: Activity[];
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showFilters?: boolean;
  maxItems?: number;
  onActivityClick?: (activity: Activity) => void;
  onFilterChange?: (filters: ActivityFilters) => void;
}

interface ActivityFilters {
  types: string[];
  priorities: string[];
  dateRange: 'all' | 'today' | 'week' | 'month';
  searchQuery: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  className = '',
  variant = 'default',
  showFilters = true,
  maxItems = 50,
  onActivityClick,
  onFilterChange
}) => {
  const [filters, setFilters] = useState<ActivityFilters>({
    types: [],
    priorities: [],
    dateRange: 'all',
    searchQuery: ''
  });
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  const getTypeIcon = (type: Activity['type']) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'order':
        return <ShoppingCart className="w-4 h-4" />;
      case 'customer':
        return <Users className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'product':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'order':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'customer':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'system':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'success':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'info':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: Activity['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low':
        return 'border-green-500 bg-green-50 dark:bg-green-900/10';
      default:
        return 'border-gray-300 dark:border-gray-600';
    }
  };

  const getPriorityIcon = (priority: Activity['priority']) => {
    switch (priority) {
      case 'critical':
        return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'high':
        return <TrendingUp className="w-3 h-3 text-orange-500" />;
      case 'medium':
        return <TrendingDown className="w-3 h-3 text-yellow-500" />;
      case 'low':
        return <TrendingDown className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    
    return timestamp.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredActivities = activities
    .filter(activity => {
      if (filters.types.length > 0 && !filters.types.includes(activity.type)) return false;
      if (filters.priorities.length > 0 && !filters.priorities.includes(activity.priority || '')) return false;
      if (filters.searchQuery && !activity.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) && 
          !activity.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const activityDate = new Date(activity.timestamp);
        
        switch (filters.dateRange) {
          case 'today':
            return activityDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return activityDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return activityDate >= monthAgo;
        }
      }
      
      return true;
    })
    .slice(0, maxItems);

  const handleFilterChange = (newFilters: Partial<ActivityFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const toggleActivityExpansion = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  const renderActivity = (activity: Activity, index: number) => (
    <motion.div
      key={activity.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative ${variant === 'compact' ? 'py-2' : 'py-4'}`}
    >
      {/* Timeline Line */}
      {index < filteredActivities.length - 1 && (
        <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      )}

      {/* Activity Content */}
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(activity.type)}`}>
          {activity.icon ? <activity.icon className="w-5 h-5" /> : getTypeIcon(activity.type)}
        </div>

        {/* Content */}
        <div className={`flex-1 min-w-0 ${getPriorityColor(activity.priority)} border-l-4 pl-4 py-2 rounded-r-lg`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </h3>
                {activity.priority && getPriorityIcon(activity.priority)}
              </div>
              
              <p className={`text-sm text-gray-600 dark:text-gray-400 ${variant === 'compact' ? 'line-clamp-1' : ''}`}>
                {activity.description}
              </p>

              {/* Metadata */}
              {variant === 'detailed' && activity.metadata && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <span key={key} className="inline-block mr-3">
                      <strong>{key}:</strong> {String(value)}
                    </span>
                  ))}
                </div>
              )}

              {/* User Info */}
              {activity.user && (
                <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-500">
                  <User className="w-3 h-3" />
                  <span>{activity.user}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {formatTimestamp(activity.timestamp)}
              </span>
              
              {variant === 'detailed' && (
                <button
                  onClick={() => toggleActivityExpansion(activity.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {expandedActivities.has(activity.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Detay:</strong> {activity.description}</p>
                  {activity.metadata && (
                    <div className="mt-2">
                      <strong>Ek Bilgiler:</strong>
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Aktivite Zaman Çizelgesi
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              ({filteredActivities.length} aktivite)
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Aktivite ara..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filters.types[0] || ''}
              onChange={(e) => handleFilterChange({ types: e.target.value ? [e.target.value] : [] })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Tüm Tipler</option>
              <option value="user">Kullanıcı</option>
              <option value="product">Ürün</option>
              <option value="order">Sipariş</option>
              <option value="customer">Müşteri</option>
              <option value="system">Sistem</option>
              <option value="warning">Uyarı</option>
              <option value="success">Başarı</option>
              <option value="info">Bilgi</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priorities[0] || ''}
              onChange={(e) => handleFilterChange({ priorities: e.target.value ? [e.target.value] : [] })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Tüm Öncelikler</option>
              <option value="critical">Kritik</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange({ dateRange: e.target.value as ActivityFilters['dateRange'] })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tüm Zamanlar</option>
              <option value="today">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
            </select>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="px-6 py-4">
        {filteredActivities.length > 0 ? (
          <div className="space-y-0">
            {filteredActivities.map((activity, index) => renderActivity(activity, index))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aktivite bulunamadı
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
