import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, User, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  user?: string;
  status: 'completed' | 'in-progress' | 'pending' | 'cancelled';
  category: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  details?: {
    key: string;
    value: string;
  }[];
}

interface InteractiveTimelineProps {
  items: TimelineItem[];
  showFilters?: boolean;
  showSearch?: boolean;
  maxItems?: number;
  className?: string;
  onItemClick?: (item: TimelineItem) => void;
  onStatusChange?: (itemId: string, status: TimelineItem['status']) => void;
}

const statusColors = {
  completed: 'bg-green-500 text-white',
  'in-progress': 'bg-blue-500 text-white',
  pending: 'bg-yellow-500 text-white',
  cancelled: 'bg-red-500 text-white'
};

const statusLabels = {
  completed: 'Tamamlandı',
  'in-progress': 'Devam Ediyor',
  pending: 'Bekliyor',
  cancelled: 'İptal'
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const priorityLabels = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek'
};

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({
  items,
  showFilters = true,
  showSearch = true,
  maxItems = 10,
  className,
  onItemClick,
  onStatusChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];
  const statuses = ['all', ...Array.from(new Set(items.map(item => item.status)))];

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          const statusOrder = { 'in-progress': 3, pending: 2, completed: 1, cancelled: 0 };
          return statusOrder[b.status] - statusOrder[a.status];
        default:
          return 0;
      }
    })
    .slice(0, maxItems);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleStatusChange = (itemId: string, newStatus: TimelineItem['status']) => {
    if (onStatusChange) {
      onStatusChange(itemId, newStatus);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Header with filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            {showSearch && (
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Timeline'da ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Tüm Kategoriler' : category}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'Tüm Durumlar' : statusLabels[status as keyof typeof statusLabels]}
                </option>
              ))}
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'status')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Tarihe Göre</option>
              <option value="priority">Önceliğe Göre</option>
              <option value="status">Duruma Göre</option>
            </select>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Timeline dot */}
              <div className="absolute left-6 top-6 w-3 h-3 bg-white border-2 border-gray-300 rounded-full transform -translate-x-1/2 z-10" />
              
              {/* Status indicator */}
              <div className={cn(
                'absolute left-6 top-6 w-3 h-3 rounded-full transform -translate-x-1/2 z-20',
                statusColors[item.status]
              )} />

              {/* Content */}
              <div className="ml-12">
                <motion.div
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onItemClick?.(item)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {/* Priority badge */}
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        priorityColors[item.priority]
                      )}>
                        {priorityLabels[item.priority]}
                      </span>
                      
                      {/* Status badge */}
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        statusColors[item.status]
                      )}>
                        {statusLabels[item.status]}
                      </span>
                      
                      {/* Expand button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(item.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Meta information */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(item.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    
                    {item.time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{item.time}</span>
                      </div>
                    )}
                    
                    {item.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{item.location}</span>
                      </div>
                    )}
                    
                    {item.user && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{item.user}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedItems.has(item.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 pt-3 mt-3"
                      >
                        {/* Details */}
                        {item.details && item.details.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            {item.details.map((detail, detailIndex) => (
                              <div key={detailIndex}>
                                <span className="text-xs font-medium text-gray-500 uppercase">
                                  {detail.key}:
                                </span>
                                <p className="text-sm text-gray-700">{detail.value}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Status change buttons */}
                        {onStatusChange && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Durum değiştir:</span>
                            {Object.entries(statusLabels).map(([status, label]) => (
                              <button
                                key={status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(item.id, status as TimelineItem['status']);
                                }}
                                className={cn(
                                  'px-2 py-1 text-xs rounded border transition-colors',
                                  item.status === status
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                )}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No results message */}
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Filtrelere uygun timeline öğesi bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};
