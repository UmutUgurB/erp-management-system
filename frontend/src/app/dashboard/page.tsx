'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Calendar,
  FileText,
  Settings,
  Bell,
  Search
} from 'lucide-react';
import { GradientCard } from '@/components/UI/GradientCard';
import { ProgressRing } from '@/components/UI/ProgressRing';
import { FloatingActionButton, CommonActions } from '@/components/UI/FloatingActionButton';
import { DataTable } from '@/components/UI/DataTable';
import { KanbanBoard, KanbanColumns } from '@/components/UI/KanbanBoard';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  userGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
}

const mockStats: DashboardStats = {
  totalUsers: 1247,
  totalProducts: 89,
  totalOrders: 456,
  totalRevenue: 125000,
  userGrowth: 12.5,
  orderGrowth: 8.3,
  revenueGrowth: 15.7
};

const mockOrders: RecentOrder[] = [
  {
    id: 'ORD-001',
    customer: 'Ahmet Yılmaz',
    product: 'Laptop',
    amount: 25000,
    status: 'completed',
    date: '2024-01-15'
  },
  {
    id: 'ORD-002',
    customer: 'Fatma Demir',
    product: 'Mouse',
    amount: 150,
    status: 'processing',
    date: '2024-01-14'
  },
  {
    id: 'ORD-003',
    customer: 'Mehmet Kaya',
    product: 'Keyboard',
    amount: 300,
    status: 'pending',
    date: '2024-01-13'
  }
];

const orderColumns = [
  { key: 'id', header: 'Sipariş No', width: 'w-24' },
  { key: 'customer', header: 'Müşteri' },
  { key: 'product', header: 'Ürün' },
  { 
    key: 'amount', 
    header: 'Tutar',
    render: (value: number) => `₺${value.toLocaleString()}`
  },
  { 
    key: 'status', 
    header: 'Durum',
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'completed' ? 'bg-green-100 text-green-800' :
        value === 'processing' ? 'bg-blue-100 text-blue-800' :
        value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {value === 'completed' ? 'Tamamlandı' :
         value === 'processing' ? 'İşleniyor' :
         value === 'pending' ? 'Bekliyor' : 'İptal'}
      </span>
    )
  },
  { 
    key: 'date', 
    header: 'Tarih',
    render: (value: string) => new Date(value).toLocaleDateString('tr-TR')
  }
];

const mockKanbanData = [
  {
    id: 'todo',
    title: 'Yapılacak',
    color: 'bg-gray-500',
    tasks: [
      {
        id: '1',
        title: 'Yeni ürün ekle',
        description: 'Yeni laptop modelini sisteme ekle',
        priority: 'high' as const,
        assignee: 'Ahmet',
        tags: ['ürün', 'laptop']
      },
      {
        id: '2',
        title: 'Müşteri raporu hazırla',
        description: 'Aylık müşteri analiz raporu',
        priority: 'medium' as const,
        assignee: 'Fatma',
        tags: ['rapor', 'analiz']
      }
    ]
  },
  {
    id: 'in-progress',
    title: 'Devam Ediyor',
    color: 'bg-blue-500',
    tasks: [
      {
        id: '3',
        title: 'Sistem güncellemesi',
        description: 'Backend API güncellemesi',
        priority: 'high' as const,
        assignee: 'Mehmet',
        tags: ['backend', 'api']
      }
    ]
  },
  {
    id: 'review',
    title: 'İnceleme',
    color: 'bg-yellow-500',
    tasks: [
      {
        id: '4',
        title: 'UI tasarım onayı',
        description: 'Yeni dashboard tasarımı',
        priority: 'medium' as const,
        assignee: 'Ayşe',
        tags: ['ui', 'tasarım']
      }
    ]
  },
  {
    id: 'done',
    title: 'Tamamlandı',
    color: 'bg-green-500',
    tasks: [
      {
        id: '5',
        title: 'Veritabanı yedekleme',
        description: 'Otomatik yedekleme sistemi',
        priority: 'low' as const,
        assignee: 'Ali',
        tags: ['veritabanı', 'yedek']
      }
    ]
  }
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [orders, setOrders] = useState<RecentOrder[]>(mockOrders);
  const [kanbanData, setKanbanData] = useState(mockKanbanData);

  const handleTaskMove = (taskId: string, fromColumnId: string, toColumnId: string) => {
    console.log(`Task ${taskId} moved from ${fromColumnId} to ${toColumnId}`);
    // Burada gerçek API çağrısı yapılabilir
  };

  const handleTaskEdit = (task: any) => {
    console.log('Edit task:', task);
    // Task düzenleme modal'ı açılabilir
  };

  const handleTaskDelete = (taskId: string) => {
    console.log('Delete task:', taskId);
    // Task silme onayı alınabilir
  };

  const handleTaskView = (task: any) => {
    console.log('View task:', task);
    // Task detay modal'ı açılabilir
  };

  const handleAddTask = (columnId: string) => {
    console.log('Add task to column:', columnId);
    // Yeni task ekleme modal'ı açılabilir
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">ERP sisteminizin genel durumu</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ara..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GradientCard gradient="blue" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Toplam Kullanıcı</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-blue-100 text-sm flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +{stats.userGrowth}%
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-100" />
              </div>
            </GradientCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GradientCard gradient="green" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Toplam Ürün</p>
                  <p className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</p>
                  <p className="text-green-100 text-sm">Aktif ürünler</p>
                </div>
                <Package className="w-12 h-12 text-green-100" />
              </div>
            </GradientCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GradientCard gradient="purple" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Toplam Sipariş</p>
                  <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</p>
                  <p className="text-purple-100 text-sm flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +{stats.orderGrowth}%
                  </p>
                </div>
                <ShoppingCart className="w-12 h-12 text-purple-100" />
              </div>
            </GradientCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GradientCard gradient="orange" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Toplam Gelir</p>
                  <p className="text-2xl font-bold">₺{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-orange-100 text-sm flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +{stats.revenueGrowth}%
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-orange-100" />
              </div>
            </GradientCard>
          </motion.div>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistem Performansı</h3>
            <div className="space-y-6">
              <div className="text-center">
                <ProgressRing progress={85} size={100} />
                <p className="text-sm text-gray-600 mt-2">CPU Kullanımı</p>
              </div>
              <div className="text-center">
                <ProgressRing progress={62} size={100} color={ProgressRingColors.green} />
                <p className="text-sm text-gray-600 mt-2">RAM Kullanımı</p>
              </div>
              <div className="text-center">
                <ProgressRing progress={78} size={100} color={ProgressRingColors.purple} />
                <p className="text-sm text-gray-600 mt-2">Disk Kullanımı</p>
              </div>
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <DataTable
              data={orders}
              columns={orderColumns}
              searchable={false}
              pagination={false}
              actions={{
                view: (row) => console.log('View order:', row),
                edit: (row) => console.log('Edit order:', row),
                delete: (row) => console.log('Delete order:', row)
              }}
            />
          </motion.div>
        </div>

        {/* Kanban Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Görev Yönetimi</h3>
          <KanbanBoard
            columns={kanbanData}
            onTaskMove={handleTaskMove}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
            onTaskView={handleTaskView}
            onAddTask={handleAddTask}
          />
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={CommonActions.CRUD}
        position="bottom-right"
      />
    </div>
  );
} 