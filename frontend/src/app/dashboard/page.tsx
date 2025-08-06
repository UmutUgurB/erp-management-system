'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { productsAPI, ordersAPI, usersAPI } from '@/lib/api';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { SkeletonStats } from '@/components/UI/Skeleton';
import { SuccessCelebration } from '@/components/UI/Confetti';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Plus,
  Warehouse,
  UserPlus,
  FileText,
  Settings,
  BarChart3,
  Bell,
  Sparkles,
} from 'lucide-react';

interface Stats {
  totalProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        productsAPI.getProducts(),
        ordersAPI.getOrders(),
        usersAPI.getUsers(),
      ]);

      const products = productsRes.data.products || [];
      const orders = ordersRes.data.orders || [];
      const users = usersRes.data.users || [];

      const lowStockProducts = products.filter((p: any) => p.stock <= p.minStock).length;
      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
      const totalRevenue = orders
        .filter((o: any) => o.paymentStatus === 'paid')
        .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

      setStats({
        totalProducts: products.length,
        lowStockProducts,
        totalOrders: orders.length,
        pendingOrders,
        totalUsers: users.length,
        totalRevenue,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      addNotification('error', 'Hata!', 'Dashboard verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Toplam Ürün',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Düşük Stok',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Toplam Sipariş',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Bekleyen Sipariş',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
    },
    {
      name: 'Toplam Ciro',
      value: `₺${stats.totalRevenue.toLocaleString('tr-TR')}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
    },
  ];

  const quickActions = [
    {
      name: 'Yeni Ürün Ekle',
      description: 'Ürün kataloğuna yeni ürün ekle',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: '/dashboard/products',
    },
    {
      name: 'Sipariş Oluştur',
      description: 'Yeni müşteri siparişi oluştur',
      icon: ShoppingCart,
      color: 'bg-green-500 hover:bg-green-600',
      href: '/dashboard/orders',
    },
    {
      name: 'Stok Yönetimi',
      description: 'Envanter işlemlerini yönet',
      icon: Warehouse,
      color: 'bg-purple-500 hover:bg-purple-600',
      href: '/dashboard/inventory',
    },
    {
      name: 'Müşteri Ekle',
      description: 'Yeni müşteri kaydı oluştur',
      icon: UserPlus,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      href: '/dashboard/customers',
    },
    {
      name: 'Fatura Oluştur',
      description: 'Yeni fatura oluştur',
      icon: FileText,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      href: '/dashboard/financial',
    },
    {
      name: 'Raporlar',
      description: 'Sistem raporlarını görüntüle',
      icon: BarChart3,
      color: 'bg-orange-500 hover:bg-orange-600',
      href: '/dashboard/reports',
    },
  ];

  const testNotifications = () => {
    addNotification('success', 'Başarılı!', 'İşlem başarıyla tamamlandı.', 3000);
    setTimeout(() => {
      addNotification('error', 'Hata!', 'Bir hata oluştu, lütfen tekrar deneyin.', 4000);
    }, 1000);
    setTimeout(() => {
      addNotification('warning', 'Uyarı!', 'Düşük stok seviyesi tespit edildi.', 5000);
    }, 2000);
    setTimeout(() => {
      addNotification('info', 'Bilgi', 'Sistem güncellemesi yapıldı.', 6000);
    }, 3000);
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="sm:flex sm:items-center sm:justify-between"
          >
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                ERP sistemi genel durumu ve istatistikleri
              </p>
            </div>
          </motion.div>

          <div className="mt-8">
            <LoadingSpinner size="lg" text="Dashboard yükleniyor..." type="dots" />
          </div>

          <div className="mt-8">
            <SkeletonStats />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4 sm:px-6 lg:px-8"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="sm:flex sm:items-center sm:justify-between"
        >
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              ERP sistemi genel durumu ve istatistikleri
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={triggerCelebration}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Kutlama
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={testNotifications}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <Bell className="h-4 w-4 mr-2" />
              Test Bildirimleri
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8"
        >
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.name}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.2 + index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(action.href)}
                  className={`relative overflow-hidden rounded-lg ${action.color} p-6 text-white shadow-lg transition-all duration-200 group`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6" />
                    <div className="text-left">
                      <h3 className="font-semibold text-sm">{action.name}</h3>
                      <p className="text-xs opacity-90">{action.description}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Genel İstatistikler</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.name}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.4 + index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className={`relative overflow-hidden rounded-lg ${card.bgColor} dark:bg-gray-800 px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6 border border-gray-200 dark:border-gray-700`}
                >
                  <dt>
                    <div className={`absolute rounded-md ${card.color} p-3`}>
                      <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                      {card.name}
                    </p>
                  </dt>
                  <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {card.value}
                    </p>
                  </dd>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Sistem Durumu</h2>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    Stok Durumu
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                    <p>
                      {stats.lowStockProducts > 0
                        ? `${stats.lowStockProducts} ürün kritik stok seviyesinde`
                        : 'Tüm ürünler yeterli stok seviyesinde'}
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    Sipariş Durumu
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                    <p>
                      {stats.pendingOrders > 0
                        ? `${stats.pendingOrders} sipariş işlem bekliyor`
                        : 'Bekleyen sipariş bulunmuyor'}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Success Celebration */}
      <SuccessCelebration 
        isActive={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
      />
    </DashboardLayout>
  );
} 