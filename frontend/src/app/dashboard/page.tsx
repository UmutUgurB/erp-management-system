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
import Tooltip, { InfoTooltip, SuccessTooltip, WarningTooltip } from '@/components/UI/Tooltip';
import Popover, { InfoPopover, MenuPopover } from '@/components/UI/Popover';
import ShortcutsHelp from '@/components/UI/ShortcutsHelp';
import { useKeyboardShortcuts, ERP_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
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
  Award,
  HelpCircle,
  Info,
  MoreVertical,
  Download,
  Share,
  Edit,
  Trash2,
  Eye,
  Keyboard
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
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

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

  // Custom shortcuts for dashboard
  const dashboardShortcuts = [
    ...ERP_SHORTCUTS,
    {
      key: '?',
      description: 'Shortcuts Help',
      action: () => setShowShortcutsHelp(true)
    },
    {
      key: 'r',
      ctrl: true,
      description: 'Refresh Dashboard',
      action: loadDashboardData
    },
    {
      key: '1',
      description: 'Overview',
      action: () => setSelectedView('overview')
    },
    {
      key: 'a',
      description: 'Analytics',
      action: () => setSelectedView('analytics')
    },
    {
      key: 's',
      description: 'Security',
      action: () => setSelectedView('security')
    },
    {
      key: 'b',
      description: 'Blockchain',
      action: () => setSelectedView('blockchain')
    },
    {
      key: 'm',
      description: 'Machine Learning',
      action: () => setSelectedView('ml')
    }
  ];

  // Initialize keyboard shortcuts
  useKeyboardShortcuts(dashboardShortcuts);

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

  const menuItems = [
    { label: 'Görüntüle', onClick: () => console.log('View'), icon: Eye },
    { label: 'Düzenle', onClick: () => console.log('Edit'), icon: Edit },
    { label: 'İndir', onClick: () => console.log('Download'), icon: Download },
    { label: 'Paylaş', onClick: () => console.log('Share'), icon: Share },
    { label: 'Sil', onClick: () => console.log('Delete'), icon: Trash2 }
  ];

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
            
            <InfoTooltip content="AI destekli analitik ve öngörüler">
              <AnimatedButton
                onClick={() => setSelectedView(selectedView === 'analytics' ? 'overview' : 'analytics')}
                variant="outline"
                effect="bounce"
                size="sm"
              >
                {selectedView === 'analytics' ? <BarChart3 className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                <span>{selectedView === 'analytics' ? 'Gelişmiş Analitik' : 'AI Analitik'}</span>
              </AnimatedButton>
            </InfoTooltip>

            <SuccessTooltip content="Güvenlik merkezi ve tehdit izleme">
              <AnimatedButton
                onClick={() => setSelectedView(selectedView === 'security' ? 'overview' : 'security')}
                variant="outline"
                effect="glow"
                size="sm"
              >
                <Shield className="w-4 h-4" />
                <span>Güvenlik</span>
              </AnimatedButton>
            </SuccessTooltip>

            <WarningTooltip content="Blockchain işlemleri ve akıllı kontratlar">
              <AnimatedButton
                onClick={() => setSelectedView(selectedView === 'blockchain' ? 'overview' : 'blockchain')}
                variant="outline"
                effect="slide"
                size="sm"
              >
                <Link className="w-4 h-4" />
                <span>Blockchain</span>
              </AnimatedButton>
            </WarningTooltip>

            <Tooltip content="Makine öğrenmesi modelleri ve tahminler" variant="info">
              <AnimatedButton
                onClick={() => setSelectedView(selectedView === 'ml' ? 'overview' : 'ml')}
                variant="outline"
                effect="shake"
                size="sm"
              >
                <Cpu className="w-4 h-4" />
                <span>ML</span>
              </AnimatedButton>
            </Tooltip>

            <AnimatedButton 
              onClick={loadDashboardData} 
              variant="primary"
              effect="ripple"
              loading={loading}
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
            </AnimatedButton>

            <Tooltip content="Klavye kısayolları (?)" variant="default">
              <AnimatedButton
                onClick={() => setShowShortcutsHelp(true)}
                variant="ghost"
                effect="bounce"
                size="sm"
              >
                <Keyboard className="w-4 h-4" />
              </AnimatedButton>
            </Tooltip>
          </div>
        </div>

        {/* Keyboard Shortcuts Indicator */}
        <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Keyboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-indigo-700 dark:text-indigo-300">
                Klavye kısayolları aktif! <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-600 rounded text-xs">?</kbd> tuşuna basarak yardım alın.
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-indigo-600 dark:text-indigo-400">
              <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-600 rounded">1-5</kbd>
              <span>Navigasyon</span>
              <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-600 rounded">Ctrl+R</kbd>
              <span>Yenile</span>
            </div>
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
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <CardGradient className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-3xl"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-gradient-to-br from-green-400 to-teal-500 rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative text-center p-8">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Star className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
                    </motion.div>
                    <motion.h2 
                      className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      Hoş Geldiniz! 🎉
                    </motion.h2>
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Award className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
                    </motion.div>
                  </div>
                  
                  <motion.p 
                    className="text-lg text-gray-600 dark:text-gray-400 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Bugün sisteminizde{' '}
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                      {data.orders.pending} bekleyen sipariş
                    </span>{' '}
                    ve{' '}
                    <span className="font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">
                      {data.customers.new} yeni müşteri
                    </span>{' '}
                    var.
                  </motion.p>
                  
                  <motion.div 
                    className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date().toLocaleDateString('tr-TR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>Hedef: %{Math.round((data.orders.completed / data.orders.total) * 100)} tamamlandı</span>
                    </div>
                  </motion.div>
                </div>
              </CardGradient>
            </motion.div>

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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Hızlı İşlemler
                </h2>
                <InfoPopover
                  title="Hızlı İşlemler Hakkında"
                  content={
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bu bölümde en sık kullanılan işlemleri hızlıca gerçekleştirebilirsiniz.
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Yeni sipariş oluşturma</li>
                        <li>• Ürün ekleme</li>
                        <li>• Müşteri kaydı</li>
                        <li>• Bildirim kontrolü</li>
                      </ul>
                    </div>
                  }
                >
                  <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
                </InfoPopover>
              </div>
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Son Aktiviteler
                  </CardTitle>
                  <MenuPopover items={menuItems}>
                    <MoreVertical className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  </MenuPopover>
                </div>
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

        {/* Shortcuts Help Modal */}
        <ShortcutsHelp
          isOpen={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
        />
      </div>
    </DashboardLayout>
  );
} 