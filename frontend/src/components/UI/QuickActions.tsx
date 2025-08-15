'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Download, 
  Upload, 
  Share2, 
  Bookmark, 
  Star, 
  Zap, 
  ChevronDown,
  Search,
  Calendar,
  Bell,
  Mail,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  shortcut?: string;
  category: 'main' | 'reports' | 'tools' | 'help';
}

interface QuickActionsProps {
  className?: string;
}

export default function QuickActions({ className = '' }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const quickActions: QuickAction[] = [
    // Main Actions
    {
      id: 'new-order',
      label: 'Yeni Sipariş',
      description: 'Hızlı sipariş oluştur',
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      action: () => console.log('Yeni sipariş oluşturuluyor...'),
      shortcut: 'Ctrl + O',
      category: 'main'
    },
    {
      id: 'new-customer',
      label: 'Yeni Müşteri',
      description: 'Müşteri kaydı ekle',
      icon: <Users className="w-5 h-5" />,
      color: 'from-green-500 to-green-600',
      action: () => console.log('Yeni müşteri ekleniyor...'),
      shortcut: 'Ctrl + C',
      category: 'main'
    },
    {
      id: 'new-product',
      label: 'Yeni Ürün',
      description: 'Ürün kataloğuna ekle',
      icon: <Package className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      action: () => console.log('Yeni ürün ekleniyor...'),
      shortcut: 'Ctrl + P',
      category: 'main'
    },
    {
      id: 'new-invoice',
      label: 'Yeni Fatura',
      description: 'Fatura oluştur',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-orange-500 to-orange-600',
      action: () => console.log('Yeni fatura oluşturuluyor...'),
      shortcut: 'Ctrl + I',
      category: 'main'
    },

    // Reports
    {
      id: 'sales-report',
      label: 'Satış Raporu',
      description: 'Satış performansını analiz et',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-red-500 to-red-600',
      action: () => console.log('Satış raporu açılıyor...'),
      shortcut: 'Ctrl + R',
      category: 'reports'
    },
    {
      id: 'inventory-report',
      label: 'Stok Raporu',
      description: 'Envanter durumunu kontrol et',
      icon: <Package className="w-5 h-5" />,
      color: 'from-indigo-500 to-indigo-600',
      action: () => console.log('Stok raporu açılıyor...'),
      shortcut: 'Ctrl + S',
      category: 'reports'
    },
    {
      id: 'customer-report',
      label: 'Müşteri Raporu',
      description: 'Müşteri analizini görüntüle',
      icon: <Users className="w-5 h-5" />,
      color: 'from-teal-500 to-teal-600',
      action: () => console.log('Müşteri raporu açılıyor...'),
      shortcut: 'Ctrl + M',
      category: 'reports'
    },

    // Tools
    {
      id: 'import-data',
      label: 'Veri İçe Aktar',
      description: 'CSV/Excel dosyasından veri yükle',
      icon: <Upload className="w-5 h-5" />,
      color: 'from-emerald-500 to-emerald-600',
      action: () => console.log('Veri içe aktarma başlatılıyor...'),
      shortcut: 'Ctrl + U',
      category: 'tools'
    },
    {
      id: 'export-data',
      label: 'Veri Dışa Aktar',
      description: 'Verileri CSV/Excel olarak indir',
      icon: <Download className="w-5 h-5" />,
      color: 'from-cyan-500 to-cyan-600',
      action: () => console.log('Veri dışa aktarma başlatılıyor...'),
      shortcut: 'Ctrl + E',
      category: 'tools'
    },
    {
      id: 'backup',
      label: 'Yedekleme',
      description: 'Sistem yedeği oluştur',
      icon: <Bookmark className="w-5 h-5" />,
      color: 'from-amber-500 to-amber-600',
      action: () => console.log('Yedekleme başlatılıyor...'),
      shortcut: 'Ctrl + B',
      category: 'tools'
    },

    // Help
    {
      id: 'help',
      label: 'Yardım',
      description: 'Kullanım kılavuzu ve destek',
      icon: <HelpCircle className="w-5 h-5" />,
      color: 'from-gray-500 to-gray-600',
      action: () => console.log('Yardım açılıyor...'),
      shortcut: 'F1',
      category: 'help'
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      description: 'Sistem ayarlarını düzenle',
      icon: <Settings className="w-5 h-5" />,
      color: 'from-slate-500 to-slate-600',
      action: () => console.log('Ayarlar açılıyor...'),
      shortcut: 'Ctrl + ,',
      category: 'help'
    }
  ];

  const categories = [
    { id: 'all', label: 'Tümü', icon: <Star className="w-4 h-4" /> },
    { id: 'main', label: 'Ana İşlemler', icon: <Zap className="w-4 h-4" /> },
    { id: 'reports', label: 'Raporlar', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'tools', label: 'Araçlar', icon: <Settings className="w-4 h-4" /> },
    { id: 'help', label: 'Yardım', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  const filteredActions = quickActions.filter(action => {
    const matchesSearch = action.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleActionClick = (action: QuickAction) => {
    action.action();
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Quick Actions Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-4 h-4" />
        <span>Hızlı İşlemler</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        
        {/* Keyboard shortcut hint */}
        <span className="ml-2 px-2 py-1 bg-white/20 rounded text-xs font-mono">
          Ctrl+K
        </span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-2 right-0 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Hızlı İşlemler
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="sr-only">Kapat</span>
                  <div className="w-4 h-4 text-gray-500">×</div>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="İşlem ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Category Tabs */}
              <div className="flex space-x-1 mt-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
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

            {/* Actions List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredActions.length > 0 ? (
                <div className="p-2">
                  {filteredActions.map((action) => (
                    <motion.button
                      key={action.id}
                      onClick={() => handleActionClick(action)}
                      className="w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-left group"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                          {action.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {action.label}
                            </h4>
                            {action.shortcut && (
                              <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded font-mono">
                                {action.shortcut}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {action.description}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    "{searchQuery}" için sonuç bulunamadı
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Toplam {filteredActions.length} işlem</span>
                <span>Ctrl+K ile hızlı erişim</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
