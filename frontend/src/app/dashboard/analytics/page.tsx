'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { ordersAPI, productsAPI } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Calendar, TrendingUp, Package, DollarSign } from 'lucide-react';

interface AnalyticsData {
  monthlySales: Array<{ month: string; sales: number }>;
  productPerformance: Array<{ name: string; sales: number; revenue: number }>;
  orderStatus: Array<{ status: string; count: number }>;
  stockLevels: Array<{ category: string; inStock: number; lowStock: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    monthlySales: [],
    productPerformance: [],
    orderStatus: [],
    stockLevels: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        ordersAPI.getOrders(),
        productsAPI.getProducts(),
      ]);

      const orders = ordersRes.data.orders || [];
      const products = productsRes.data.products || [];

      // Monthly sales data
      const monthlySales = generateMonthlySales(orders);
      
      // Product performance
      const productPerformance = generateProductPerformance(orders, products);
      
      // Order status distribution
      const orderStatus = generateOrderStatus(orders);
      
      // Stock levels by category
      const stockLevels = generateStockLevels(products);

      setData({
        monthlySales,
        productPerformance,
        orderStatus,
        stockLevels,
      });
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlySales = (orders: any[]) => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    return months.map(month => ({
      month,
      sales: Math.floor(Math.random() * 10000) + 5000, // Mock data
    }));
  };

  const generateProductPerformance = (orders: any[], products: any[]) => {
    return products.slice(0, 10).map(product => ({
      name: product.name,
      sales: Math.floor(Math.random() * 100) + 10,
      revenue: Math.floor(Math.random() * 5000) + 1000,
    }));
  };

  const generateOrderStatus = (orders: any[]) => {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return statuses.map(status => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count: Math.floor(Math.random() * 50) + 5,
    }));
  };

  const generateStockLevels = (products: any[]) => {
    const categories = ['Elektronik', 'Giyim', 'Ev & Yaşam', 'Spor', 'Kitap'];
    return categories.map(category => ({
      category,
      inStock: Math.floor(Math.random() * 1000) + 100,
      lowStock: Math.floor(Math.random() * 50) + 5,
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            <p className="mt-2 text-sm text-gray-700">
              Satış performansı, stok durumu ve iş metrikleri
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="7">Son 7 gün</option>
              <option value="30">Son 30 gün</option>
              <option value="90">Son 90 gün</option>
              <option value="365">Son 1 yıl</option>
            </select>
          </div>
        </div>

        {/* Monthly Sales Chart */}
        <div className="mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Aylık Satış Grafiği
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₺${value.toLocaleString('tr-TR')}`, 'Satış']} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Performance */}
        <div className="mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Ürün Performansı
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.productPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Satış Adedi']} />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status and Stock Levels */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sipariş Durumu Dağılımı</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.orderStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.orderStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stock Levels by Category */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Kategori Bazında Stok Durumu</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.stockLevels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="inStock" fill="#00C49F" name="Stokta" />
                <Bar dataKey="lowStock" fill="#FFBB28" name="Düşük Stok" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Anahtar Metrikler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Toplam Satış</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ₺{data.monthlySales.reduce((sum, item) => sum + item.sales, 0).toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Ortalama Sipariş Değeri</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ₺{(data.monthlySales.reduce((sum, item) => sum + item.sales, 0) / 12).toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">En Çok Satan Ürün</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.productPerformance[0]?.name || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 