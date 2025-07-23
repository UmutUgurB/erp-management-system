'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { attendanceAPI } from '@/lib/api';
import { Attendance } from '@/types/attendance';
import ReportFilters from '@/components/Attendance/Reports/ReportFilters';
import ReportCharts from '@/components/Attendance/Reports/ReportCharts';
import ReportTable from '@/components/Attendance/Reports/ReportTable';
import ReportSummary from '@/components/Attendance/Reports/ReportSummary';
import AnimatedLoading from '@/components/UI/AnimatedLoading';
import { BarChart3, Download, FileText, TrendingUp, Users, Calendar, Filter } from 'lucide-react';

export default function AttendanceReportsPage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 gün önce
    endDate: new Date().toISOString().split('T')[0],
    department: '',
    employee: '',
    status: '',
    reportType: 'overview'
  });

  useEffect(() => {
    fetchAttendanceData();
  }, [filters]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAttendance({
        startDate: filters.startDate,
        endDate: filters.endDate,
        department: filters.department || undefined,
        employee: filters.employee || undefined,
        status: filters.status || undefined,
        limit: 1000
      });
      
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    const data = attendance.map(att => ({
      date: att.date,
      employee: `${att.employee.firstName} ${att.employee.lastName}`,
      department: att.employee.department,
      position: att.employee.position,
      status: att.status,
      checkIn: att.checkInTime,
      checkOut: att.checkOutTime,
      workHours: att.totalWorkHours,
      breakHours: att.totalBreakHours,
      netWorkHours: (att.totalWorkHours || 0) - (att.totalBreakHours || 0),
      overtime: att.overtime,
      lateMinutes: att.lateMinutes
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
    link.setAttribute('download', `attendance-report-${filters.startDate}-${filters.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (data: any[]) => {
    // Excel export implementation
    console.log('Excel export:', data);
    alert('Excel export özelliği yakında eklenecek!');
  };

  const exportToPDF = (data: any[]) => {
    // PDF export implementation
    console.log('PDF export:', data);
    alert('PDF export özelliği yakında eklenecek!');
  };

  if (loading && attendance.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <AnimatedLoading size="lg" text="Raporlar yükleniyor..." />
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
              Devam Raporları
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Detaylı devam analizi ve raporlama
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
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
              <BarChart3 className="h-4 w-4 mr-2" />
              PDF
            </motion.button>
          </div>
        </motion.div>

        {/* Report Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Rapor Türü
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: 'overview', label: 'Genel Bakış', icon: BarChart3, color: 'bg-blue-500' },
                { value: 'trends', label: 'Trend Analizi', icon: TrendingUp, color: 'bg-green-500' },
                { value: 'department', label: 'Departman', icon: Users, color: 'bg-purple-500' },
                { value: 'individual', label: 'Bireysel', icon: Calendar, color: 'bg-orange-500' }
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFilterChange({ reportType: type.value })}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200
                      ${filters.reportType === type.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center mr-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-medium ${
                          filters.reportType === type.value
                            ? 'text-indigo-700 dark:text-indigo-300'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {type.label}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <ReportFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </motion.div>

        {/* Report Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <ReportSummary
            attendance={attendance}
            filters={filters}
          />
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6"
        >
          <ReportCharts
            attendance={attendance}
            filters={filters}
          />
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6"
        >
          <ReportTable
            attendance={attendance}
            loading={loading}
            filters={filters}
          />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
} 