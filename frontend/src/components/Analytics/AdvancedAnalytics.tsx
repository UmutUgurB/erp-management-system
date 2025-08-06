'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Brain,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

interface AnalyticsData {
  sales: {
    current: number;
    previous: number;
    trend: number;
    forecast: number;
    topProducts: Array<{
      name: string;
      sales: number;
      growth: number;
    }>;
  };
  inventory: {
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    turnoverRate: number;
    recommendations: Array<{
      product: string;
      action: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
  customers: {
    total: number;
    newThisMonth: number;
    churnRate: number;
    lifetimeValue: number;
    segments: Array<{
      name: string;
      count: number;
      value: number;
    }>;
  };
  financial: {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
    cashFlow: number;
    projections: Array<{
      month: string;
      revenue: number;
      expenses: number;
      profit: number;
    }>;
  };
  predictions: Array<{
    type: string;
    title: string;
    description: string;
    confidence: number;
    impact: 'positive' | 'negative' | 'neutral';
    timeframe: string;
  }>;
  anomalies: Array<{
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    detectedAt: string;
    recommendation: string;
  }>;
}

export default function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedView, setSelectedView] = useState('overview');
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data
      const mockData: AnalyticsData = {
        sales: {
          current: 67500,
          previous: 58000,
          trend: 16.4,
          forecast: 72000,
          topProducts: [
            { name: 'Laptop Pro', sales: 12500, growth: 23.5 },
            { name: 'Wireless Mouse', sales: 8900, growth: 15.2 },
            { name: 'Mechanical Keyboard', sales: 7200, growth: 8.7 },
            { name: '4K Monitor', sales: 6800, growth: 12.3 },
            { name: 'Gaming Headset', sales: 5400, growth: 18.9 }
          ]
        },
        inventory: {
          totalValue: 125000,
          lowStockItems: 8,
          outOfStockItems: 3,
          turnoverRate: 4.2,
          recommendations: [
            { product: 'Laptop Pro', action: 'Increase stock by 50%', priority: 'high' },
            { product: 'Wireless Mouse', action: 'Reorder 200 units', priority: 'medium' },
            { product: 'Mechanical Keyboard', action: 'Monitor demand', priority: 'low' }
          ]
        },
        customers: {
          total: 1247,
          newThisMonth: 45,
          churnRate: 2.3,
          lifetimeValue: 2850,
          segments: [
            { name: 'Enterprise', count: 89, value: 125000 },
            { name: 'SMB', count: 234, value: 89000 },
            { name: 'Individual', count: 924, value: 67000 }
          ]
        },
        financial: {
          revenue: 67500,
          expenses: 42000,
          profit: 25500,
          profitMargin: 37.8,
          cashFlow: 18500,
          projections: [
            { month: 'Ocak', revenue: 72000, expenses: 45000, profit: 27000 },
            { month: 'Şubat', revenue: 78000, expenses: 47000, profit: 31000 },
            { month: 'Mart', revenue: 82000, expenses: 49000, profit: 33000 }
          ]
        },
        predictions: [
          {
            type: 'sales',
            title: 'Satış Artışı Bekleniyor',
            description: 'Gelecek ay %15-20 satış artışı öngörülüyor',
            confidence: 0.87,
            impact: 'positive',
            timeframe: '1 ay'
          },
          {
            type: 'inventory',
            title: 'Stok Optimizasyonu',
            description: 'Laptop Pro için stok seviyesini artırmanız önerilir',
            confidence: 0.92,
            impact: 'positive',
            timeframe: '2 hafta'
          },
          {
            type: 'customer',
            title: 'Müşteri Churn Riski',
            description: '15 müşteri için churn riski tespit edildi',
            confidence: 0.76,
            impact: 'negative',
            timeframe: '1 ay'
          }
        ],
        anomalies: [
          {
            type: 'sales',
            description: 'Pazartesi satışları normalin %40 üzerinde',
            severity: 'medium',
            detectedAt: '2024-01-15',
            recommendation: 'Pazartesi promosyonları düşünün'
          },
          {
            type: 'inventory',
            description: 'Laptop Pro stok seviyesi kritik seviyede',
            severity: 'high',
            detectedAt: '2024-01-14',
            recommendation: 'Acil sipariş verin'
          }
        ]
      };
      
      setData(mockData);
    } catch (error) {
      addNotification('error', 'Hata!', 'Analitik veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">Analitik veriler yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gelişmiş Analitik</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI destekli öngörüler ve detaylı analizler
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          >
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
            <option value="90d">Son 90 Gün</option>
            <option value="1y">Son 1 Yıl</option>
          </select>
          <Button onClick={loadAnalyticsData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
          { id: 'predictions', label: 'Öngörüler', icon: Brain },
          { id: 'anomalies', label: 'Anomaliler', icon: AlertTriangle },
          { id: 'insights', label: 'Öngörüler', icon: Lightbulb }
        ].map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === view.id
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{view.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sales Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{data.sales.current.toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {getTrendIcon(data.sales.trend)}
                <span>{data.sales.trend > 0 ? '+' : ''}{data.sales.trend}% geçen aya göre</span>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Envanter Değeri</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{data.inventory.totalValue.toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>Devir hızı: {data.inventory.turnoverRate}x</span>
              </div>
            </CardContent>
          </Card>

          {/* Customers Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Müşteriler</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.customers.total.toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>Bu ay +{data.customers.newThisMonth} yeni</span>
              </div>
            </CardContent>
          </Card>

          {/* Profit Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Kar</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{data.financial.profit.toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>Kar marjı: {data.financial.profitMargin}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Predictions */}
      {selectedView === 'predictions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.predictions.map((prediction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{prediction.title}</CardTitle>
                      <Badge className={getImpactColor(prediction.impact)}>
                        {prediction.impact === 'positive' ? 'Pozitif' : 
                         prediction.impact === 'negative' ? 'Negatif' : 'Nötr'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {prediction.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Güven: {Math.round(prediction.confidence * 100)}%</span>
                      <span className="text-gray-500">{prediction.timeframe}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies */}
      {selectedView === 'anomalies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.anomalies.map((anomaly, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Anomali Tespit Edildi</CardTitle>
                      <Badge className={getSeverityColor(anomaly.severity)}>
                        {anomaly.severity === 'high' ? 'Yüksek' : 
                         anomaly.severity === 'medium' ? 'Orta' : 'Düşük'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {anomaly.description}
                    </p>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">
                        Tespit: {new Date(anomaly.detectedAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-xs font-medium text-indigo-600">
                        Öneri: {anomaly.recommendation}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {selectedView === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                En Çok Satan Ürünler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.sales.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">₺{product.sales.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(product.growth)}
                      <span className="text-sm text-gray-600">{product.growth}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Müşteri Segmentleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.customers.segments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{segment.name}</p>
                      <p className="text-sm text-gray-500">{segment.count} müşteri</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₺{segment.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Toplam değer</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Stok Önerileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.inventory.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{rec.product}</p>
                      <p className="text-sm text-gray-500">{rec.action}</p>
                    </div>
                    <Badge className={
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {rec.priority === 'high' ? 'Yüksek' : 
                       rec.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Projections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Finansal Projeksiyonlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.financial.projections.map((projection, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{projection.month}</p>
                      <p className="text-sm text-gray-500">Tahmini gelir</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₺{projection.revenue.toLocaleString()}</p>
                      <p className="text-sm text-green-600">+₺{projection.profit.toLocaleString()} kar</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 