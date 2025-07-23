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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="sm:flex sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Maaş Yönetimi
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Maaş hesaplama, ödeme takibi ve raporlama
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBulkCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Toplu Oluştur
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('csv')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('excel')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Excel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              PDF
            </motion.button>
          </div>
        </motion.div>

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

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <PayrollStats
            stats={stats}
            filters={filters}
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
      </motion.div>
    </DashboardLayout>
  );
} 