'use client';

import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Settings,
  Plus,
  X,
  GripVertical,
  Eye,
  EyeOff
} from 'lucide-react';

interface Widget {
  id: string;
  type: 'chart' | 'stats' | 'table' | 'calendar' | 'custom';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: any;
  isVisible: boolean;
  isMinimized: boolean;
}

interface WidgetSystemProps {
  onWidgetChange?: (widgets: Widget[]) => void;
}

const WidgetSystem: React.FC<WidgetSystemProps> = ({ onWidgetChange }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null);

  // Default widget templates
  const widgetTemplates = [
    {
      type: 'stats' as const,
      title: 'Hızlı İstatistikler',
      size: 'medium' as const,
      config: { metrics: ['employees', 'projects', 'revenue'] }
    },
    {
      type: 'chart' as const,
      title: 'Aylık Performans',
      size: 'large' as const,
      config: { chartType: 'line', data: 'monthly_performance' }
    },
    {
      type: 'table' as const,
      title: 'Son Aktiviteler',
      size: 'medium' as const,
      config: { tableType: 'recent_activities', limit: 10 }
    },
    {
      type: 'calendar' as const,
      title: 'Etkinlik Takvimi',
      size: 'small' as const,
      config: { view: 'month', showEvents: true }
    }
  ];

  useEffect(() => {
    // Load saved widgets from localStorage
    const savedWidgets = localStorage.getItem('erp-dashboard-widgets');
    if (savedWidgets) {
      try {
        setWidgets(JSON.parse(savedWidgets));
      } catch (error) {
        console.error('Error loading widgets:', error);
      }
    } else {
      // Set default widgets
      setWidgets([
        {
          id: '1',
          type: 'stats',
          title: 'Genel Bakış',
          size: 'medium',
          position: { x: 0, y: 0 },
          config: { metrics: ['employees', 'projects'] },
          isVisible: true,
          isMinimized: false
        }
      ]);
    }
  }, []);

  useEffect(() => {
    // Save widgets to localStorage
    localStorage.setItem('erp-dashboard-widgets', JSON.stringify(widgets));
    onWidgetChange?.(widgets);
  }, [widgets, onWidgetChange]);

  const addWidget = (template: typeof widgetTemplates[0]) => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      ...template,
      position: { x: Math.random() * 100, y: Math.random() * 100 },
      config: { ...template.config },
      isVisible: true,
      isMinimized: false
    };
    setWidgets([...widgets, newWidget]);
    setShowWidgetPicker(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const toggleWidgetVisibility = (id: string) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, isVisible: !w.isVisible } : w
    ));
  };

  const toggleWidgetMinimize = (id: string) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  };

  const updateWidgetPosition = (id: string, position: { x: number; y: number }) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, position } : w
    ));
  };

  const renderWidget = (widget: Widget) => {
    if (!widget.isVisible) return null;

    const sizeClasses = {
      small: 'w-64 h-48',
      medium: 'w-80 h-64',
      large: 'w-96 h-80'
    };

    return (
      <motion.div
        key={widget.id}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`absolute ${sizeClasses[widget.size]} bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden`}
        style={{
          left: `${widget.position.x}%`,
          top: `${widget.position.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        drag={isEditing}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (isEditing) {
            const newX = Math.max(0, Math.min(100, widget.position.x + (info.offset.x / window.innerWidth) * 100));
            const newY = Math.max(0, Math.min(100, widget.position.y + (info.offset.y / window.innerHeight) * 100));
            updateWidgetPosition(widget.id, { x: newX, y: newY });
          }
        }}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-2">
            {isEditing && (
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            )}
            <h3 className="font-medium text-gray-900 dark:text-white">
              {widget.title}
            </h3>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => toggleWidgetMinimize(widget.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title={widget.isMinimized ? 'Genişlet' : 'Küçült'}
            >
              {widget.isMinimized ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            
            {isEditing && (
              <button
                onClick={() => removeWidget(widget.id)}
                className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                title="Kaldır"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Widget Content */}
        {!widget.isMinimized && (
          <div className="p-4">
            {renderWidgetContent(widget)}
          </div>
        )}
      </motion.div>
    );
  };

  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'stats':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Çalışan</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">12</div>
                <div className="text-sm text-green-600 dark:text-green-400">Proje</div>
              </div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {widget.config.chartType === 'line' ? 'Çizgi Grafik' : 'Sütun Grafik'}
              </p>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Son {widget.config.limit} aktivite
            </div>
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {widget.config.view === 'month' ? 'Aylık Görünüm' : 'Haftalık Görünüm'}
            </p>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Widget içeriği yükleniyor...
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Dashboard Widget'ları
          </h2>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {isEditing ? 'Düzenlemeyi Bitir' : 'Düzenle'}
            </button>
            
            <button
              onClick={() => setShowWidgetPicker(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Widget Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="relative w-full h-full p-4">
        {widgets.map(renderWidget)}
        
        {widgets.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Henüz widget eklenmemiş
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Dashboard'ınızı özelleştirmek için widget ekleyin
              </p>
              <button
                onClick={() => setShowWidgetPicker(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                İlk Widget'ı Ekle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Widget Picker Modal */}
      {showWidgetPicker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowWidgetPicker(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Widget Ekle
                </h3>
                <button
                  onClick={() => setShowWidgetPicker(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {widgetTemplates.map((template, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                    onClick={() => addWidget(template)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      {template.type === 'stats' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                      {template.type === 'chart' && <BarChart3 className="w-5 h-5 text-green-600" />}
                      {template.type === 'table' && <Users className="w-5 h-5 text-purple-600" />}
                      {template.type === 'calendar' && <Calendar className="w-5 h-5 text-orange-600" />}
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {template.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {template.size === 'small' ? 'Küçük' : 
                           template.size === 'medium' ? 'Orta' : 'Büyük'} boyut
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {template.type === 'stats' && 'Önemli metrikleri görüntüleyin'}
                      {template.type === 'chart' && 'Verileri grafik olarak analiz edin'}
                      {template.type === 'table' && 'Detaylı veri tablolarını inceleyin'}
                      {template.type === 'calendar' && 'Etkinlikleri ve tarihleri takip edin'}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default WidgetSystem;
