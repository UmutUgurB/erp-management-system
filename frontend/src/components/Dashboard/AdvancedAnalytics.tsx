'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle,
  Info,
  Lightbulb,
  Brain,
  Zap,
  Calendar,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Activity,
  Settings,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Award,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    forecast: number[];
  };
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
    segments: Array<{
      name: string;
      value: number;
      color: string;
    }>;
  };
  performance: {
    score: number;
    metrics: Array<{
      name: string;
      value: number;
      target: number;
      status: 'excellent' | 'good' | 'warning' | 'critical';
    }>;
  };
  insights: Array<{
    id: string;
    type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
    action: string;
    priority: number;
  }>;
}

interface AdvancedAnalyticsProps {
  className?: string;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ className = '' }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');
  const [showInsights, setShowInsights] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'predictive'>('overview');

  // Mock data generation
  useEffect(() => {
    const generateMockData = (): AnalyticsData => ({
      revenue: {
        current: 1250000,
        previous: 1180000,
        change: 5.93,
        trend: 'up',
        forecast: [1300000, 1350000, 1400000, 1450000, 1500000]
      },
      users: {
        total: 15420,
        active: 12360,
        new: 456,
        growth: 3.05,
        segments: [
          { name: 'Premium', value: 25, color: '#10B981' },
          { name: 'Standard', value: 45, color: '#3B82F6' },
          { name: 'Basic', value: 20, color: '#F59E0B' },
          { name: 'Trial', value: 10, color: '#EF4444' }
        ]
      },
      performance: {
        score: 87,
        metrics: [
          { name: 'Customer Satisfaction', value: 92, target: 90, status: 'excellent' },
          { name: 'Response Time', value: 1.2, target: 2.0, status: 'excellent' },
          { name: 'Uptime', value: 99.8, target: 99.5, status: 'excellent' },
          { name: 'Conversion Rate', value: 3.2, target: 4.0, status: 'warning' },
          { name: 'Churn Rate', value: 2.1, target: 1.5, status: 'warning' }
        ]
      },
      insights: [
        {
          id: '1',
          type: 'opportunity',
          title: 'Premium Plan Conversion',
          description: 'Premium plan kullanıcılarının %15\'i yükseltme yapabilir. Hedeflenmiş kampanya ile gelir %8 artabilir.',
          impact: 'high',
          confidence: 85,
          action: 'Premium plan kampanyası başlat',
          priority: 1
        },
        {
          id: '2',
          type: 'risk',
          title: 'Churn Rate Artışı',
          description: 'Son 30 günde churn rate %0.6 arttı. Müşteri memnuniyet anketi yapılması önerilir.',
          impact: 'medium',
          confidence: 78,
          action: 'Müşteri memnuniyet anketi yap',
          priority: 2
        },
        {
          id: '3',
          type: 'trend',
          title: 'Mobile Kullanım Artışı',
          description: 'Mobile kullanıcılar %23 arttı. Mobile-first özellikler geliştirilmesi önerilir.',
          impact: 'medium',
          confidence: 92,
          action: 'Mobile özellikleri geliştir',
          priority: 3
        },
        {
          id: '4',
          type: 'recommendation',
          title: 'A/B Test Optimizasyonu',
          description: 'Landing page A/B testi %12 daha iyi performans gösteriyor. Ana sayfa olarak belirlenmesi önerilir.',
          impact: 'high',
          confidence: 95,
          action: 'A/B test sonucunu uygula',
          priority: 1
        }
      ]
    });

    setData(generateMockData());
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowUp;
      case 'down': return ArrowDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return TrendingUp;
      case 'risk': return AlertCircle;
      case 'trend': return Activity;
      case 'recommendation': return Lightbulb;
      default: return Info;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'risk': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'trend': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'recommendation': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  if (!data) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gelişmiş Analitikler
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              İş zekası ve tahminsel analizler
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
            <option value="90d">Son 90 Gün</option>
            <option value="1y">Son 1 Yıl</option>
          </select>
          
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            title={showInsights ? 'İçgörüleri Gizle' : 'İçgörüleri Göster'}
          >
            {showInsights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setViewMode('overview')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            viewMode === 'overview'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Genel Bakış
        </button>
        <button
          onClick={() => setViewMode('detailed')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            viewMode === 'detailed'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Detaylı Analiz
        </button>
        <button
          onClick={() => setViewMode('predictive')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            viewMode === 'predictive'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Tahminsel Analiz
        </button>
      </div>

      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(data.revenue.current)}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                {(() => {
                  const Icon = getTrendIcon(data.revenue.trend);
                  return (
                    <>
                      <Icon className={`w-4 h-4 ${getTrendColor(data.revenue.trend)}`} />
                      <span className={`text-sm font-medium ${getTrendColor(data.revenue.trend)}`}>
                        +{data.revenue.change}%
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        geçen dönem
                      </span>
                    </>
                  );
                })()}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Kullanıcılar</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(data.users.active)}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{data.users.growth}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  büyüme
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Performans Skoru</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.performance.score}/100
                  </p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${data.performance.score}%` }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Yeni Kullanıcılar</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(data.users.new)}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{Math.round((data.users.new / data.users.total) * 100)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  toplam
                </span>
              </div>
            </motion.div>
          </div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Performans Metrikleri
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.performance.metrics.map((metric, index) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {metric.name}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(metric.status)}`}>
                        {metric.status === 'excellent' && <CheckCircle className="w-3 h-3" />}
                        {metric.status === 'warning' && <AlertCircle className="w-3 h-3" />}
                        {metric.status === 'critical' && <XCircle className="w-3 h-3" />}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {metric.value}{metric.name.includes('Rate') ? '%' : metric.name.includes('Time') ? 's' : ''}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Hedef: {metric.target}{metric.name.includes('Rate') ? '%' : metric.name.includes('Time') ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          metric.status === 'excellent' ? 'bg-green-500' :
                          metric.status === 'good' ? 'bg-blue-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="space-y-6">
          {/* User Segments Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Kullanıcı Segmentleri
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {data.users.segments.map((segment, index) => (
                    <div key={segment.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {segment.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {segment.value}%
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      {data.users.segments.map((segment, index) => {
                        const total = data.users.segments.reduce((sum, s) => sum + s.value, 0);
                        const percentage = (segment.value / total) * 100;
                        const circumference = 2 * Math.PI * 60;
                        const strokeDasharray = (percentage / 100) * circumference;
                        const strokeDashoffset = circumference - strokeDasharray;
                        const angle = (index * 90) + (index * 10);
                        
                        return (
                          <circle
                            key={segment.name}
                            cx="64"
                            cy="64"
                            r="60"
                            fill="none"
                            stroke={segment.color}
                            strokeWidth="12"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform={`rotate(${angle} 64 64)`}
                            className="transition-all duration-1000 ease-out"
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {data.users.total}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Toplam
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Revenue Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Gelir Tahmini (Sonraki 5 Ay)
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-5 gap-4">
                {data.revenue.forecast.map((amount, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Ay {index + 1}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(amount)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{Math.round(((amount - data.revenue.current) / data.revenue.current) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {viewMode === 'predictive' && (
        <div className="space-y-6">
          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  AI İçgörüleri
                </h3>
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Makine Öğrenmesi
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data.insights.map((insight, index) => {
                  const Icon = getInsightIcon(insight.type);
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {insight.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(insight.impact)}`}>
                                {insight.impact}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {insight.confidence}% güven
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {insight.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <button className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors">
                              {insight.action}
                            </button>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>Öncelik: {insight.priority}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Hızlı İşlemler
          </h3>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 inline mr-2" />
              Rapor İndir
            </button>
            <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <Zap className="w-4 h-4 inline mr-2" />
              Otomatik Analiz
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedAnalytics;
