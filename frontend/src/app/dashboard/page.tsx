'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import AIAssistant from '@/components/AI/AIAssistant';
import AdvancedAnalytics from '@/components/Analytics/AdvancedAnalytics';
import MobileApp from '@/components/Mobile/MobileApp';
import SecurityCenter from '@/components/Security/SecurityCenter';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Target,
  Zap,
  Brain,
  Lightbulb,
  Smartphone,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardData {
  sales: {
    current: number;
    previous: number;
    trend: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
  };
  customers: {
    total: number;
    new: number;
    active: number;
  };
  inventory: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
  quickStats: Array<{
    title: string;
    value: string;
    change: number;
    icon: any;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: DashboardData = {
        sales: {
          current: 67500,
          previous: 58000,
          trend: 16.4
        },
        orders: {
          total: 156,
          pending: 23,
          completed: 133
        },
        customers: {
          total: 1247,
          new: 45,
          active: 1189
        },
        inventory: {
          total: 125000,
          lowStock: 8,
          outOfStock: 3
        },
        recentActivity: [
          {
            id: '1',
            type: 'order',
            description: 'Yeni sipariş oluşturuldu: #ORD-2024-001',
            timestamp: '2 dakika önce',
            user: 'Ahmet Yılmaz'
          },
          {
            id: '2',
            type: 'product',
            description: 'Laptop Pro stok seviyesi güncellendi',
            timestamp: '15 dakika önce',
            user: 'Sistem'
          },
          {
            id: '3',
            type: 'customer',
            description: 'Yeni müşteri kaydı: Mehmet Demir',
            timestamp: '1 saat önce',
            user: 'Ayşe Kaya'
          },
          {
            id: '4',
            type: 'payment',
            description: 'Ödeme alındı: ₺2,500',
            timestamp: '2 saat önce',
            user: 'Sistem'
          }
        ],
        quickStats: [
          {
            title: 'Günlük Satış',
            value: '₺2,250',
            change: 12.5,
            icon: TrendingUp
          },
          {
            title: 'Aktif Siparişler',
            value: '23',
            change: -5.2,
            icon: ShoppingCart
          },
          {
            title: 'Yeni Müşteriler',
            value: '8',
            change: 25.0,
            icon: Users
          },
          {
            title: 'Stok Uyarıları',
            value: '5',
            change: 0,
            icon: Package
          }
        ]
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="w-4 h-4" />;
      case 'product': return <Package className="w-4 h-4" />;
      case 'customer': return <Users className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'product': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'customer': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'payment': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ERP sisteminizin genel durumu ve önemli metrikler
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setSelectedView(selectedView === 'analytics' ? 'overview' : 'analytics')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {selectedView === 'analytics' ? <BarChart3 className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
              <span>{selectedView === 'analytics' ? 'Gelişmiş Analitik' : 'AI Analitik'}</span>
            </Button>
            <Button
              onClick={() => setSelectedView(selectedView === 'security' ? 'overview' : 'security')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Güvenlik</span>
            </Button>
            <Button onClick={loadDashboardData} variant="outline">
              <Zap className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {selectedView === 'analytics' ? (
          <AdvancedAnalytics />
        ) : selectedView === 'security' ? (
          <SecurityCenter />
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {data.quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          {stat.change > 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          ) : stat.change < 0 ? (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          ) : (
                            <Activity className="w-3 h-3 text-gray-500" />
                          )}
                          <span>
                            {stat.change > 0 ? '+' : ''}{stat.change}% geçen güne göre
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Sales Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Satış Genel Bakış
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Bu Ay</span>
                      <span className="text-2xl font-bold">₺{data.sales.current.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Geçen Ay</span>
                      <span className="text-lg">₺{data.sales.previous.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {data.sales.trend > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${data.sales.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.sales.trend > 0 ? '+' : ''}{data.sales.trend}% değişim
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Orders Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Sipariş Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Toplam</span>
                      <span className="text-2xl font-bold">{data.orders.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Bekleyen</span>
                      <Badge variant="secondary">{data.orders.pending}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tamamlanan</span>
                      <Badge variant="default">{data.orders.completed}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Son Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.timestamp} • {activity.user}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* AI Assistant */}
        <AIAssistant />
        
        {/* Mobile App */}
        <MobileApp />
      </div>
    </DashboardLayout>
  );
} 