'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users,
  Activity,
  BarChart3
} from 'lucide-react';

interface StatCardWidgetProps {
  config: {
    value: string | number;
    label: string;
    icon: string;
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
    trend?: {
      value: number;
      isPositive: boolean;
    };
  };
  isEditing?: boolean;
  onConfigChange?: (config: any) => void;
}

const iconMap = {
  'dollar': DollarSign,
  'package': Package,
  'shopping-cart': ShoppingCart,
  'users': Users,
  'activity': Activity,
  'bar-chart': BarChart3,
};

const colorClasses = {
  blue: 'bg-blue-500 text-blue-100',
  green: 'bg-green-500 text-green-100',
  yellow: 'bg-yellow-500 text-yellow-100',
  red: 'bg-red-500 text-red-100',
  purple: 'bg-purple-500 text-purple-100',
  gray: 'bg-gray-500 text-gray-100',
};

const colorBorders = {
  blue: 'border-blue-200',
  green: 'border-green-200',
  yellow: 'border-yellow-200',
  red: 'border-red-200',
  purple: 'border-purple-200',
  gray: 'border-gray-200',
};

export default function StatCardWidget({ config, isEditing = false, onConfigChange }: StatCardWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || Activity;

  const handleConfigChange = (field: string, value: any) => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        [field]: value,
      });
    }
  };

  return (
    <div
      className="group relative rounded-xl p-[1px] bg-gradient-to-br from-indigo-200/60 via-transparent to-pink-200/60 dark:from-indigo-500/20 dark:to-pink-500/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative rounded-xl bg-white/70 dark:bg-gray-800/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 border transition-all duration-300 ${
          isEditing
            ? 'border-dashed border-indigo-300/70 dark:border-indigo-500/40'
            : `border-white/60 dark:border-white/10 shadow-sm ${colorBorders[config.color]}`
        } ${isHovered && !isEditing ? 'shadow-md translate-y-[-1px]' : ''}`}
      >
      {/* Widget Header */}
        <div className="flex items-center justify-between p-4">
          <div className={`p-2 rounded-lg ${colorClasses[config.color]}`}>
            <IconComponent className="h-5 w-5" />
          </div>
          {config.trend && (
            <div className="flex items-center space-x-1">
              {config.trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                config.trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {config.trend.isPositive ? '+' : ''}{config.trend.value}%
              </span>
            </div>
          )}
        </div>

      {/* Widget Content */}
        <div className="px-4 pb-4">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={config.value}
              onChange={(e) => handleConfigChange('value', e.target.value)}
              className="w-full px-2 py-1 text-2xl font-bold text-gray-900 dark:text-gray-100 bg-white/80 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={config.label}
              onChange={(e) => handleConfigChange('label', e.target.value)}
              className="w-full px-2 py-1 text-sm text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={config.color}
              onChange={(e) => handleConfigChange('color', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="blue">Mavi</option>
              <option value="green">Yeşil</option>
              <option value="yellow">Sarı</option>
              <option value="red">Kırmızı</option>
              <option value="purple">Mor</option>
              <option value="gray">Gri</option>
            </select>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {typeof config.value === 'number' 
                ? config.value.toLocaleString('tr-TR')
                : config.value
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {config.label}
            </div>
          </>
        )}
        </div>

      {/* Edit Overlay */}
        {isEditing && (
          <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-xl pointer-events-none" />
        )}
      </div>
    </div>
  );
} 