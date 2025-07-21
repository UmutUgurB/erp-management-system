'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import PDFExport from '@/components/UI/PDFExport';
import DataExport from '@/components/UI/DataExport';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';

interface ReportData {
  salesReport: any[];
  productReport: any[];
  orderReport: any[];
  userReport: any[];
  inventoryReport: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Mock data - gerçek uygulamada API'den gelecek
      const mockData: ReportData = {
        salesReport: [
          { month: 'Ocak', sales: 45000, orders: 120, avgOrder: 375 },
          { month: 'Şubat', sales: 52000, orders: 145, avgOrder: 359 },
          { month: 'Mart', sales: 48000, orders: 130, avgOrder: 369 },
          { month: 'Nisan', sales: 61000, orders: 165, avgOrder: 370 },
          { month: 'Mayıs', sales: 55000, orders: 150, avgOrder: 367 },
          { month: 'Haziran', sales: 67000, orders: 180, avgOrder: 372 },
        ],
        productReport: [
          { name: 'Laptop', sales: 45, revenue: 225000, stock: 12 },
          { name: 'Mouse', sales: 120, revenue: 24000, stock: 85 },
          { name: 'Keyboard', sales: 78, revenue: 46800, stock: 32 },
          { name: 'Monitor', sales: 34, revenue: 102000, stock: 8 },
          { name: 'Headphones', sales: 95, revenue: 28500, stock: 45 },
        ],
        orderReport: [
          { status: 'Beklemede', count: 25, percentage: 15 },
          { status: 'İşleniyor', count: 45, percentage: 27 },
          { status: 'Kargoda', count: 35, percentage: 21 },
          { status: 'Teslim Edildi', count: 55, percentage: 33 },
          { status: 'İptal Edildi', count: 8, percentage: 4 },
        ],
        userReport: [
          { month: 'Ocak', newUsers: 25, activeUsers: 180, totalUsers: 1200 },
          { month: 'Şubat', newUsers: 30, activeUsers: 195, totalUsers: 1230 },
          { month: 'Mart', newUsers: 28, activeUsers: 210, totalUsers: 1258 },
          { month: 'Nisan', newUsers: 35, activeUsers: 225, totalUsers: 1293 },
          { month: 'Mayıs', newUsers: 32, activeUsers: 240, totalUsers: 1325 },
          { month: 'Haziran', newUsers: 40, activeUsers: 260, totalUsers: 1365 },
        ],
        inventoryReport: [
          { category: 'Elektronik', inStock: 450, lowStock: 25, outOfStock: 5 },
          { category: 'Giyim', inStock: 320, lowStock: 15, outOfStock: 3 },
          { category: 'Kitap', inStock: 280, lowStock: 8, outOfStock: 2 },
          { category: 'Spor', inStock: 190, lowStock: 12, outOfStock: 4 },
          { category: 'Ev & Bahçe', inStock: 150, lowStock: 18, outOfStock: 6 },
        ],
      };
      
      setReportData(mockData);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReportColumns = () => {
    switch (selectedReport) {
      case 'sales':
        return [
          { key: 'month', label: 'Ay', export: true },
          { key: 'sales', label: 'Satış (₺)', export: true, formatter: (value: number) => `₺${value.toLocaleString('tr-TR')}` },
          { key: 'orders', label: 'Sipariş Sayısı', export: true },
          { key: 'avgOrder', label: 'Ort. Sipariş (₺)', export: true, formatter: (value: number) => `₺${value.toLocaleString('tr-TR')}` },
        ];
      case 'products':
        return [
          { key: 'name', label: 'Ürün Adı', export: true },
          { key: 'sales', label: 'Satış Adedi', export: true },
          { key: 'revenue', label: 'Gelir (₺)', export: true, formatter: (value: number) => `₺${value.toLocaleString('tr-TR')}` },
          { key: 'stock', label: 'Stok', export: true },
        ];
      case 'orders':
        return [
          { key: 'status', label: 'Durum', export: true },
          { key: 'count', label: 'Sipariş Sayısı', export: true },
          { key: 'percentage', label: 'Yüzde (%)', export: true, formatter: (value: number) => `%${value}` },
        ];
      case 'users':
        return [
          { key: 'month', label: 'Ay', export: true },
          { key: 'newUsers', label: 'Yeni Kullanıcı', export: true },
          { key: 'activeUsers', label: 'Aktif Kullanıcı', export: true },
          { key: 'totalUsers', label: 'Toplam Kullanıcı', export: true },
        ];
      case 'inventory':
        return [
          { key: 'category', label: 'Kategori', export: true },
          { key: 'inStock', label: 'Stokta', export: true },
          { key: 'lowStock', label: 'Düşük Stok', export: true },
          { key: 'outOfStock', label: 'Stok Yok', export: true },
        ];
      default:
        return [];
    }
  };

  const getReportData = () => {
    if (!reportData) return [];
    
    switch (selectedReport) {
      case 'sales':
        return reportData.salesReport;
      case 'products':
        return reportData.productReport;
      case 'orders':
        return reportData.orderReport;
      case 'users':
        return reportData.userReport;
      case 'inventory':
        return reportData.inventoryReport;
      default:
        return [];
    }
  };

  const getReportTitle = () => {
    switch (selectedReport) {
      case 'sales':
        return 'Satış Raporu';
      case 'products':
        return 'Ürün Raporu';
      case 'orders':
        return 'Sipariş Raporu';
      case 'users':
        return 'Kullanıcı Raporu';
      case 'inventory':
        return 'Envanter Raporu';
      default:
        return 'Rapor';
    }
  };

  const renderChart = () => {
    if (!reportData) return null;

    switch (selectedReport) {
      case 'sales':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Aylık Satış Trendi</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={reportData.salesReport}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₺${value.toLocaleString('tr-TR')}`, 'Satış']} />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sipariş Sayısı</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.salesReport}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ürün Performansı</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportData.productReport} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => [value, 'Satış Adedi']} />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'orders':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sipariş Durumu Dağılımı</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={reportData.orderReport}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status} %${percentage}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {reportData.orderReport.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'users':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kullanıcı Büyüme Trendi</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={reportData.userReport}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newUsers" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="activeUsers" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="totalUsers" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'inventory':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kategori Bazında Stok Durumu</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportData.inventoryReport}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="inStock" fill="#00C49F" name="Stokta" />
                <Bar dataKey="lowStock" fill="#FFBB28" name="Düşük Stok" />
                <Bar dataKey="outOfStock" fill="#FF8042" name="Stok Yok" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
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
            <h1 className="text-2xl font-semibold text-gray-900">Gelişmiş Raporlar</h1>
            <p className="mt-2 text-sm text-gray-700">
              Detaylı analiz ve raporlama araçları
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
            <PDFExport
              data={getReportData()}
              columns={getReportColumns()}
              filename={selectedReport}
              title={getReportTitle()}
            />
            <DataExport
              data={getReportData()}
              filename={selectedReport}
              columns={getReportColumns()}
              exportFormats={['csv', 'excel']}
            />
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Rapor Türü</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { id: 'sales', name: 'Satış', icon: TrendingUp },
                { id: 'products', name: 'Ürün', icon: Package },
                { id: 'orders', name: 'Sipariş', icon: ShoppingCart },
                { id: 'users', name: 'Kullanıcı', icon: Users },
                { id: 'inventory', name: 'Envanter', icon: BarChart3 },
              ].map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedReport === report.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <report.icon className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-sm font-medium">{report.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Tarih Aralığı
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-8">
          {renderChart()}
        </div>

        {/* Data Table */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {getReportTitle()} - Veri Tablosu
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {dateRange.startDate} - {dateRange.endDate} tarih aralığı
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {getReportColumns().map((column) => (
                        <th
                          key={column.key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getReportData().map((row, index) => (
                      <tr key={index}>
                        {getReportColumns().map((column) => (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {column.formatter ? column.formatter(row[column.key]) : row[column.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 