'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { attendanceAPI, employeesAPI } from '@/lib/api';
import { Attendance, AttendanceStats, Employee } from '@/types/attendance';
import AttendanceOverview from '@/components/Attendance/AttendanceOverview';
import DailyAttendance from '@/components/Attendance/DailyAttendance';
import AttendanceStats from '@/components/Attendance/AttendanceStats';
import CheckInOutPanel from '@/components/Attendance/CheckInOutPanel';
import AnimatedLoading from '@/components/UI/AnimatedLoading';
import { Clock, Users, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AttendancePage() {
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTodayAttendance();
    fetchStats();
    fetchEmployees();
  }, [selectedDate]);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAttendance({
        startDate: selectedDate,
        endDate: selectedDate,
        limit: 100
      });
      setTodayAttendance(response.data.attendance);
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await attendanceAPI.getStats({
        startDate: selectedDate,
        endDate: selectedDate
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getEmployees({ status: 'active', limit: 100 });
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleCheckIn = async (employeeId: string) => {
    try {
      await attendanceAPI.checkIn({ employeeId });
      fetchTodayAttendance();
      fetchStats();
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  const handleCheckOut = async (employeeId: string) => {
    try {
      await attendanceAPI.checkOut({ employeeId });
      fetchTodayAttendance();
      fetchStats();
    } catch (error) {
      console.error('Failed to check out:', error);
    }
  };

  const handleStartBreak = async (employeeId: string) => {
    try {
      await attendanceAPI.startBreak({ employeeId });
      fetchTodayAttendance();
    } catch (error) {
      console.error('Failed to start break:', error);
    }
  };

  const handleEndBreak = async (employeeId: string) => {
    try {
      await attendanceAPI.endBreak({ employeeId });
      fetchTodayAttendance();
    } catch (error) {
      console.error('Failed to end break:', error);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  if (loading && todayAttendance.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <AnimatedLoading size="lg" text="Devam durumu yükleniyor..." />
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
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Devam Takibi
            </h1>
            <p className="text-muted-foreground mt-2">
              Çalışan giriş/çıkış takibi, devam analizi ve zaman yönetimi
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Bugün</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
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
                  <p className="text-blue-100 text-sm font-medium">Toplam Çalışan</p>
                  <p className="text-3xl font-bold">{stats.totalEmployees}</p>
                </div>
                <div className="p-3 bg-blue-400 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-blue-100 text-sm">
                  <span className="text-green-300">↗</span>
                  <span className="ml-1">+5%</span>
                  <span className="ml-2">geçen haftaya göre</span>
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
                  <p className="text-green-100 text-sm font-medium">Giriş Yapan</p>
                  <p className="text-3xl font-bold">{stats.checkedInEmployees}</p>
                </div>
                <div className="p-3 bg-green-400 rounded-full">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-green-100 text-sm">
                  <span className="text-green-300">↗</span>
                  <span className="ml-1">+8%</span>
                  <span className="ml-2">geçen haftaya göre</span>
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
                  <p className="text-purple-100 text-sm font-medium">Devam Oranı</p>
                  <p className="text-3xl font-bold">{Math.round((stats.checkedInEmployees / stats.totalEmployees) * 100)}%</p>
                </div>
                <div className="p-3 bg-purple-400 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-purple-100 text-sm">
                  <span className="text-green-300">↗</span>
                  <span className="ml-1">+3%</span>
                  <span className="ml-2">geçen haftaya göre</span>
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
                  <p className="text-orange-100 text-sm font-medium">Geciken</p>
                  <p className="text-3xl font-bold">{stats.lateEmployees}</p>
                </div>
                <div className="p-3 bg-orange-400 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-orange-100 text-sm">
                  <span className="text-red-300">↘</span>
                  <span className="ml-1">-12%</span>
                  <span className="ml-2">geçen haftaya göre</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Attendance Insights */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Giriş Saati Dağılımı</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Zamanında (08:00-08:30)</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((stats.onTimeEmployees || 0) / stats.totalEmployees * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">5-15 dk gecikme</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((stats.slightlyLateEmployees || 0) / stats.totalEmployees * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">15+ dk gecikme</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((stats.lateEmployees || 0) / stats.totalEmployees * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Haftalık Devam Trendi</h3>
              <div className="h-48 flex items-end justify-between space-x-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const day = new Date();
                  day.setDate(day.getDate() - (6 - i));
                  const dayAttendance = Math.floor(Math.random() * 20) + 15; // Mock data
                  const maxAttendance = 35;
                  const height = (dayAttendance / maxAttendance) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center space-y-2">
                      <div 
                        className="w-8 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t-lg transition-all duration-300 hover:scale-110"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500">
                        {day.toLocaleDateString('tr-TR', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Check-in/Check-out Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <CheckInOutPanel
            employees={employees}
            todayAttendance={todayAttendance}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onStartBreak={handleStartBreak}
            onEndBreak={handleEndBreak}
          />
        </motion.div>

        {/* Daily Attendance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <DailyAttendance
            attendance={todayAttendance}
            loading={loading}
            selectedDate={selectedDate}
          />
        </motion.div>

        {/* Detailed Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8"
          >
            <AttendanceStats stats={stats} />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
} 