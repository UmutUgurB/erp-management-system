'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Zap, Command, Control } from 'lucide-react';
import AnimatedButton from './AnimatedButton';

interface ShortcutItem {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  category: string;
}

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: ShortcutItem[];
}

const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  // Navigation
  { key: '1', description: 'Dashboard', category: 'Navigation' },
  { key: '2', description: 'Products', category: 'Navigation' },
  { key: '3', description: 'Orders', category: 'Navigation' },
  { key: '4', description: 'Customers', category: 'Navigation' },
  { key: '5', description: 'Employees', category: 'Navigation' },
  
  // Actions
  { key: 'n', ctrl: true, description: 'New Item', category: 'Actions' },
  { key: 's', ctrl: true, description: 'Save', category: 'Actions' },
  { key: 'f', ctrl: true, description: 'Search', category: 'Actions' },
  { key: 'r', ctrl: true, description: 'Refresh', category: 'Actions' },
  { key: 'Delete', description: 'Delete Item', category: 'Actions' },
  
  // Navigation
  { key: 'ArrowUp', description: 'Previous Item', category: 'Navigation' },
  { key: 'ArrowDown', description: 'Next Item', category: 'Navigation' },
  { key: 'Enter', description: 'Confirm', category: 'Navigation' },
  { key: 'Escape', description: 'Close Modal', category: 'Navigation' },
  
  // Help
  { key: 'h', description: 'Help', category: 'Help' },
  { key: '?', description: 'Shortcuts Help', category: 'Help' }
];

export default function ShortcutsHelp({ 
  isOpen, 
  onClose, 
  shortcuts = DEFAULT_SHORTCUTS 
}: ShortcutsHelpProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(shortcuts.map(s => s.category)))];

  const filteredShortcuts = selectedCategory === 'All' 
    ? shortcuts 
    : shortcuts.filter(s => s.category === selectedCategory);

  const formatKey = (shortcut: ShortcutItem) => {
    const parts = [];
    
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.meta) parts.push('⌘');
    
    parts.push(shortcut.key);
    
    return parts.join(' + ');
  };

  const getKeyIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case 'ctrl':
        return <Control className="w-3 h-3" />;
      case 'meta':
        return <Command className="w-3 h-3" />;
      default:
        return <Keyboard className="w-3 h-3" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                  <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Klavye Kısayolları
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ERP sistemini daha hızlı kullanın
                  </p>
                </div>
              </div>
              <AnimatedButton
                onClick={onClose}
                variant="ghost"
                effect="scale"
                size="sm"
              >
                <X className="w-5 h-5" />
              </AnimatedButton>
            </div>

            {/* Category Tabs */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Shortcuts List */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-4">
                {filteredShortcuts.map((shortcut, index) => (
                  <motion.div
                    key={`${shortcut.key}-${shortcut.description}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <Keyboard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {shortcut.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {shortcut.category}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {formatKey(shortcut).split(' + ').map((key, keyIndex) => (
                        <div key={keyIndex} className="flex items-center space-x-1">
                          {keyIndex > 0 && (
                            <span className="text-gray-400 mx-1">+</span>
                          )}
                          <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                            {key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Toplam {filteredShortcuts.length} kısayol
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Control className="w-4 h-4" />
                    <span>Ctrl</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Command className="w-4 h-4" />
                    <span>⌘</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Keyboard className="w-4 h-4" />
                    <span>Key</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 