'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { attendanceAPI } from '@/lib/api';
import { Attendance } from '@/types/attendance';
import AttendanceCalendar from '@/components/Attendance/AttendanceCalendar';
import CalendarFilters from '@/components/Attendance/CalendarFilters';
import CalendarStats from '@/components/Attendance/CalendarStats';
import AnimatedLoading from '@/components/UI/AnimatedLoading';
import { Calendar, Filter, Download, BarChart3 } from 'lucide-react';

export default function AttendanceCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    employee: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [currentDate, filters]);

  const fetchMonthlyAttendance = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await attendanceAPI.getAttendance({
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
        department: filters.department || undefined,
        employee: filters.employee || undefined,
        status: filters.status || undefined,
        limit: 1000
      });
      
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error('Failed to fetch monthly attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExport = () => {
    // Export functionality
    const data = attendance.map(att => ({
      date: att.date,
      employee: `${att.employee.firstName} ${att.employee.lastName}`,
      department: att.employee.department,
      status: att.status,
      checkIn: att.checkInTime,
      checkOut: att.checkOutTime,
      workHours: att.totalWorkHours,
      breakHours: att.totalBreakHours
    }));

    const csv = convertToCSV(data);
    downloadCSV(csv, `attendance-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.csv`);
  };

  const convertToCSV = (data: any[]) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    return csvContent;
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && attendance.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <AnimatedLoading size="lg" text="Takvim yükleniyor..." />
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
              Devam Takvimi
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Aylık devam durumu ve takvim görünümü
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Raporlar
            </motion.button>
          </div>
        </motion.div>

        {/* Calendar Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMonthChange('prev')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
              >
                ← Önceki Ay
              </motion.button>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {currentDate.toLocaleDateString('tr-TR', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </h2>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMonthChange('next')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
              >
                Sonraki Ay →
              </motion.button>
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
          <CalendarFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </motion.div>

        {/* Calendar Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <CalendarStats
            attendance={attendance}
            currentDate={currentDate}
          />
        </motion.div>

        {/* Main Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6"
        >
          <AttendanceCalendar
            attendance={attendance}
            currentDate={currentDate}
            loading={loading}
          />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
} 