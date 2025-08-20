'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Keyboard, 
  X, 
  Search, 
  Home, 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Command,
  Ctrl,
  Shift,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Save,
  Escape
} from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  category: string;
  action: string;
  modifier?: 'ctrl' | 'cmd' | 'shift' | 'alt';
  icon?: React.ComponentType<any>;
}

interface KeyboardShortcutsProps {
  className?: string;
  showHelpButton?: boolean;
  onShortcut?: (shortcut: Shortcut) => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  className = '',
  showHelpButton = true,
  onShortcut
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const shortcuts: Shortcut[] = [
    // Navigation
    { key: 'G', description: 'Dashboard\'a git', category: 'navigation', action: 'Ana sayfaya yönlendir', icon: Home },
    { key: 'U', description: 'Kullanıcılar sayfasına git', category: 'navigation', action: 'Kullanıcılar listesini aç', icon: Users },
    { key: 'P', description: 'Ürünler sayfasına git', category: 'navigation', action: 'Ürün kataloğunu aç', icon: Package },
    { key: 'S', description: 'Siparişler sayfasına git', category: 'navigation', action: 'Sipariş listesini aç', icon: ShoppingCart },
    { key: 'A', description: 'Analitik sayfasına git', category: 'navigation', action: 'Analitik dashboard\'ını aç', icon: BarChart3 },
    { key: 'C', description: 'Ayarlar sayfasına git', category: 'navigation', action: 'Sistem ayarlarını aç', icon: Settings },

    // Actions
    { key: 'N', description: 'Yeni öğe oluştur', category: 'actions', action: 'Yeni kayıt formu aç', modifier: 'ctrl', icon: Plus },
    { key: 'E', description: 'Düzenle', category: 'actions', action: 'Seçili öğeyi düzenle', modifier: 'ctrl', icon: Edit },
    { key: 'D', description: 'Sil', category: 'actions', action: 'Seçili öğeyi sil', modifier: 'ctrl', icon: Trash2 },
    { key: 'S', description: 'Kaydet', category: 'actions', action: 'Değişiklikleri kaydet', modifier: 'ctrl', icon: Save },

    // Search & Filter
    { key: 'F', description: 'Arama yap', category: 'search', action: 'Arama kutusunu odakla', modifier: 'ctrl' },
    { key: 'F', description: 'Filtreleri temizle', category: 'search', action: 'Tüm filtreleri sıfırla', modifier: 'shift' },

    // Navigation
    { key: '↑', description: 'Yukarı git', category: 'navigation', action: 'Önceki öğeye git', icon: ArrowUp },
    { key: '↓', description: 'Aşağı git', category: 'navigation', action: 'Sonraki öğeye git', icon: ArrowDown },
    { key: '←', description: 'Sol git', category: 'navigation', action: 'Sol sekmeye git', icon: ArrowLeft },
    { key: '→', description: 'Sağ git', category: 'navigation', action: 'Sağ sekmeye git', icon: ArrowRight },

    // System
    { key: 'H', description: 'Yardım', category: 'system', action: 'Yardım modalını aç', modifier: 'ctrl', icon: HelpCircle },
    { key: 'ESC', description: 'Kapat', category: 'system', action: 'Modal/Form kapat', icon: Escape },
  ];

  const categories = [
    { id: 'all', name: 'Tümü', count: shortcuts.length },
    { id: 'navigation', name: 'Navigasyon', count: shortcuts.filter(s => s.category === 'navigation').length },
    { id: 'actions', name: 'İşlemler', count: shortcuts.filter(s => s.category === 'actions').length },
    { id: 'search', name: 'Arama & Filtre', count: shortcuts.filter(s => s.category === 'search').length },
    { id: 'system', name: 'Sistem', count: shortcuts.filter(s => s.category === 'system').length },
  ];

  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shortcut.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Check for Ctrl/Cmd + K (help)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      setIsHelpOpen(true);
    }

    // Check for Ctrl/Cmd + N (new)
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      const shortcut = shortcuts.find(s => s.key === 'N' && s.modifier === 'ctrl');
      if (shortcut) onShortcut?.(shortcut);
    }

    // Check for Ctrl/Cmd + F (search)
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      const shortcut = shortcuts.find(s => s.key === 'F' && s.modifier === 'ctrl');
      if (shortcut) onShortcut?.(shortcut);
    }

    // Check for Escape
    if (event.key === 'Escape') {
      if (isHelpOpen) {
        setIsHelpOpen(false);
      }
    }
  }, [isHelpOpen, shortcuts, onShortcut]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const renderKey = (key: string, modifier?: string) => {
    const isModifier = modifier === 'ctrl' || modifier === 'cmd' || modifier === 'shift' || modifier === 'alt';
    
    return (
      <div className="flex items-center space-x-1">
        {modifier && (
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
            {modifier === 'ctrl' ? <Ctrl className="w-3 h-3" /> : 
             modifier === 'cmd' ? <Command className="w-3 h-3" /> : 
             modifier === 'shift' ? <Shift className="w-3 h-3" /> : 
             'Alt'}
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

  return (
    <>
      {/* Help Button */}
      {showHelpButton && (
        <button
          onClick={() => setIsHelpOpen(true)}
          className={`p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors ${className}`}
          title="Klavye kısayolları (Ctrl+K)"
        >
          <Keyboard className="w-5 h-5" />
        </button>
      )}

      {/* Help Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
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
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
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
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KeyboardShortcuts;
