'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { productsAPI, ordersAPI, usersAPI } from '@/lib/api';
import AnimatedLoading from '@/components/UI/AnimatedLoading';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  DollarSign,
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <AnimatedLoading size="lg" text="Dashboard yükleniyor..." />
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
          className="sm:flex sm:items-center"
        >
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              ERP sistemi genel durumu ve istatistikleri
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.name}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.3 + index * 0.1,
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
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
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
                  transition={{ duration: 0.5, delay: 0.5 }}
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
                  transition={{ duration: 0.5, delay: 0.6 }}
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
    </DashboardLayout>
  );
} 