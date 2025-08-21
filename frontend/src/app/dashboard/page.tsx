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
  Search,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Star,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { GradientCard } from '@/components/UI/GradientCard';
import { ProgressRing, ProgressRingColors } from '@/components/UI/ProgressRing';
import { FloatingActionButton, CommonActions } from '@/components/UI/FloatingActionButton';
import { DataTable } from '@/components/UI/DataTable';
import { KanbanBoard, KanbanColumns } from '@/components/UI/KanbanBoard';
import { Card3D, Card3DGlass, Card3DGradient } from '@/components/UI/3DCard';
import { AnimatedCounter, CurrencyCounter, PercentageCounter } from '@/components/UI/AnimatedCounter';
import { InteractiveTimeline } from '@/components/UI/InteractiveTimeline';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';

// Enhanced interfaces
interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  userGrowth: number;
  productGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  activeUsers: number;
  conversionRate: number;
  avgOrderValue: number;
  customerSatisfaction: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  priority: 'low' | 'medium' | 'high';
}

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  user?: string;
  status: 'completed' | 'in-progress' | 'pending' | 'cancelled';
  category: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  details?: { key: string; value: string; }[];
}

// Enhanced mock data
const mockStats: DashboardStats = {
  totalUsers: 15420,
  totalProducts: 2847,
  totalOrders: 12543,
  totalRevenue: 2847500,
  userGrowth: 12.5,
  productGrowth: 8.3,
  orderGrowth: 15.7,
  revenueGrowth: 22.1,
  activeUsers: 8920,
  conversionRate: 3.2,
  avgOrderValue: 227,
  customerSatisfaction: 4.8
};

const mockOrders: RecentOrder[] = [
  {
    id: 'ORD-001',
    customer: 'Ahmet Yılmaz',
    product: 'iPhone 15 Pro',
    amount: 45000,
    status: 'delivered',
    date: '2024-01-15',
    priority: 'high'
  },
  {
    id: 'ORD-002',
    customer: 'Fatma Demir',
    product: 'MacBook Air M2',
    amount: 35000,
    status: 'shipped',
    date: '2024-01-14',
    priority: 'medium'
  },
  {
    id: 'ORD-003',
    customer: 'Mehmet Kaya',
    product: 'AirPods Pro',
    amount: 8500,
    status: 'processing',
    date: '2024-01-13',
    priority: 'low'
  },
  {
    id: 'ORD-004',
    customer: 'Ayşe Özkan',
    product: 'iPad Air',
    amount: 18000,
    status: 'pending',
    date: '2024-01-12',
    priority: 'medium'
  },
  {
    id: 'ORD-005',
    customer: 'Ali Veli',
    product: 'Apple Watch',
    amount: 12000,
    status: 'delivered',
    date: '2024-01-11',
    priority: 'high'
  }
];

const mockTimelineData: TimelineItem[] = [
  {
    id: '1',
    title: 'Yeni ürün lansmanı',
    description: 'iPhone 15 Pro Max satışa çıktı',
    date: '2024-01-15',
    time: '09:00',
    category: 'Satış',
    status: 'completed',
    priority: 'high',
    user: 'Satış Ekibi',
    tags: ['lansman', 'yeni ürün'],
    details: [
      { key: 'Stok', value: '150 adet' },
      { key: 'Fiyat', value: '₺55.000' }
    ]
  },
  {
    id: '2',
    title: 'Müşteri toplantısı',
    description: 'Kurumsal müşteri ile görüşme',
    date: '2024-01-15',
    time: '14:00',
    location: 'İstanbul Ofis',
    category: 'Müşteri İlişkileri',
    status: 'in-progress',
    priority: 'medium',
    user: 'Satış Müdürü',
    tags: ['toplantı', 'kurumsal']
  },
  {
    id: '3',
    title: 'Envanter kontrolü',
    description: 'Aylık stok sayımı yapıldı',
    date: '2024-01-14',
    category: 'Envanter',
    status: 'completed',
    priority: 'low',
    user: 'Depo Sorumlusu',
    tags: ['envanter', 'stok']
  },
  {
    id: '4',
    title: 'Yazılım güncellemesi',
    description: 'ERP sistemi v2.1 yayınlandı',
    date: '2024-01-13',
    category: 'Teknoloji',
    status: 'completed',
    priority: 'high',
    user: 'Geliştirici Ekibi',
    tags: ['güncelleme', 'sistem']
  }
];

const mockKanbanData = [
  {
    id: 'todo',
    title: 'Yapılacak',
    color: 'bg-gray-500',
    tasks: [
      {
        id: 'task-1',
        title: 'Müşteri geri bildirimlerini değerlendir',
        description: 'Son 30 günde gelen geri bildirimleri analiz et',
        priority: 'medium',
        assignee: 'Müşteri Hizmetleri',
        dueDate: '2024-01-20',
        tags: ['analiz', 'müşteri']
      },
      {
        id: 'task-2',
        title: 'Yeni satış stratejisi geliştir',
        description: 'Q1 için satış hedeflerini belirle',
        priority: 'high',
        assignee: 'Satış Ekibi',
        dueDate: '2024-01-25',
        tags: ['strateji', 'satış']
      }
    ]
  },
  {
    id: 'in-progress',
    title: 'Devam Ediyor',
    color: 'bg-blue-500',
    tasks: [
      {
        id: 'task-3',
        title: 'Web sitesi yenileme',
        description: 'Ana sayfa tasarımını güncelle',
        priority: 'medium',
        assignee: 'Tasarım Ekibi',
        dueDate: '2024-01-30',
        tags: ['tasarım', 'web']
      }
    ]
  },
  {
    id: 'review',
    title: 'İnceleme',
    color: 'bg-yellow-500',
    tasks: [
      {
        id: 'task-4',
        title: 'Yeni ürün katalog tasarımı',
        description: '2024 ürün kataloğu için tasarım önerileri',
        priority: 'low',
        assignee: 'Pazarlama',
        dueDate: '2024-02-05',
        tags: ['katalog', 'tasarım']
      }
    ]
  },
  {
    id: 'done',
    title: 'Tamamlandı',
    color: 'bg-green-500',
    tasks: [
      {
        id: 'task-5',
        title: 'Yıl sonu raporu',
        description: '2023 yılı satış ve performans raporu',
        priority: 'high',
        assignee: 'Finans Ekibi',
        dueDate: '2024-01-10',
        tags: ['rapor', 'finans']
      }
    ]
  }
];

// Table columns
const orderColumns = [
  { key: 'id', header: 'Sipariş No', width: 'w-24' },
  { key: 'customer', header: 'Müşteri', width: 'w-32' },
  { key: 'product', header: 'Ürün', width: 'w-40' },
  { 
    key: 'amount', 
    header: 'Tutar', 
    width: 'w-24',
    render: (value: number) => `₺${value.toLocaleString()}`
  },
  { 
    key: 'status', 
    header: 'Durum', 
    width: 'w-28',
    render: (value: string) => {
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
      };
      const statusLabels = {
        pending: 'Bekliyor',
        processing: 'İşleniyor',
        shipped: 'Kargoda',
        delivered: 'Teslim Edildi',
        cancelled: 'İptal'
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
          {statusLabels[value as keyof typeof statusLabels]}
        </span>
      );
    }
  },
  { 
    key: 'date', 
    header: 'Tarih', 
    width: 'w-28',
    render: (value: string) => new Date(value).toLocaleDateString('tr-TR')
  }
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [orders, setOrders] = useState<RecentOrder[]>(mockOrders);
  const [kanbanData, setKanbanData] = useState(mockKanbanData);
  const [selectedView, setSelectedView] = useState<'overview' | 'analytics' | 'timeline'>('overview');

  // Handle functions for Kanban
  const handleTaskMove = (taskId: string, fromColumnId: string, toColumnId: string) => {
    console.log(`Task ${taskId} moved from ${fromColumnId} to ${toColumnId}`);
  };

  const handleTaskEdit = (task: any) => {
    console.log('Edit task:', task);
  };

  const handleTaskDelete = (taskId: string) => {
    console.log('Delete task:', taskId);
  };

  const handleTaskView = (task: any) => {
    console.log('View task:', task);
  };

  const handleAddTask = (columnId: string) => {
    console.log('Add task to column:', columnId);
  };

  const handleTimelineItemClick = (item: TimelineItem) => {
    console.log('Timeline item clicked:', item);
  };

  const handleTimelineStatusChange = (itemId: string, status: TimelineItem['status']) => {
    console.log(`Timeline item ${itemId} status changed to ${status}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">ERP sisteminizin genel durumu ve performansı</p>
          </div>

          <div className="flex items-center gap-4">
            {/* View selector */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm border">
              {[
                { key: 'overview', label: 'Genel Bakış', icon: BarChart3 },
                { key: 'analytics', label: 'Analitik', icon: PieChart },
                { key: 'timeline', label: 'Zaman Çizelgesi', icon: Clock }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedView(key as any)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                    selectedView === key
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ara..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>

            <button className="p-2 text-gray-600 hover:bg-white/80 rounded-lg backdrop-blur-sm transition-all">
              <Bell className="w-5 h-5" />
            </button>

            <button className="p-2 text-gray-600 hover:bg-white/80 rounded-lg backdrop-blur-sm transition-all">
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
            <Card3DGradient gradient="from-blue-500 to-blue-600" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Toplam Kullanıcı</p>
                  <AnimatedCounter
                    value={stats.totalUsers}
                    size="lg"
                    className="text-white"
                    showIcon
                    icon={<Users className="w-6 h-6" />}
                    iconPosition="right"
                  />
                  <p className="text-blue-100 text-sm flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4" />
                    <PercentageCounter value={stats.userGrowth} size="sm" />
                  </p>
                </div>
              </div>
            </Card3DGradient>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card3DGradient gradient="from-green-500 to-green-600" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Toplam Gelir</p>
                  <CurrencyCounter
                    value={stats.totalRevenue}
                    size="lg"
                    className="text-white"
                    showIcon
                    icon={<DollarSign className="w-6 h-6" />}
                    iconPosition="right"
                  />
                  <p className="text-green-100 text-sm flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4" />
                    <PercentageCounter value={stats.revenueGrowth} size="sm" />
                  </p>
                </div>
              </div>
            </Card3DGradient>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card3DGradient gradient="from-purple-500 to-purple-600" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Toplam Sipariş</p>
                  <AnimatedCounter
                    value={stats.totalOrders}
                    size="lg"
                    className="text-white"
                    showIcon
                    icon={<ShoppingCart className="w-6 h-6" />}
                    iconPosition="right"
                  />
                  <p className="text-purple-100 text-sm flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4" />
                    <PercentageCounter value={stats.orderGrowth} size="sm" />
                  </p>
                </div>
              </div>
            </Card3DGradient>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card3DGradient gradient="from-orange-500 to-orange-600" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Müşteri Memnuniyeti</p>
                  <div className="flex items-center gap-2">
                    <AnimatedCounter
                      value={stats.customerSatisfaction}
                      size="lg"
                      className="text-white"
                      decimalPlaces={1}
                    />
                    <Star className="w-6 h-6 text-yellow-300" />
                  </div>
                  <p className="text-orange-100 text-sm flex items-center gap-1 mt-1">
                    <Target className="w-4 h-4" />
                    Hedef: 5.0
                  </p>
                </div>
              </div>
            </Card3DGradient>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card3D className="h-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Sistem Performansı
              </h3>
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
            </Card3D>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card3D className="h-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                Son Siparişler
              </h3>
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
            </Card3D>
          </motion.div>
        </div>

        {/* Content based on selected view */}
        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Kanban Board */}
              <Card3D className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  Görev Yönetimi
                </h3>
                <KanbanBoard
                  columns={kanbanData}
                  onTaskMove={handleTaskMove}
                  onTaskEdit={handleTaskEdit}
                  onTaskDelete={handleTaskDelete}
                  onTaskView={handleTaskView}
                  onAddTask={handleAddTask}
                />
              </Card3D>
            </motion.div>
          )}

          {selectedView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <Card3D className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-500" />
                  Satış Analizi
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">Aktif Kullanıcılar</span>
                    <AnimatedCounter value={stats.activeUsers} size="md" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-700">Dönüşüm Oranı</span>
                    <PercentageCounter value={stats.conversionRate} size="md" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-700">Ortalama Sipariş</span>
                    <CurrencyCounter value={stats.avgOrderValue} size="md" />
                  </div>
                </div>
              </Card3D>

              <Card3D className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Büyüme Metrikleri
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Kullanıcı Büyümesi</span>
                    <PercentageCounter value={stats.userGrowth} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ürün Büyümesi</span>
                    <PercentageCounter value={stats.productGrowth} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sipariş Büyümesi</span>
                    <PercentageCounter value={stats.orderGrowth} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Gelir Büyümesi</span>
                    <PercentageCounter value={stats.revenueGrowth} size="sm" />
                  </div>
                </div>
              </Card3D>
            </motion.div>
          )}

          {selectedView === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card3D className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Aktivite Zaman Çizelgesi
                </h3>
                <InteractiveTimeline
                  items={mockTimelineData}
                  onItemClick={handleTimelineItemClick}
                  onStatusChange={handleTimelineStatusChange}
                  maxItems={10}
                />
              </Card3D>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={CommonActions.CRUD}
        position="bottom-right"
      />
    </div>
  );
} 