'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink' | 'indigo';

interface ThemeSettings {
  theme: Theme;
  colorScheme: ColorScheme;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  animations: boolean;
  compactMode: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
}

interface ThemeContextType {
  settings: ThemeSettings;
  isDark: boolean;
  updateTheme: (theme: Theme) => void;
  updateColorScheme: (scheme: ColorScheme) => void;
  updateFontSize: (size: 'small' | 'medium' | 'large') => void;
  updateBorderRadius: (radius: 'none' | 'small' | 'medium' | 'large') => void;
  toggleAnimations: () => void;
  toggleCompactMode: () => void;
  toggleHighContrast: () => void;
  toggleReduceMotion: () => void;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const defaultSettings: ThemeSettings = {
  theme: 'system',
  colorScheme: 'blue',
  fontSize: 'medium',
  borderRadius: 'medium',
  animations: true,
  compactMode: false,
  highContrast: false,
  reduceMotion: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isDark, setIsDark] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('theme-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('theme-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save theme settings:', error);
    }
  }, [settings]);

  // Handle theme changes and dark mode detection
  useEffect(() => {
    const updateDarkMode = () => {
      let shouldBeDark = false;

      if (settings.theme === 'dark') {
        shouldBeDark = true;
      } else if (settings.theme === 'light') {
        shouldBeDark = false;
      } else {
        // System preference
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDark(shouldBeDark);

      // Apply to document
      const root = document.documentElement;
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateDarkMode();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (settings.theme === 'system') {
        updateDarkMode();
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings.theme]);

  // Apply CSS variables for theme customization
  useEffect(() => {
    const root = document.documentElement;
    
    // Color scheme
    const colorSchemes = {
      blue: {
        primary: '#3b82f6',
        primaryLight: '#dbeafe',
        primaryDark: '#1e40af',
      },
      purple: {
        primary: '#8b5cf6',
        primaryLight: '#ede9fe',
        primaryDark: '#5b21b6',
      },
      green: {
        primary: '#10b981',
        primaryLight: '#d1fae5',
        primaryDark: '#047857',
      },
      orange: {
        primary: '#f59e0b',
        primaryLight: '#fef3c7',
        primaryDark: '#b45309',
      },
      red: {
        primary: '#ef4444',
        primaryLight: '#fee2e2',
        primaryDark: '#b91c1c',
      },
      pink: {
        primary: '#ec4899',
        primaryLight: '#fce7f3',
        primaryDark: '#be185d',
      },
      indigo: {
        primary: '#6366f1',
        primaryLight: '#e0e7ff',
        primaryDark: '#3730a3',
      },
    };

    const scheme = colorSchemes[settings.colorScheme];
    root.style.setProperty('--color-primary', scheme.primary);
    root.style.setProperty('--color-primary-light', scheme.primaryLight);
    root.style.setProperty('--color-primary-dark', scheme.primaryDark);

    // Font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('--font-size-base', fontSizes[settings.fontSize]);

    // Border radius
    const borderRadiuses = {
      none: '0px',
      small: '4px',
      medium: '8px',
      large: '16px',
    };
    root.style.setProperty('--border-radius-base', borderRadiuses[settings.borderRadius]);

    // Animations
    if (!settings.animations || settings.reduceMotion) {
      root.style.setProperty('--animation-duration', '0ms');
      root.style.setProperty('--transition-duration', '0ms');
    } else {
      root.style.setProperty('--animation-duration', '300ms');
      root.style.setProperty('--transition-duration', '200ms');
    }

    // Compact mode
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduce motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [settings]);

  // Theme update functions
  const updateTheme = (theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const updateColorScheme = (colorScheme: ColorScheme) => {
    setSettings(prev => ({ ...prev, colorScheme }));
  };

  const updateFontSize = (fontSize: 'small' | 'medium' | 'large') => {
    setSettings(prev => ({ ...prev, fontSize }));
  };

  const updateBorderRadius = (borderRadius: 'none' | 'small' | 'medium' | 'large') => {
    setSettings(prev => ({ ...prev, borderRadius }));
  };

  const toggleAnimations = () => {
    setSettings(prev => ({ ...prev, animations: !prev.animations }));
  };

  const toggleCompactMode = () => {
    setSettings(prev => ({ ...prev, compactMode: !prev.compactMode }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleReduceMotion = () => {
    setSettings(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsJson: string) => {
    try {
      const parsed = JSON.parse(settingsJson);
      // Validate the settings object
      const validatedSettings = { ...defaultSettings, ...parsed };
      setSettings(validatedSettings);
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  };

  const value: ThemeContextType = {
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
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;