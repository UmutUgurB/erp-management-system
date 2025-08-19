'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
  users: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
  orders: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
  inventory: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
  timeSeriesData: Array<{
    date: string;
    revenue: number;
    orders: number;
    users: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    value: number;
    color: string;
  }>;
}

interface AnalyticsFilters {
  period: '7d' | '30d' | '90d' | '1y';
  metric: 'revenue' | 'orders' | 'users' | 'inventory';
  groupBy: 'day' | 'week' | 'month';
}

const AdvancedAnalytics: React.FC = () => {
  const { settings } = useTheme();
  const { addSuccessNotification, addErrorNotification } = useNotifications();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    period: '30d',
    metric: 'revenue',
    groupBy: 'day'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'pie'>('line');

  // Mock data generation
  const generateMockData = useCallback((period: string): AnalyticsData => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const baseRevenue = 50000;
    const baseOrders = 150;
    const baseUsers = 1200;

    const timeSeriesData = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      const trendFactor = 1 + (i / days) * 0.3; // Gradual growth trend
      
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.round(baseRevenue * randomFactor * trendFactor),
        orders: Math.round(baseOrders * randomFactor * trendFactor),
        users: Math.round(baseUsers * randomFactor * trendFactor),
      };
    });

    const currentRevenue = timeSeriesData[timeSeriesData.length - 1]?.revenue || baseRevenue;
    const previousRevenue = timeSeriesData[Math.floor(timeSeriesData.length / 2)]?.revenue || baseRevenue;
    const revenueChange = ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    return {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        change: Math.abs(revenueChange),
        trend: revenueChange >= 0 ? 'up' : 'down'
      },
      users: {
        current: timeSeriesData[timeSeriesData.length - 1]?.users || baseUsers,
        previous: timeSeriesData[Math.floor(timeSeriesData.length / 2)]?.users || baseUsers,
        change: Math.abs(((timeSeriesData[timeSeriesData.length - 1]?.users || baseUsers) - (timeSeriesData[Math.floor(timeSeriesData.length / 2)]?.users || baseUsers)) / (timeSeriesData[Math.floor(timeSeriesData.length / 2)]?.users || baseUsers)) * 100),
        trend: 'up'
      },
      orders: {
        current: timeSeriesData[timeSeriesData.length - 1]?.orders || baseOrders,
        previous: timeSeriesData[Math.floor(timeSeriesData.length / 2)]?.orders || baseOrders,
        change: Math.abs(((timeSeriesData[timeSeriesData.length - 1]?.orders || baseOrders) - (timeSeriesData[Math.floor(timeSeriesData.length / 2)]?.orders || baseOrders)) / (timeSeriesData[Math.floor(timeSeriesData.length / 2)]?.orders || baseOrders)) * 100),
        trend: 'up'
      },
      inventory: {
        current: 850,
        previous: 800,
        change: 6.25,
        trend: 'up'
      },
      timeSeriesData,
      topProducts: [
        { name: 'Product A', sales: 1250, revenue: 25000, growth: 15.5 },
        { name: 'Product B', sales: 980, revenue: 19600, growth: 8.2 },
        { name: 'Product C', sales: 750, revenue: 15000, growth: 22.1 },
        { name: 'Product D', sales: 620, revenue: 12400, growth: -3.2 },
        { name: 'Product E', sales: 480, revenue: 9600, growth: 12.8 },
      ],
      categoryDistribution: [
        { category: 'Electronics', value: 35, color: '#3B82F6' },
        { category: 'Clothing', value: 25, color: '#10B981' },
        { category: 'Home & Garden', value: 20, color: '#F59E0B' },
        { category: 'Sports', value: 15, color: '#EF4444' },
        { category: 'Books', value: 5, color: '#8B5CF6' },
      ]
    };
  }, []);

  useEffect(() => {
    loadData();
  }, [filters, generateMockData]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockData(filters.period);
      setData(mockData);
      addSuccessNotification('Analytics Updated', 'Data has been refreshed successfully');
    } catch (error) {
      addErrorNotification('Analytics Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const exportData = () => {
    if (!data) return;
    
    const csvContent = generateCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${filters.period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    addSuccessNotification('Export Successful', 'Analytics data exported to CSV');
  };

  const generateCSV = (data: AnalyticsData): string => {
    const headers = ['Date', 'Revenue', 'Orders', 'Users'];
    const rows = data.timeSeriesData.map(row => [
      row.date,
      row.revenue,
      row.orders,
      row.users
    ]);
    
    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    trend, 
    icon: Icon, 
    color 
  }: {
    title: string;
    value: number;
    change: number;
    trend: 'up' | 'down';
    icon: React.ComponentType<any>;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border ${
        settings.theme === 'dark' 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      } shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${
            settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${
            settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {title === 'Revenue' ? `$${value.toLocaleString()}` : value.toLocaleString()}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="flex items-center mt-4">
        {trend === 'up' ? (
          <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
        )}
        <span className={`text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change.toFixed(1)}%
        </span>
        <span className={`text-sm ml-2 ${
          settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          vs last period
        </span>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className={`${
            settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className={`${
          settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          No analytics data available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${
            settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Advanced Analytics
          </h1>
          <p className={`mt-1 ${
            settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Comprehensive business insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              settings.theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg border ${
        settings.theme === 'dark' 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className={`text-sm font-medium ${
              settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Filters:
            </span>
          </div>
          
          <select
            value={filters.period}
            onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value as any }))}
            className={`px-3 py-2 rounded-md border text-sm ${
              settings.theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <select
            value={filters.metric}
            onChange={(e) => setFilters(prev => ({ ...prev, metric: e.target.value as any }))}
            className={`px-3 py-2 rounded-md border text-sm ${
              settings.theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
            <option value="users">Users</option>
            <option value="inventory">Inventory</option>
          </select>
          
          <select
            value={filters.groupBy}
            onChange={(e) => setFilters(prev => ({ ...prev, groupBy: e.target.value as any }))}
            className={`px-3 py-2 rounded-md border text-sm ${
              settings.theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="day">By Day</option>
            <option value="week">By Week</option>
            <option value="month">By Month</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={data.revenue.current}
          change={data.revenue.change}
          trend={data.revenue.trend}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Active Users"
          value={data.users.current}
          change={data.users.change}
          trend={data.users.trend}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Orders"
          value={data.orders.current}
          change={data.orders.change}
          trend={data.orders.trend}
          icon={ShoppingCart}
          color="bg-purple-500"
        />
        <StatCard
          title="Inventory Items"
          value={data.inventory.current}
          change={data.inventory.change}
          trend={data.inventory.trend}
          icon={Package}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-6 rounded-xl border ${
            settings.theme === 'dark' 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {filters.metric.charAt(0).toUpperCase() + filters.metric.slice(1)} Over Time
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedChart('line')}
                className={`p-2 rounded-md transition-colors ${
                  selectedChart === 'line'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <LineChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedChart('bar')}
                className={`p-2 rounded-md transition-colors ${
                  selectedChart === 'bar'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className={`${
                settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
              }`}>
                {selectedChart === 'line' ? 'Line Chart' : 'Bar Chart'} - {filters.metric}
              </p>
              <p className={`text-sm ${
                settings.theme === 'dark' ? 'text-gray-600' : 'text-gray-500'
              }`}>
                Interactive chart visualization would be implemented here
              </p>
            </div>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-6 rounded-xl border ${
            settings.theme === 'dark' 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${
              settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Category Distribution
            </h3>
            <button
              onClick={() => setSelectedChart('pie')}
              className={`p-2 rounded-md transition-colors ${
                selectedChart === 'pie'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <PieChart className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {data.categoryDistribution.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className={`text-sm ${
                    settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {category.category}
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {category.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl border ${
          settings.theme === 'dark' 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        <h3 className={`text-lg font-semibold mb-6 ${
          settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Top Performing Products
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${
                settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <th className={`text-left py-3 px-4 font-medium ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Product
                </th>
                <th className={`text-left py-3 px-4 font-medium ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Sales
                </th>
                <th className={`text-left py-3 px-4 font-medium ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Revenue
                </th>
                <th className={`text-left py-3 px-4 font-medium ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((product, index) => (
                <tr key={product.name} className={`border-b ${
                  settings.theme === 'dark' ? 'border-gray-800' : 'border-gray-100'
                }`}>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {product.name}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`${
                      settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {product.sales.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${product.revenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1 ${
                      product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {Math.abs(product.growth)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedAnalytics; 