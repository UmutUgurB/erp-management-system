'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Keyboard, 
  X, 
  Search, 
  Zap, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Command,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  RotateCcw,
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Bell,
  Mail,
  Calendar,
  Clock,
  Star,
  Heart,
  Bookmark,
  Share2,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface Shortcut {
  id: string;
  category: 'navigation' | 'actions' | 'editing' | 'view' | 'system' | 'custom';
  title: string;
  description: string;
  keys: string[];
  icon: React.ReactNode;
  isGlobal?: boolean;
  isCustomizable?: boolean;
}

interface KeyboardShortcutsProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function KeyboardShortcuts({ 
  className = '', 
  isOpen = false, 
  onClose 
}: KeyboardShortcutsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCustomize, setShowCustomize] = useState(false);
  const [customShortcuts, setCustomShortcuts] = useState<Shortcut[]>([]);

  const shortcuts: Shortcut[] = [
    // Navigation
    {
      id: 'navigate-dashboard',
      category: 'navigation',
      title: 'Dashboard\'a Git',
      description: 'Ana dashboard sayfasına hızlı erişim',
      keys: ['Ctrl', 'Shift', 'D'],
      icon: <BarChart3 className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'navigate-customers',
      category: 'navigation',
      title: 'Müşteriler Sayfası',
      description: 'Müşteri yönetimi sayfasına git',
      keys: ['Ctrl', 'Shift', 'C'],
      icon: <Users className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'navigate-products',
      category: 'navigation',
      title: 'Ürünler Sayfası',
      description: 'Ürün kataloğu sayfasına git',
      keys: ['Ctrl', 'Shift', 'P'],
      icon: <Package className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'navigate-orders',
      category: 'navigation',
      title: 'Siparişler Sayfası',
      description: 'Sipariş yönetimi sayfasına git',
      keys: ['Ctrl', 'Shift', 'O'],
      icon: <ShoppingCart className="w-4 h-4" />,
      isGlobal: true
    },

    // Actions
    {
      id: 'quick-actions',
      category: 'actions',
      title: 'Hızlı İşlemler',
      description: 'Hızlı işlemler menüsünü aç',
      keys: ['Ctrl', 'K'],
      icon: <Zap className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'new-item',
      category: 'actions',
      title: 'Yeni Öğe Ekle',
      description: 'Mevcut sayfada yeni öğe oluştur',
      keys: ['Ctrl', 'N'],
      icon: <Plus className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'save',
      category: 'actions',
      title: 'Kaydet',
      description: 'Mevcut değişiklikleri kaydet',
      keys: ['Ctrl', 'S'],
      icon: <Save className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'refresh',
      category: 'actions',
      title: 'Yenile',
      description: 'Sayfa verilerini yenile',
      keys: ['F5'],
      icon: <RotateCcw className="w-4 h-4" />,
      isGlobal: true
    },

    // Editing
    {
      id: 'undo',
      category: 'editing',
      title: 'Geri Al',
      description: 'Son işlemi geri al',
      keys: ['Ctrl', 'Z'],
      icon: <ArrowLeft className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'redo',
      category: 'editing',
      title: 'Yinele',
      description: 'Geri alınan işlemi yinele',
      keys: ['Ctrl', 'Y'],
      icon: <ArrowRight className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'copy',
      category: 'editing',
      title: 'Kopyala',
      description: 'Seçili öğeyi kopyala',
      keys: ['Ctrl', 'C'],
      icon: <Copy className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'paste',
      category: 'editing',
      title: 'Yapıştır',
      description: 'Kopyalanan öğeyi yapıştır',
      keys: ['Ctrl', 'V'],
      icon: <Clipboard className="w-4 h-4" />,
      isGlobal: true
    },

    // View
    {
      id: 'toggle-sidebar',
      category: 'view',
      title: 'Kenar Çubuğunu Aç/Kapat',
      description: 'Sol kenar çubuğunu gizle/göster',
      keys: ['Ctrl', 'B'],
      icon: <Eye className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'toggle-theme',
      category: 'view',
      title: 'Tema Değiştir',
      description: 'Açık/koyu tema arasında geçiş',
      keys: ['Ctrl', 'T'],
      icon: <Sun className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'fullscreen',
      category: 'view',
      title: 'Tam Ekran',
      description: 'Tam ekran moduna geç',
      keys: ['F11'],
      icon: <Maximize className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'zoom-in',
      category: 'view',
      title: 'Yakınlaştır',
      description: 'Sayfa içeriğini yakınlaştır',
      keys: ['Ctrl', '+'],
      icon: <Plus className="w-4 h-4" />,
      isGlobal: true
    },

    // System
    {
      id: 'settings',
      category: 'system',
      title: 'Ayarlar',
      description: 'Sistem ayarlarını aç',
      keys: ['Ctrl', ','],
      icon: <Settings className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'help',
      category: 'system',
      title: 'Yardım',
      description: 'Yardım ve destek sayfasını aç',
      keys: ['F1'],
      icon: <HelpCircle className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'notifications',
      category: 'system',
      title: 'Bildirimler',
      description: 'Bildirim panelini aç/kapat',
      keys: ['Ctrl', 'N'],
      icon: <Bell className="w-4 h-4" />,
      isGlobal: true
    },
    {
      id: 'search',
      category: 'system',
      title: 'Arama',
      description: 'Genel arama yap',
      keys: ['Ctrl', 'F'],
      icon: <Search className="w-4 h-4" />,
      isGlobal: true
    }
  ];

  const categories = [
    { id: 'all', label: 'Tümü', icon: <Keyboard className="w-4 h-4" /> },
    { id: 'navigation', label: 'Navigasyon', icon: <ArrowUp className="w-4 h-4" /> },
    { id: 'actions', label: 'İşlemler', icon: <Zap className="w-4 h-4" /> },
    { id: 'editing', label: 'Düzenleme', icon: <Edit className="w-4 h-4" /> },
    { id: 'view', label: 'Görünüm', icon: <Eye className="w-4 h-4" /> },
    { id: 'system', label: 'Sistem', icon: <Settings className="w-4 h-4" /> },
    { id: 'custom', label: 'Özel', icon: <Star className="w-4 h-4" /> }
  ];

  // Filter shortcuts based on search and category
  const filteredShortcuts = [...shortcuts, ...customShortcuts].filter(shortcut => {
    const matchesSearch = shortcut.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shortcut.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close on Escape
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
      
      // Prevent default for common shortcuts when panel is open
      if (isOpen) {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const renderKey = (key: string) => {
    const isSpecialKey = ['Ctrl', 'Shift', 'Alt', 'Cmd', 'Enter', 'Space', 'Tab', 'Escape'].includes(key);
    
    return (
      <kbd
        key={key}
        className={`inline-flex items-center justify-center px-2 py-1 text-xs font-mono rounded ${
          isSpecialKey
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm'
        } min-w-[2rem]`}
      >
        {key}
      </kbd>
    );
  };

  const handleCustomizeShortcut = (shortcut: Shortcut) => {
    // In real app, this would open a customization modal
    console.log('Customize shortcut:', shortcut);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <Keyboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Klavye Kısayolları
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Hızlı erişim için klavye kısayollarını kullanın
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => setShowCustomize(!showCustomize)}
                className="px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Özelleştir
              </motion.button>
              
              {onClose && (
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Kısayol ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-1 mt-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredShortcuts.length > 0 ? (
            <div className="grid gap-4">
              {filteredShortcuts.map((shortcut) => (
                <motion.div
                  key={shortcut.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {shortcut.icon}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {shortcut.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {shortcut.description}
                      </p>
                      {shortcut.isGlobal && (
                        <span className="inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                          Global
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {shortcut.keys.map((key, index) => (
                        <div key={index} className="flex items-center">
                          {renderKey(key)}
                          {index < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-gray-400">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {shortcut.isCustomizable && (
                      <motion.button
                        onClick={() => handleCustomizeShortcut(shortcut)}
                        className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Özelleştir"
                      >
                        <Settings className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Keyboard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                "{searchQuery}" için kısayol bulunamadı
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Farklı bir arama terimi deneyin
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Toplam {filteredShortcuts.length} kısayol</span>
            <span>ESC tuşu ile kapat</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Missing icon components
const Copy = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const Clipboard = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const Maximize = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

const Edit = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
