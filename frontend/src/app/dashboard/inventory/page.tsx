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
import { useAuth } from '@/context/AuthContext';

export default function InventoryPage() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Envanter Yönetimi</h1>
          <p className="text-muted-foreground">
            Stok giriş/çıkış, transfer ve sayım işlemlerini yönetin
          </p>
        </div>
        {canManageInventory && (
          <div className="flex gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Stok Girişi
            </Button>
            <Button variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              Sayım Oluştur
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {!loading && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam İşlem</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                Tüm zamanlar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Düşük Stok</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.lowStockProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                Ürün stokta az
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stok Dışı</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.outOfStockProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                Ürün stokta yok
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Değer</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₺{stats.stats.reduce((sum, stat) => sum + stat.totalValue, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Stok değeri
              </p>
            </CardContent>
          </Card>
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

        <TabsContent value="analytics" className="space-y-4">
          <InventoryStatsOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
} 