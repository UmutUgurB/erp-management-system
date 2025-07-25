'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { inventoryAPI } from '@/lib/api';
import { InventoryStats } from '@/types/inventory';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function InventoryStatsOverview() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
      
      const response = await inventoryAPI.getStats(params);
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats?.stats.map(stat => ({
    name: stat._id === 'in' ? 'Giriş' : 
          stat._id === 'out' ? 'Çıkış' : 
          stat._id === 'transfer' ? 'Transfer' : 
          stat._id === 'adjustment' ? 'Düzeltme' : stat._id,
    value: stat.count,
    quantity: stat.totalQuantity,
    amount: stat.totalValue
  })) || [];

  const pieData = stats?.stats.map(stat => ({
    name: stat._id === 'in' ? 'Giriş' : 
          stat._id === 'out' ? 'Çıkış' : 
          stat._id === 'transfer' ? 'Transfer' : 
          stat._id === 'adjustment' ? 'Düzeltme' : stat._id,
    value: stat.count
  })) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">İstatistikler yükleniyor...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Dönem Seçimi</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Dönem seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Son 7 gün</SelectItem>
              <SelectItem value="30">Son 30 gün</SelectItem>
              <SelectItem value="90">Son 90 gün</SelectItem>
              <SelectItem value="365">Son 1 yıl</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Transaction Count Chart */}
      <Card>
        <CardHeader>
          <CardTitle>İşlem Sayıları</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'value' ? `${value} işlem` : 
                  name === 'quantity' ? `${value} adet` : 
                  name === 'amount' ? `₺${value.toLocaleString()}` : value,
                  name === 'value' ? 'İşlem Sayısı' : 
                  name === 'quantity' ? 'Miktar' : 
                  name === 'amount' ? 'Değer' : name
                ]}
              />
              <Bar dataKey="value" fill="#8884d8" name="İşlem Sayısı" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transaction Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>İşlem Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} işlem`, 'Sayı']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Miktar Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} adet`, 'Miktar']} />
                <Bar dataKey="quantity" fill="#00C49F" name="Miktar" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Toplam İşlem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Seçilen dönemde
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Düşük Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.lowStockProducts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ürün stokta az
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Stok Dışı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.outOfStockProducts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ürün stokta yok
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 