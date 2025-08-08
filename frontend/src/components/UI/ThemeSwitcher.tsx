'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sun, Moon, Monitor, Sparkles } from 'lucide-react';
import AnimatedButton from './AnimatedButton';

interface ThemeSwitcherProps {
  className?: string;
}

type Theme = 'light' | 'dark' | 'auto';
type ColorScheme = 'default' | 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'gradient';

export default function ThemeSwitcher({ className = '' }: ThemeSwitcherProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [currentScheme, setCurrentScheme] = useState<ColorScheme>('default');
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: 'light', name: 'Açık', icon: Sun },
    { id: 'dark', name: 'Koyu', icon: Moon },
    { id: 'auto', name: 'Otomatik', icon: Monitor }
  ];

  const colorSchemes = [
    { id: 'default', name: 'Varsayılan', gradient: 'from-gray-500 to-gray-700' },
    { id: 'blue', name: 'Mavi', gradient: 'from-blue-500 to-indigo-600' },
    { id: 'purple', name: 'Mor', gradient: 'from-purple-500 to-pink-600' },
    { id: 'green', name: 'Yeşil', gradient: 'from-green-500 to-emerald-600' },
    { id: 'orange', name: 'Turuncu', gradient: 'from-orange-500 to-red-600' },
    { id: 'pink', name: 'Pembe', gradient: 'from-pink-500 to-rose-600' },
    { id: 'gradient', name: 'Çok Renkli', gradient: 'from-indigo-500 via-purple-500 to-pink-500' }
  ];

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    // Burada gerçek tema değişikliği yapılacak
    document.documentElement.classList.remove('light', 'dark');
    if (theme === 'auto') {
      // Sistem temasını kontrol et
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.classList.add(theme);
    }
  };

  const handleColorSchemeChange = (scheme: ColorScheme) => {
    setCurrentScheme(scheme);
    // CSS değişkenlerini güncelle
    const root = document.documentElement;
    
    const colorVariables = {
      default: { primary: '#6366f1', secondary: '#8b5cf6' },
      blue: { primary: '#3b82f6', secondary: '#1d4ed8' },
      purple: { primary: '#8b5cf6', secondary: '#7c3aed' },
      green: { primary: '#10b981', secondary: '#059669' },
      orange: { primary: '#f97316', secondary: '#ea580c' },
      pink: { primary: '#ec4899', secondary: '#db2777' },
      gradient: { primary: '#6366f1', secondary: '#ec4899' }
    };

    const colors = colorVariables[scheme];
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
  };

  return (
    <div className={`relative ${className}`}>
      <AnimatedButton
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        effect="bounce"
        size="sm"
        className="flex items-center space-x-2"
      >
        <Palette className="w-4 h-4" />
        <span>Tema</span>
        <Sparkles className="w-4 h-4" />
      </AnimatedButton>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50"
        >
          {/* Theme Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Tema Modu
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => {
                const Icon = theme.icon;
                return (
                  <motion.button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id as Theme)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-1 ${
                      currentTheme === theme.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{theme.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Color Scheme Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Renk Şeması
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {colorSchemes.map((scheme) => (
                <motion.button
                  key={scheme.id}
                  onClick={() => handleColorSchemeChange(scheme.id as ColorScheme)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    currentScheme === scheme.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${scheme.gradient}`} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{scheme.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">
              Önizleme
            </h4>
            <div className="flex space-x-2">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${colorSchemes.find(s => s.id === currentScheme)?.gradient}`} />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {themes.find(t => t.id === currentTheme)?.name} + {colorSchemes.find(s => s.id === currentScheme)?.name}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 