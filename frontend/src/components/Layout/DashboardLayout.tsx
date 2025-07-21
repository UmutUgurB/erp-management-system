'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  BarChart3,
  Database,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Ürünler', href: '/dashboard/products', icon: Package },
  { name: 'Siparişler', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Kullanıcılar', href: '/dashboard/users', icon: Users, adminOnly: true },
  { name: 'Backup', href: '/dashboard/backup', icon: Database, adminOnly: true },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const filteredNavigation = navigationItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <Sidebar navigation={filteredNavigation} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <Sidebar navigation={filteredNavigation} />
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 md:ml-64">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <h1 className="text-lg font-semibold text-gray-900 ml-3">
                      ERP Sistemi
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

interface SidebarProps {
  navigation: Array<{
    name: string;
    href: string;
    icon: any;
    adminOnly?: boolean;
  }>;
}

function Sidebar({ navigation }: SidebarProps) {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <span className="ml-2 text-lg font-semibold text-gray-900">ERP</span>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full text-left"
              >
                <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 