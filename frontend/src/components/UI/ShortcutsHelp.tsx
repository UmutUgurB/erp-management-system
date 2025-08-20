'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Keyboard, 
  X, 
  Search, 
  Command, 
  Ctrl, 
  Shift, 
  Alt,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Save,
  Escape,
  Home,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  HelpCircle,
  Star,
  Zap,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  category: string;
  action: string;
  modifier?: 'ctrl' | 'cmd' | 'shift' | 'alt';
  icon?: React.ComponentType<any>;
  isGlobal?: boolean;
  isCustomizable?: boolean;
}

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  onShortcut?: (shortcut: Shortcut) => void;
}

const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({
  isOpen,
  onClose,
  className = '',
  onShortcut
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCustomize, setShowCustomize] = useState(false);

  const shortcuts: Shortcut[] = [
    // Navigation
    { key: 'G', description: 'Dashboard\'a git', category: 'navigation', action: 'Ana sayfaya yönlendir', icon: Home, isGlobal: true },
    { key: 'U', description: 'Kullanıcılar sayfasına git', category: 'navigation', action: 'Kullanıcılar listesini aç', icon: Users, isGlobal: true },
    { key: 'P', description: 'Ürünler sayfasına git', category: 'navigation', action: 'Ürün kataloğunu aç', icon: Package, isGlobal: true },
    { key: 'S', description: 'Siparişler sayfasına git', category: 'navigation', action: 'Sipariş listesini aç', icon: ShoppingCart, isGlobal: true },
    { key: 'A', description: 'Analitik sayfasına git', category: 'navigation', action: 'Analitik dashboard\'ını aç', icon: BarChart3, isGlobal: true },
    { key: 'C', description: 'Ayarlar sayfasına git', category: 'navigation', action: 'Sistem ayarlarını aç', icon: Settings, isGlobal: true },

    // Actions
    { key: 'N', description: 'Yeni öğe oluştur', category: 'actions', action: 'Yeni kayıt formu aç', modifier: 'ctrl', icon: Plus, isGlobal: true },
    { key: 'E', description: 'Düzenle', category: 'actions', action: 'Seçili öğeyi düzenle', modifier: 'ctrl', icon: Edit, isGlobal: true },
    { key: 'D', description: 'Sil', category: 'actions', action: 'Seçili öğeyi sil', modifier: 'ctrl', icon: Trash2, isGlobal: true },
    { key: 'S', description: 'Kaydet', category: 'actions', action: 'Değişiklikleri kaydet', modifier: 'ctrl', icon: Save, isGlobal: true },
    { key: 'R', description: 'Yenile', category: 'actions', action: 'Sayfa verilerini yenile', modifier: 'ctrl', icon: RefreshCw, isGlobal: true },

    // Search & Filter
    { key: 'F', description: 'Arama yap', category: 'search', action: 'Arama kutusunu odakla', modifier: 'ctrl', icon: Search, isGlobal: true },
    { key: 'F', description: 'Filtreleri temizle', category: 'search', action: 'Tüm filtreleri sıfırla', modifier: 'shift', icon: Filter, isGlobal: true },
    { key: 'S', description: 'Sıralama', category: 'search', action: 'Sıralama seçeneklerini aç', modifier: 'alt', icon: SortAsc, isGlobal: true },

    // Navigation
    { key: '↑', description: 'Yukarı git', category: 'navigation', action: 'Önceki öğeye git', icon: ArrowUp, isGlobal: true },
    { key: '↓', description: 'Aşağı git', category: 'navigation', action: 'Sonraki öğeye git', icon: ArrowDown, isGlobal: true },
    { key: '←', description: 'Sol git', category: 'navigation', action: 'Sol sekmeye git', icon: ArrowLeft, isGlobal: true },
    { key: '→', description: 'Sağ git', category: 'navigation', action: 'Sağ sekmeye git', icon: ArrowRight, isGlobal: true },

    // System
    { key: 'H', description: 'Yardım', category: 'system', action: 'Yardım modalını aç', modifier: 'ctrl', icon: HelpCircle, isGlobal: true },
    { key: 'ESC', description: 'Kapat', category: 'system', action: 'Modal/Form kapat', icon: Escape, isGlobal: true },
    { key: 'K', description: 'Hızlı işlemler', category: 'system', action: 'Hızlı işlemler menüsünü aç', modifier: 'ctrl', icon: Zap, isGlobal: true },

    // View
    { key: 'V', description: 'Görünüm değiştir', category: 'view', action: 'Liste/Grid görünümü arasında geçiş', modifier: 'ctrl', icon: Eye, isGlobal: true },
    { key: 'T', description: 'Tema değiştir', category: 'view', action: 'Açık/Koyu tema arasında geçiş', modifier: 'ctrl', icon: Star, isGlobal: true },

    // Import/Export
    { key: 'I', description: 'İçe aktar', category: 'data', action: 'Veri içe aktarma modalını aç', modifier: 'ctrl', icon: Upload, isGlobal: true },
    { key: 'O', description: 'Dışa aktar', category: 'data', action: 'Veri dışa aktarma modalını aç', modifier: 'ctrl', icon: Download, isGlobal: true },
  ];

  const categories = [
    { id: 'all', name: 'Tümü', icon: Keyboard, count: shortcuts.length },
    { id: 'navigation', name: 'Navigasyon', icon: ArrowUp, count: shortcuts.filter(s => s.category === 'navigation').length },
    { id: 'actions', name: 'İşlemler', icon: Plus, count: shortcuts.filter(s => s.category === 'actions').length },
    { id: 'search', name: 'Arama & Filtre', icon: Search, count: shortcuts.filter(s => s.category === 'search').length },
    { id: 'view', name: 'Görünüm', icon: Eye, count: shortcuts.filter(s => s.category === 'view').length },
    { id: 'data', name: 'Veri', icon: Download, count: shortcuts.filter(s => s.category === 'data').length },
    { id: 'system', name: 'Sistem', icon: Settings, count: shortcuts.filter(s => s.category === 'system').length },
  ];

  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shortcut.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const renderKey = (key: string, modifier?: string) => {
    return (
      <div className="flex items-center space-x-1">
        {modifier && (
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
            {modifier === 'ctrl' ? <Ctrl className="w-3 h-3" /> : 
             modifier === 'cmd' ? <Command className="w-3 h-3" /> : 
             modifier === 'shift' ? <Shift className="w-3 h-3" /> : 
             <Alt className="w-3 h-3" />}
          </kbd>
        )}
        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
          {key === '↑' ? <ArrowUp className="w-3 h-3" /> :
           key === '↓' ? <ArrowDown className="w-3 h-3" /> :
           key === '←' ? <ArrowLeft className="w-3 h-3" /> :
           key === '→' ? <ArrowRight className="w-3 h-3" /> :
           key === 'ESC' ? 'ESC' : key}
        </kbd>
      </div>
    );
  };

  const renderShortcutIcon = (shortcut: Shortcut) => {
    if (!shortcut.icon) return null;
    const Icon = shortcut.icon;
    return <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden ${className}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Keyboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Klavye Kısayolları
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hızlı navigasyon ve işlemler için kısayollar
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCustomize(!showCustomize)}
                className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Özelleştir
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kısayol ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shortcuts List */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="grid gap-4">
              {filteredShortcuts.map((shortcut, index) => (
                <motion.div
                  key={`${shortcut.key}-${shortcut.modifier}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => onShortcut?.(shortcut)}
                >
                  <div className="flex items-center space-x-3">
                    {renderShortcutIcon(shortcut)}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {shortcut.description}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {shortcut.action}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {shortcut.isGlobal && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                            Global
                          </span>
                        )}
                        {shortcut.isCustomizable && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            Özelleştirilebilir
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {renderKey(shortcut.key, shortcut.modifier)}
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredShortcuts.length === 0 && (
              <div className="text-center py-8">
                <Keyboard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Kısayol bulunamadı
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Toplam {filteredShortcuts.length} kısayol</span>
              <span>ESC tuşu ile kapat</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShortcutsHelp; 