'use client';

import { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import StatCardWidget from './Widgets/StatCardWidget';
import ChartWidget from './Widgets/ChartWidget';
import { 
  Plus, 
  Save, 
  Settings, 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy,
  Download,
  Upload,
  Palette,
  Grid3X3
} from 'lucide-react';
import { DashboardWidget, WidgetType, WidgetConfig, WidgetTemplate } from '@/types/dashboard';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardBuilderProps {
  initialLayout?: DashboardWidget[];
  onSave?: (layout: DashboardWidget[]) => void;
  onExport?: (layout: DashboardWidget[]) => void;
  onImport?: (layout: DashboardWidget[]) => void;
}

// Widget Templates
const widgetTemplates: WidgetTemplate[] = [
  {
    type: 'stat-card',
    name: 'İstatistik Kartı',
    description: 'Sayısal veri gösterimi',
    category: 'basic',
    icon: '📊',
    defaultSize: { w: 2, h: 2 },
    defaultConfig: {
      statCard: {
        value: '0',
        label: 'Yeni İstatistik',
        icon: 'activity',
        color: 'blue'
      }
    }
  },
  {
    type: 'line-chart',
    name: 'Çizgi Grafik',
    description: 'Zaman serisi veri gösterimi',
    category: 'charts',
    icon: '📈',
    defaultSize: { w: 4, h: 3 },
    defaultConfig: {
      chart: {
        data: [
          { name: 'Ocak', value: 400 },
          { name: 'Şubat', value: 300 },
          { name: 'Mart', value: 600 },
          { name: 'Nisan', value: 800 },
        ],
        dataKey: 'value',
        xAxisKey: 'name',
        color: '#8884d8',
        title: 'Çizgi Grafik',
        showLegend: true,
        showGrid: true
      }
    }
  },
  {
    type: 'bar-chart',
    name: 'Sütun Grafik',
    description: 'Kategorik veri gösterimi',
    category: 'charts',
    icon: '📊',
    defaultSize: { w: 4, h: 3 },
    defaultConfig: {
      chart: {
        data: [
          { name: 'A', value: 400 },
          { name: 'B', value: 300 },
          { name: 'C', value: 600 },
          { name: 'D', value: 800 },
        ],
        dataKey: 'value',
        xAxisKey: 'name',
        color: '#82ca9d',
        title: 'Sütun Grafik',
        showLegend: true,
        showGrid: true
      }
    }
  },
  {
    type: 'pie-chart',
    name: 'Pasta Grafik',
    description: 'Oran gösterimi',
    category: 'charts',
    icon: '🥧',
    defaultSize: { w: 3, h: 3 },
    defaultConfig: {
      chart: {
        data: [
          { name: 'A', value: 400 },
          { name: 'B', value: 300 },
          { name: 'C', value: 300 },
          { name: 'D', value: 200 },
        ],
        dataKey: 'value',
        title: 'Pasta Grafik',
        showLegend: true
      }
    }
  },
  {
    type: 'area-chart',
    name: 'Alan Grafik',
    description: 'Alan dolgulu grafik',
    category: 'charts',
    icon: '📊',
    defaultSize: { w: 4, h: 3 },
    defaultConfig: {
      chart: {
        data: [
          { name: 'Ocak', value: 400 },
          { name: 'Şubat', value: 300 },
          { name: 'Mart', value: 600 },
          { name: 'Nisan', value: 800 },
        ],
        dataKey: 'value',
        xAxisKey: 'name',
        color: '#8884d8',
        title: 'Alan Grafik',
        showLegend: true,
        showGrid: true
      }
    }
  }
];

export default function DashboardBuilder({ 
  initialLayout = [], 
  onSave, 
  onExport, 
  onImport 
}: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialLayout);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWidgetPanel, setShowWidgetPanel] = useState(false);
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  // Generate layout for react-grid-layout
  const generateLayout = useCallback(() => {
    return widgets.map(widget => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      minW: 1,
      minH: 1,
      isResizable: widget.isResizable && isEditMode,
      isDraggable: widget.isDraggable && isEditMode,
    }));
  }, [widgets, isEditMode]);

  // Add new widget
  const addWidget = (template: WidgetTemplate) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: template.type,
      title: template.name,
      position: {
        x: 0,
        y: widgets.length * 2, // Stack widgets vertically
        w: template.defaultSize.w,
        h: template.defaultSize.h,
      },
      config: template.defaultConfig,
      isVisible: true,
      isResizable: true,
      isDraggable: true,
    };

    setWidgets(prev => [...prev, newWidget]);
    setShowWidgetPanel(false);
  };

  // Update widget config
  const updateWidgetConfig = (widgetId: string, config: WidgetConfig) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, config }
        : widget
    ));
  };

  // Remove widget
  const removeWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
    setSelectedWidget(null);
  };

  // Handle layout change
  const onLayoutChange = (layout: any[]) => {
    setWidgets(prev => prev.map(widget => {
      const layoutItem = layout.find(item => item.i === widget.id);
      if (layoutItem) {
        return {
          ...widget,
          position: {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          }
        };
      }
      return widget;
    }));
  };

  // Save layout
  const handleSave = () => {
    if (onSave) {
      onSave(widgets);
    }
    // Save to localStorage as fallback
    localStorage.setItem('dashboard-layout', JSON.stringify(widgets));
  };

  // Export layout
  const handleExport = () => {
    if (onExport) {
      onExport(widgets);
    } else {
      const dataStr = JSON.stringify(widgets, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-layout-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Import layout
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedLayout = JSON.parse(e.target?.result as string);
          setWidgets(importedLayout);
          if (onImport) {
            onImport(importedLayout);
          }
        } catch (error) {
          console.error('Failed to import layout:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Render widget based on type
  const renderWidget = (widget: DashboardWidget) => {
    const isEditing = isEditMode && selectedWidget === widget.id;
    const isExpanded = expandedWidget === widget.id;

    switch (widget.type) {
      case 'stat-card':
        return (
          <StatCardWidget
            config={widget.config.statCard!}
            isEditing={isEditing}
            onConfigChange={(config) => updateWidgetConfig(widget.id, { statCard: config })}
          />
        );

      case 'line-chart':
      case 'bar-chart':
      case 'pie-chart':
      case 'area-chart':
        return (
          <ChartWidget
            type={widget.type}
            config={widget.config.chart!}
            isEditing={isEditing}
            onConfigChange={(config) => updateWidgetConfig(widget.id, { chart: config })}
            isExpanded={isExpanded}
            onToggleExpand={() => setExpandedWidget(isExpanded ? null : widget.id)}
          />
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4">
            <p className="text-gray-500">Bilinmeyen widget türü: {widget.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard Builder</h1>
            
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isEditMode 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              {isEditMode ? 'Düzenleme Modu' : 'Düzenle'}
            </button>

            {isEditMode && (
              <button
                onClick={() => setShowWidgetPanel(!showWidgetPanel)}
                className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Widget Ekle
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </button>

            <button
              onClick={handleExport}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </button>

            <label className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              İçe Aktar
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Widget Panel */}
        {showWidgetPanel && isEditMode && (
          <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Widget Şablonları</h3>
            
            <div className="space-y-4">
              {widgetTemplates.map((template) => (
                <div
                  key={template.type}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors"
                  onClick={() => addWidget(template)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="flex-1 p-4 bg-gray-50 overflow-auto">
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: generateLayout() }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            onLayoutChange={onLayoutChange}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            margin={[16, 16]}
            containerPadding={[16, 16]}
          >
            {widgets.map((widget) => (
              <div key={widget.id} className="relative">
                {/* Widget Controls */}
                {isEditMode && (
                  <div className="absolute top-2 right-2 z-10 flex items-center space-x-1">
                    <button
                      onClick={() => setSelectedWidget(selectedWidget === widget.id ? null : widget.id)}
                      className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                      title="Düzenle"
                    >
                      <Settings className="h-3 w-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                      title="Sil"
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                )}

                {/* Widget Content */}
                <div className="h-full">
                  {renderWidget(widget)}
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>

          {/* Empty State */}
          {widgets.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Dashboard Boş
                </h3>
                <p className="text-gray-500 mb-4">
                  Başlamak için düzenleme modunu açın ve widget ekleyin.
                </p>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Düzenleme Modunu Aç
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 