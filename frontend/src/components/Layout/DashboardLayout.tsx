'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useNotifications } from '@/hooks/useNotifications';
import ThemeToggle from '@/components/UI/ThemeToggle';
import NotificationManager from '@/components/UI/NotificationManager';
import PWAInstallBanner, { PWAStatusIndicator } from '@/components/UI/PWAInstallBanner';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Warehouse,
  DollarSign,
  FolderOpen,
  CheckSquare,
  Building,
  FileText,
  Bell,
  User,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Ürünler', href: '/dashboard/products', icon: Package },
  { name: 'Siparişler', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Müşteriler', href: '/dashboard/customers', icon: Users },
  { name: 'Envanter', href: '/dashboard/inventory', icon: Warehouse },
  { name: 'Faturalar', href: '/dashboard/financial', icon: DollarSign },
  { name: 'Projeler', href: '/dashboard/projects', icon: FolderOpen },
  { name: 'Görevler', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Varlıklar', href: '/dashboard/assets', icon: Building },
  { name: 'Raporlar', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Initialize real-time notifications
  const { isConnected } = useRealtimeNotifications();
  
  // Initialize notification system
  const { notifications, removeNotification } = useNotifications();

  useEffect(() => {
    // Get user from localStorage or context
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              ERP System
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-5 px-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name || 'Kullanıcı'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role || 'Kullanıcı'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isConnected ? 'Bağlı' : 'Bağlantı Yok'}
                </span>
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Theme toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Notification System */}
      <NotificationManager 
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* PWA Status Indicator */}
      <PWAStatusIndicator />
    </div>
  );
} 