'use client';

import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Settings, Maximize2, Minimize2 } from 'lucide-react';

interface ChartWidgetProps {
  type: 'line-chart' | 'bar-chart' | 'pie-chart' | 'area-chart';
  config: {
    data: any[];
    dataKey: string;
    xAxisKey?: string;
    color?: string;
    title?: string;
    showLegend?: boolean;
    showGrid?: boolean;
  };
  isEditing?: boolean;
  onConfigChange?: (config: any) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ChartWidget({ 
  type, 
  config, 
  isEditing = false, 
  onConfigChange,
  isExpanded = false,
  onToggleExpand
}: ChartWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleConfigChange = (field: string, value: any) => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        [field]: value,
      });
    }
  };

  const renderChart = () => {
    const commonProps = {
      data: config.data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line-chart':
        return (
          <LineChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis />
            <Tooltip />
            {config.showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey={config.dataKey} 
              stroke={config.color || '#8884d8'} 
              strokeWidth={2} 
            />
          </LineChart>
        );

      case 'bar-chart':
        return (
          <BarChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis />
            <Tooltip />
            {config.showLegend && <Legend />}
            <Bar dataKey={config.dataKey} fill={config.color || '#8884d8'} />
          </BarChart>
        );

      case 'pie-chart':
        return (
          <PieChart>
            <Pie
              data={config.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={config.dataKey}
            >
              {config.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {config.showLegend && <Legend />}
          </PieChart>
        );

      case 'area-chart':
        return (
          <AreaChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis />
            <Tooltip />
            {config.showLegend && <Legend />}
            <Area 
              type="monotone" 
              dataKey={config.dataKey} 
              stroke={config.color || '#8884d8'} 
              fill={config.color || '#8884d8'} 
              fillOpacity={0.3} 
            />
          </AreaChart>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className={`relative bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
        isEditing ? 'border-dashed border-gray-300' : 'border-gray-200'
      } ${isHovered ? 'shadow-md' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? (
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                className="px-2 py-1 text-lg font-medium text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Grafik Başlığı"
              />
            ) : (
              config.title || 'Grafik'
            )}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing && (
            <button
              onClick={() => handleConfigChange('showLegend', !config.showLegend)}
              className={`p-1 rounded ${
                config.showLegend ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
              }`}
              title="Gösterge Göster/Gizle"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
              title={isExpanded ? 'Küçült' : 'Büyüt'}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            {/* Chart Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grafik Türü
              </label>
              <select
                value={type}
                onChange={(e) => {
                  // This would need to be handled by parent component
                  console.log('Chart type changed to:', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="line-chart">Çizgi Grafik</option>
                <option value="bar-chart">Sütun Grafik</option>
                <option value="pie-chart">Pasta Grafik</option>
                <option value="area-chart">Alan Grafik</option>
              </select>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renk
              </label>
              <input
                type="color"
                value={config.color || '#8884d8'}
                onChange={(e) => handleConfigChange('color', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>

            {/* Grid Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showGrid"
                checked={config.showGrid}
                onChange={(e) => handleConfigChange('showGrid', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="showGrid" className="text-sm text-gray-700">
                Izgara Göster
              </label>
            </div>

            {/* Preview */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Önizleme</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${isExpanded ? 'h-96' : 'h-64'}`}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Edit Overlay */}
      {isEditing && (
        <div className="absolute inset-0 bg-black bg-opacity-5 rounded-lg pointer-events-none" />
      )}
    </div>
  );
} 