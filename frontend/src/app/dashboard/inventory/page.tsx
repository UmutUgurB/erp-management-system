'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  ArrowUpDown, 
  ClipboardList, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { inventoryAPI } from '@/lib/api';
import { InventoryStats } from '@/types/inventory';
import InventoryTransactions from '@/components/Inventory/InventoryTransactions';
import InventoryStatsOverview from '@/components/Inventory/InventoryStatsOverview';
import StockCountList from '@/components/Inventory/StockCountList';
import StockInForm from '@/components/Inventory/StockInForm';
import StockOutForm from '@/components/Inventory/StockOutForm';
import StockAlerts from '@/components/Inventory/StockAlerts';
import { useAuth } from '@/context/AuthContext';

export default function InventoryPage() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStockInForm, setShowStockInForm] = useState(false);
  const [showStockOutForm, setShowStockOutForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Stats yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const canManageInventory = user?.role === 'admin' || user?.role === 'manager';

  const handleFormSuccess = () => {
    setShowStockInForm(false);
    setShowStockOutForm(false);
    loadStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Envanter Yönetimi
          </h1>
          <p className="text-muted-foreground mt-2">
            Stok giriş/çıkış, transfer ve sayım işlemlerini yönetin
          </p>
        </div>
        {canManageInventory && (
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowStockInForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Stok Girişi
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowStockOutForm(true)}
              className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 transform hover:scale-105 transition-all duration-200"
            >
              <Package className="mr-2 h-4 w-4" />
              Stok Çıkışı
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 transform hover:scale-105 transition-all duration-200"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Sayım Oluştur
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Stats Cards */}
      {!loading && stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Toplam İşlem</p>
                <p className="text-3xl font-bold">{stats.totalTransactions}</p>
              </div>
              <div className="p-3 bg-blue-400 rounded-full">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-blue-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+12%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Stok Girişi</p>
                <p className="text-3xl font-bold">{stats.stockInCount}</p>
              </div>
              <div className="p-3 bg-green-400 rounded-full">
                <ArrowUpDown className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-green-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+18%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Stok Çıkışı</p>
                <p className="text-3xl font-bold">{stats.stockOutCount}</p>
              </div>
              <div className="p-3 bg-orange-400 rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-orange-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+8%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Aktif Sayım</p>
                <p className="text-3xl font-bold">{stats.activeStockCounts}</p>
              </div>
              <div className="p-3 bg-purple-400 rounded-full">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-purple-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+15%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Insights */}
      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stok Hareket Analizi</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Giriş İşlemleri</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.stockInCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Çıkış İşlemleri</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.stockOutCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Transfer İşlemleri</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.transferCount || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Stok Trendi</h3>
            <div className="h-48 flex items-end justify-between space-x-2">
              {Array.from({ length: 6 }, (_, i) => {
                const month = new Date();
                month.setMonth(month.getMonth() - (5 - i));
                const monthTransactions = Math.floor(Math.random() * 100) + 50; // Mock data
                const maxTransactions = 150;
                const height = (monthTransactions / maxTransactions) * 100;
                return (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-300 hover:scale-110"
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
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            İşlemler
          </TabsTrigger>
          <TabsTrigger value="stockcounts">
            <ClipboardList className="mr-2 h-4 w-4" />
            Stok Sayımları
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Uyarılar
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analitik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <InventoryTransactions />
        </TabsContent>

        <TabsContent value="stockcounts" className="space-y-4">
          <StockCountList />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <StockAlerts />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <InventoryStatsOverview />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showStockInForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <StockInForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowStockInForm(false)}
          />
        </div>
      )}

      {showStockOutForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <StockOutForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowStockOutForm(false)}
          />
        </div>
      )}
    </div>
  );
} 