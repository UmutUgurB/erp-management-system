'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  Building, 
  MapPin,
  TrendingUp,
  Calendar,
  Plus
} from 'lucide-react';
import { customerAPI } from '@/lib/api';
import { CustomerStats } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';
import CustomerList from '@/components/Customers/CustomerList';
import CustomerStatsOverview from '@/components/Customers/CustomerStatsOverview';
import CustomerForm from '@/components/Customers/CustomerForm';

export default function CustomersPage() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Müşteri istatistikleri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowCustomerForm(false);
    loadStats();
  };

  const canManageCustomers = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Müşteri Yönetimi
          </h1>
          <p className="text-muted-foreground mt-2">
            Müşteri bilgilerini ve etkileşimlerini yönetin
          </p>
        </div>
        {canManageCustomers && (
          <Button 
            onClick={() => setShowCustomerForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni Müşteri
          </Button>
        )}
      </div>

      {/* Enhanced Stats Cards */}
      {!loading && stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Toplam Müşteri</p>
                <p className="text-3xl font-bold">{stats.totalCustomers}</p>
              </div>
              <div className="p-3 bg-blue-400 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-blue-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+15%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Aktif Müşteri</p>
                <p className="text-3xl font-bold">{stats.activeCustomers}</p>
              </div>
              <div className="p-3 bg-green-400 rounded-full">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-green-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+8%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Yeni Müşteri</p>
                <p className="text-3xl font-bold">{stats.newCustomersThisMonth}</p>
              </div>
              <div className="p-3 bg-purple-400 rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-purple-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+22%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Ortalama Değer</p>
                <p className="text-3xl font-bold">₺{stats.averageCustomerValue?.toLocaleString('tr-TR') || '0'}</p>
              </div>
              <div className="p-3 bg-orange-400 rounded-full">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-orange-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+18%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Insights */}
      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Segmentasyonu</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Premium Müşteriler</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((stats.premiumCustomers / stats.totalCustomers) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Standart Müşteriler</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((stats.standardCustomers / stats.totalCustomers) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Potansiyel Müşteriler</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((stats.potentialCustomers / stats.totalCustomers) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Büyüme</h3>
            <div className="h-48 flex items-end justify-between space-x-2">
              {Array.from({ length: 6 }, (_, i) => {
                const month = new Date();
                month.setMonth(month.getMonth() - (5 - i));
                const monthCustomers = Math.floor(Math.random() * 50) + 20; // Mock data
                const maxCustomers = 70;
                const height = (monthCustomers / maxCustomers) * 100;
                return (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all duration-300 hover:scale-110"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-500">
                      {month.toLocaleDateString('tr-TR', { month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">
            <Users className="mr-2 h-4 w-4" />
            Müşteriler
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analitik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <CustomerList onRefresh={loadStats} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <CustomerStatsOverview />
        </TabsContent>
      </Tabs>

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <CustomerForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowCustomerForm(false)}
          />
        </div>
      )}
    </div>
  );
} 