'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'inventory' | 'customers' | 'financial' | 'custom';
  chartType: 'bar' | 'pie' | 'line' | 'table';
  timeRange: 'day' | 'week' | 'month' | 'quarter' | 'year';
  filters: string[];
  isActive: boolean;
}

const chartTypes = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'table', label: 'Table', icon: TrendingUp },
];

const timeRanges = [
  { value: 'day', label: 'Günlük' },
  { value: 'week', label: 'Haftalık' },
  { value: 'month', label: 'Aylık' },
  { value: 'quarter', label: 'Çeyreklik' },
  { value: 'year', label: 'Yıllık' },
];

const reportTemplates = [
  {
    id: 'sales-overview',
    name: 'Satış Genel Bakış',
    description: 'Satış performansı ve trend analizi',
    type: 'sales',
    chartType: 'bar',
    timeRange: 'month',
    filters: ['category', 'region', 'salesperson'],
  },
  {
    id: 'inventory-status',
    name: 'Envanter Durumu',
    description: 'Stok seviyeleri ve hareket analizi',
    type: 'inventory',
    chartType: 'pie',
    timeRange: 'week',
    filters: ['category', 'location', 'supplier'],
  },
  {
    id: 'customer-analysis',
    name: 'Müşteri Analizi',
    description: 'Müşteri davranışları ve segmentasyon',
    type: 'customers',
    chartType: 'line',
    timeRange: 'month',
    filters: ['segment', 'region', 'source'],
  },
  {
    id: 'financial-summary',
    name: 'Finansal Özet',
    description: 'Gelir, gider ve karlılık analizi',
    type: 'financial',
    chartType: 'bar',
    timeRange: 'quarter',
    filters: ['department', 'project', 'category'],
  },
];

export default function ReportBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportConfig | null>(null);
  const [customConfig, setCustomConfig] = useState<Partial<ReportConfig>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { addNotification } = useNotifications();

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate({
      ...template,
      id: `custom-${Date.now()}`,
      isActive: true,
    });
    setCustomConfig(template);
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) {
      addNotification('error', 'Hata!', 'Lütfen bir rapor şablonu seçin.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addNotification('success', 'Başarılı!', 'Rapor başarıyla oluşturuldu.');
      
      // Here you would typically call your API to generate the report
      console.log('Generating report with config:', selectedTemplate);
      
    } catch (error) {
      addNotification('error', 'Hata!', 'Rapor oluşturulurken bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    addNotification('info', 'Bilgi', `${format.toUpperCase()} formatında rapor indiriliyor...`);
    // Here you would implement the actual export logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rapor Oluşturucu</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Özelleştirilebilir raporlar oluşturun ve analiz edin
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handleExportReport('pdf')}
            disabled={!selectedTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportReport('excel')}
            disabled={!selectedTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Rapor Şablonları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.timeRange}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Rapor Konfigürasyonu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedTemplate ? (
                <>
                  {/* Chart Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Grafik Türü
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {chartTypes.map((chart) => {
                        const Icon = chart.icon;
                        return (
                          <motion.button
                            key={chart.value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCustomConfig({ ...customConfig, chartType: chart.value as any })}
                            className={`p-4 border rounded-lg text-center transition-all ${
                              customConfig.chartType === chart.value
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {chart.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Range Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Zaman Aralığı
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {timeRanges.map((range) => (
                        <motion.button
                          key={range.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCustomConfig({ ...customConfig, timeRange: range.value as any })}
                          className={`p-3 border rounded-lg text-center transition-all ${
                            customConfig.timeRange === range.value
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {range.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Filters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Filtreler
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.filters.map((filter) => (
                        <Badge key={filter} variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                          {filter}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                      className="min-w-[150px]"
                    >
                      {isGenerating ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Oluşturuluyor...
                        </div>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Rapor Oluştur
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Rapor Şablonu Seçin
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sol taraftan bir rapor şablonu seçerek başlayın
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 