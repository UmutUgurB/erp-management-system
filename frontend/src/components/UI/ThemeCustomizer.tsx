'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Type,
  Zap,
  Eye,
  Minimize2,
  CornerSquare,
  Settings,
  Download,
  Upload,
  RotateCcw,
  X,
  Check,
  Contrast,
  Accessibility,
} from 'lucide-react';
import { useTheme, Theme, ColorScheme } from '@/context/ThemeContext';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    isDark,
    updateTheme,
    updateColorScheme,
    updateFontSize,
    updateBorderRadius,
    toggleAnimations,
    toggleCompactMode,
    toggleHighContrast,
    toggleReduceMotion,
    resetToDefaults,
    exportSettings,
    importSettings,
  } = useTheme();

  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const colorSchemes: { value: ColorScheme; label: string; color: string }[] = [
    { value: 'blue', label: 'Blue', color: '#3b82f6' },
    { value: 'purple', label: 'Purple', color: '#8b5cf6' },
    { value: 'green', label: 'Green', color: '#10b981' },
    { value: 'orange', label: 'Orange', color: '#f59e0b' },
    { value: 'red', label: 'Red', color: '#ef4444' },
    { value: 'pink', label: 'Pink', color: '#ec4899' },
    { value: 'indigo', label: 'Indigo', color: '#6366f1' },
  ];

  const fontSizes = [
    { value: 'small' as const, label: 'Small', size: '14px' },
    { value: 'medium' as const, label: 'Medium', size: '16px' },
    { value: 'large' as const, label: 'Large', size: '18px' },
  ];

  const borderRadiuses = [
    { value: 'none' as const, label: 'None', radius: '0px' },
    { value: 'small' as const, label: 'Small', radius: '4px' },
    { value: 'medium' as const, label: 'Medium', radius: '8px' },
    { value: 'large' as const, label: 'Large', radius: '16px' },
  ];

  const handleExport = () => {
    const data = exportSettings();
    setExportData(data);
    setShowExport(true);
  };

  const handleImport = () => {
    if (importData.trim()) {
      const success = importSettings(importData);
      if (success) {
        setImportData('');
        setShowImport(false);
      } else {
        alert('Invalid settings data');
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Theme Customizer
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Theme Mode */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Theme Mode
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateTheme(option.value)}
                      className={`p-3 rounded-lg border transition-all ${
                        settings.theme === option.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <option.icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Scheme */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color Scheme
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.value}
                      onClick={() => updateColorScheme(scheme.value)}
                      className={`relative p-3 rounded-lg border transition-all ${
                        settings.colorScheme === scheme.value
                          ? 'border-gray-400 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      style={{ 
                        borderColor: settings.colorScheme === scheme.value ? scheme.color : undefined,
                        ringColor: settings.colorScheme === scheme.value ? scheme.color : undefined 
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: scheme.color }}
                      />
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {scheme.label}
                      </div>
                      {settings.colorScheme === scheme.value && (
                        <div className="absolute top-1 right-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Font Size
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => updateFontSize(size.value)}
                      className={`p-3 rounded-lg border transition-all ${
                        settings.fontSize === size.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div 
                        className="font-medium mx-auto mb-1"
                        style={{ fontSize: size.size }}
                      >
                        Aa
                      </div>
                      <div className="text-xs">{size.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CornerSquare className="w-5 h-5" />
                  Border Radius
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {borderRadiuses.map((radius) => (
                    <button
                      key={radius.value}
                      onClick={() => updateBorderRadius(radius.value)}
                      className={`p-3 rounded-lg border transition-all ${
                        settings.borderRadius === radius.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 bg-gray-300 dark:bg-gray-600 mx-auto mb-1"
                        style={{ borderRadius: radius.radius }}
                      />
                      <div className="text-xs">{radius.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Preferences
                </h3>
                <div className="space-y-4">
                  {/* Animations */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Animations</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Enable page animations</div>
                      </div>
                    </div>
                    <button
                      onClick={toggleAnimations}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.animations ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.animations ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Compact Mode */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Minimize2 className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Compact Mode</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Reduce spacing and padding</div>
                      </div>
                    </div>
                    <button
                      onClick={toggleCompactMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.compactMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.compactMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* High Contrast */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Contrast className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">High Contrast</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Improve text readability</div>
                      </div>
                    </div>
                    <button
                      onClick={toggleHighContrast}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.highContrast ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Reduce Motion */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Accessibility className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Reduce Motion</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Minimize motion effects</div>
                      </div>
                    </div>
                    <button
                      onClick={toggleReduceMotion}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.reduceMotion ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.reduceMotion ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleExport}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                  >
                    <Download className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">Export Settings</span>
                  </button>

                  <button
                    onClick={() => setShowImport(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">Import Settings</span>
                  </button>

                  <button
                    onClick={resetToDefaults}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset to Defaults</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Export Modal */}
            {showExport && (
              <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Export Settings</h3>
                  <button
                    onClick={() => setShowExport(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <textarea
                    value={exportData}
                    readOnly
                    className="w-full h-64 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(exportData)}
                    className="mt-4 w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            )}

            {/* Import Modal */}
            {showImport && (
              <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Settings</h3>
                  <button
                    onClick={() => setShowImport(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your settings JSON here..."
                    className="w-full h-64 p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-mono"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleImport}
                      className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Import Settings
                    </button>
                    <button
                      onClick={() => setShowImport(false)}
                      className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ThemeCustomizer;
