'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { payrollAPI } from '@/lib/api';
import PayrollOverview from '@/components/Payroll/PayrollOverview';
import PayrollTable from '@/components/Payroll/PayrollTable';
import PayrollFilters from '@/components/Payroll/PayrollFilters';
import PayrollStats from '@/components/Payroll/PayrollStats';
import AnimatedLoading from '@/components/UI/AnimatedLoading';
import { DollarSign, Users, TrendingUp, Calendar, Download, Plus, FileText } from 'lucide-react';

export default function PayrollPage() {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    employee: '',
    department: '',
    status: ''
  });

  useEffect(() => {
    fetchPayrollData();
    fetchStats();
  }, [filters]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const response = await payrollAPI.getPayroll(filters);
      setPayroll(response.data.payroll);
    } catch (error) {
      console.error('Failed to fetch payroll data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await payrollAPI.getStats(filters);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch payroll stats:', error);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleBulkCreate = async () => {
    try {
      await payrollAPI.bulkCreate({
        month: filters.month,
        year: filters.year
      });
      fetchPayrollData();
      fetchStats();
    } catch (error) {
      console.error('Failed to bulk create payroll:', error);
    }
  };

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    const data = payroll.map(p => ({
      employee: `${p.employee.firstName} ${p.employee.lastName}`,
      department: p.employee.department,
      month: p.month,
      year: p.year,
      baseSalary: p.baseSalary,
      grossSalary: p.grossSalary,
      overtimePay: p.overtimePay,
      bonus: p.bonus,
      allowance: p.allowance,
      totalDeductions: p.totalDeductions,
      netSalary: p.netSalary,
      paymentStatus: p.paymentStatus,
      totalWorkDays: p.totalWorkDays,
      totalWorkHours: p.totalWorkHours,
      overtimeHours: p.overtimeHours
    }));

    if (format === 'csv') {
      exportToCSV(data);
    } else if (format === 'excel') {
      exportToExcel(data);
    } else if (format === 'pdf') {
      exportToPDF(data);
    }
  };

  const exportToCSV = (data: any[]) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll-${filters.month}-${filters.year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (data: any[]) => {
    console.log('Excel export:', data);
    alert('Excel export özelliği yakında eklenecek!');
  };

  const exportToPDF = (data: any[]) => {
    console.log('PDF export:', data);
    alert('PDF export özelliği yakında eklenecek!');
  };

  if (loading && payroll.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <AnimatedLoading size="lg" text="Maaş verileri yükleniyor..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
              Maaş Yönetimi
            </h1>
            <p className="text-muted-foreground mt-2">
              Maaş hesaplama, ödeme takibi ve finansal analitik
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBulkCreate}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Toplu Oluştur
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('excel')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-200 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Dışa Aktar
            </motion.button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Toplam Maaş</p>
                  <p className="text-3xl font-bold">₺{stats.totalPayroll?.toLocaleString('tr-TR') || '0'}</p>
                </div>
                <div className="p-3 bg-blue-400 rounded-full">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-blue-100 text-sm">
                  <span className="text-green-300">↗</span>
                  <span className="ml-1">+12%</span>
                  <span className="ml-2">geçen aya göre</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Ödenen Maaş</p>
                  <p className="text-3xl font-bold">₺{stats.paidPayroll?.toLocaleString('tr-TR') || '0'}</p>
                </div>
                <div className="p-3 bg-green-400 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-green-100 text-sm">
                  <span className="text-green-300">↗</span>
                  <span className="ml-1">+18%</span>
                  <span className="ml-2">geçen aya göre</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Bekleyen Maaş</p>
                  <p className="text-3xl font-bold">₺{stats.pendingPayroll?.toLocaleString('tr-TR') || '0'}</p>
                </div>
                <div className="p-3 bg-purple-400 rounded-full">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-purple-100 text-sm">
                  <span className="text-yellow-300">→</span>
                  <span className="ml-1">0%</span>
                  <span className="ml-2">geçen aya göre</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Ortalama Maaş</p>
                  <p className="text-3xl font-bold">₺{stats.averageSalary?.toLocaleString('tr-TR') || '0'}</p>
                </div>
                <div className="p-3 bg-orange-400 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-orange-100 text-sm">
                  <span className="text-green-300">↗</span>
                  <span className="ml-1">+8%</span>
                  <span className="ml-2">geçen aya göre</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Payroll Insights */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Durumu Dağılımı</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Ödendi</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.paidEmployees || 0} çalışan
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Beklemede</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.pendingEmployees || 0} çalışan
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Gecikmiş</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.overdueEmployees || 0} çalışan
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Maaş Trendi</h3>
              <div className="h-48 flex items-end justify-between space-x-2">
                {Array.from({ length: 6 }, (_, i) => {
                  const month = new Date();
                  month.setMonth(month.getMonth() - (5 - i));
                  const monthPayroll = Math.floor(Math.random() * 500000) + 300000; // Mock data
                  const maxPayroll = 800000;
                  const height = (monthPayroll / maxPayroll) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center space-y-2">
                      <div 
                        className="w-8 bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg transition-all duration-300 hover:scale-110"
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
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6"
        >
          <PayrollFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <PayrollOverview
            payroll={payroll}
            filters={filters}
          />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6"
        >
          <PayrollTable
            payroll={payroll}
            loading={loading}
            filters={filters}
            onRefresh={fetchPayrollData}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
} 