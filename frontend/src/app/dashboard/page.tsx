'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import AIAssistant from '@/components/AI/AIAssistant';
import AdvancedAnalytics from '@/components/Analytics/AdvancedAnalytics';
import MobileApp from '@/components/Mobile/MobileApp';
import SecurityCenter from '@/components/Security/SecurityCenter';
import BlockchainManager from '@/components/Blockchain/BlockchainManager';
import MachineLearning from '@/components/ML/MachineLearning';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import SkeletonLoader from '@/components/UI/SkeletonLoader';
import AnimatedButton from '@/components/UI/AnimatedButton';
import { StatsCard, FeatureCard, ActionCard } from '@/components/UI/HoverCard';
import ThemeSwitcher from '@/components/UI/ThemeSwitcher';
import { AnimatedGradientText, CardGradient } from '@/components/UI/GradientBackground';
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
  Shield,
  Link,
  Cpu,
  Plus,
  RefreshCw,
  Settings,
  Bell,
  Star,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Skeleton */}
          <div className="mb-8">
            <SkeletonLoader type="card" rows={1} />
          </div>
          
          {/* Quick Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonLoader key={i} type="card" rows={2} />
            ))}
          </div>
          
          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <SkeletonLoader type="card" rows={4} />
            <SkeletonLoader type="card" rows={4} />
          </div>
          
          {/* Activity Skeleton */}
          <SkeletonLoader type="list" rows={4} />
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
              <AnimatedGradientText className="text-3xl font-bold">
                Dashboard
              </AnimatedGradientText>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ERP sisteminizin genel durumu ve önemli metrikler
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeSwitcher />
            <AnimatedButton
              onClick={() => setSelectedView(selectedView === 'analytics' ? 'overview' : 'analytics')}
              variant="outline"
              effect="bounce"
              size="sm"
            >
              {selectedView === 'analytics' ? <BarChart3 className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
              <span>{selectedView === 'analytics' ? 'Gelişmiş Analitik' : 'AI Analitik'}</span>
            </AnimatedButton>
            <AnimatedButton
              onClick={() => setSelectedView(selectedView === 'security' ? 'overview' : 'security')}
              variant="outline"
              effect="glow"
              size="sm"
            >
              <Shield className="w-4 h-4" />
              <span>Güvenlik</span>
            </AnimatedButton>
            <AnimatedButton
              onClick={() => setSelectedView(selectedView === 'blockchain' ? 'overview' : 'blockchain')}
              variant="outline"
              effect="slide"
              size="sm"
            >
              <Link className="w-4 h-4" />
              <span>Blockchain</span>
            </AnimatedButton>
            <AnimatedButton
              onClick={() => setSelectedView(selectedView === 'ml' ? 'overview' : 'ml')}
              variant="outline"
              effect="shake"
              size="sm"
            >
              <Cpu className="w-4 h-4" />
              <span>ML</span>
            </AnimatedButton>
            <AnimatedButton 
              onClick={loadDashboardData} 
              variant="primary"
              effect="ripple"
              loading={loading}
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
            </AnimatedButton>
          </div>
        </div>

        {selectedView === 'analytics' ? (
          <AdvancedAnalytics />
        ) : selectedView === 'security' ? (
          <SecurityCenter />
        ) : selectedView === 'blockchain' ? (
          <BlockchainManager />
        ) : selectedView === 'ml' ? (
          <MachineLearning />
        ) : (
          <>
            {/* Welcome Card */}
            <CardGradient className="mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Hoş Geldiniz! 🎉
                  </h2>
                  <Award className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Bugün sisteminizde <span className="font-semibold text-indigo-600">{data.orders.pending}</span> bekleyen sipariş ve 
                  <span className="font-semibold text-green-600"> {data.customers.new}</span> yeni müşteri var.
                </p>
              </div>
            </CardGradient>

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
                    <StatsCard
                      title={stat.title}
                      value={stat.value}
                      change={stat.change}
                      icon={Icon}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Hızlı İşlemler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ActionCard
                  title="Yeni Sipariş"
                  description="Müşteri için yeni sipariş oluştur"
                  action={
                    <AnimatedButton variant="primary" effect="scale" size="sm">
                      <Plus className="w-4 h-4" />
                      Oluştur
                    </AnimatedButton>
                  }
                />
                <ActionCard
                  title="Ürün Ekle"
                  description="Envantere yeni ürün ekle"
                  action={
                    <AnimatedButton variant="secondary" effect="bounce" size="sm">
                      <Plus className="w-4 h-4" />
                      Ekle
                    </AnimatedButton>
                  }
                />
                <ActionCard
                  title="Müşteri Kaydı"
                  description="Yeni müşteri kaydı oluştur"
                  action={
                    <AnimatedButton variant="success" effect="glow" size="sm">
                      <Plus className="w-4 h-4" />
                      Kaydet
                    </AnimatedButton>
                  }
                />
                <ActionCard
                  title="Bildirimler"
                  description="Sistem bildirimlerini kontrol et"
                  action={
                    <AnimatedButton variant="warning" effect="shake" size="sm">
                      <Bell className="w-4 h-4" />
                      Görüntüle
                    </AnimatedButton>
                  }
                />
              </div>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Sales Overview */}
              <FeatureCard
                title="Satış Genel Bakış"
                description={`Bu ay ${data.sales.trend > 0 ? '+' : ''}${data.sales.trend}% artış ile ₺${data.sales.current.toLocaleString()} satış gerçekleşti.`}
                icon={DollarSign}
              />

              {/* Orders Overview */}
              <FeatureCard
                title="Sipariş Durumu"
                description={`${data.orders.total} toplam siparişten ${data.orders.pending} tanesi bekliyor, ${data.orders.completed} tanesi tamamlandı.`}
                icon={ShoppingCart}
              />
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