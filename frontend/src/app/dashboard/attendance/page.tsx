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
              Devam Takibi
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Günlük devam durumu ve istatistikler
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </motion.div>

        {/* Quick Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <AttendanceOverview stats={stats} selectedDate={selectedDate} />
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
      </motion.div>
    </DashboardLayout>
  );
} 