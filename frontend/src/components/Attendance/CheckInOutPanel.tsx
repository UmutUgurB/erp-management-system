'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Attendance, Employee } from '@/types/attendance';
import { LogIn, LogOut, Coffee, Clock, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface CheckInOutPanelProps {
  employees: Employee[];
  todayAttendance: Attendance[];
  onCheckIn: (employeeId: string) => void;
  onCheckOut: (employeeId: string) => void;
  onStartBreak: (employeeId: string) => void;
  onEndBreak: (employeeId: string) => void;
}

const statusColors = {
  present: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  absent: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  late: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  work_from_home: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  on_leave: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  half_day: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  early_leave: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200'
};

const statusLabels = {
  present: 'Gelen',
  absent: 'Gelmeyen',
  late: 'Geç Gelen',
  work_from_home: 'Evden Çalışan',
  on_leave: 'İzinde',
  half_day: 'Yarım Gün',
  early_leave: 'Erken Ayrılan'
};

export default function CheckInOutPanel({
  employees,
  todayAttendance,
  onCheckIn,
  onCheckOut,
  onStartBreak,
  onEndBreak
}: CheckInOutPanelProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const getEmployeeAttendance = (employeeId: string) => {
    return todayAttendance.find(att => att.employee._id === employeeId);
  };

  const getEmployeeStatus = (employeeId: string) => {
    const attendance = getEmployeeAttendance(employeeId);
    return attendance?.status || 'absent';
  };

  const canCheckIn = (employeeId: string) => {
    const attendance = getEmployeeAttendance(employeeId);
    return !attendance || !attendance.checkIn;
  };

  const canCheckOut = (employeeId: string) => {
    const attendance = getEmployeeAttendance(employeeId);
    return attendance?.checkIn && !attendance.checkOut;
  };

  const isOnBreak = (employeeId: string) => {
    const attendance = getEmployeeAttendance(employeeId);
    return attendance?.breakTime?.some(break_ => !break_.endTime);
  };

  const canStartBreak = (employeeId: string) => {
    const attendance = getEmployeeAttendance(employeeId);
    return attendance?.checkIn && !attendance.checkOut && !isOnBreak(employeeId);
  };

  const canEndBreak = (employeeId: string) => {
    return isOnBreak(employeeId);
  };

  const getCheckInTime = (employeeId: string) => {
    const attendance = getEmployeeAttendance(employeeId);
    return attendance?.checkInTime;
  };

  const getCheckOutTime = (employeeId: string) => {
    const attendance = getEmployeeAttendance(employeeId);
    return attendance?.checkOutTime;
  };

  const getWorkHours = (employeeId: string) => {
    const attendance = getEmployeeAttendance(employeeId);
    return attendance?.totalWorkHours || 0;
  };

  const getBreakTime = (employeeId: string) => {
    const attendance = getEmployeeAttendance(employeeId);
    return attendance?.totalBreakHours || 0;
  };

  const handleCheckIn = (employeeId: string) => {
    onCheckIn(employeeId);
    setSelectedEmployee(null);
  };

  const handleCheckOut = (employeeId: string) => {
    onCheckOut(employeeId);
    setSelectedEmployee(null);
  };

  const handleStartBreak = (employeeId: string) => {
    onStartBreak(employeeId);
    setSelectedEmployee(null);
  };

  const handleEndBreak = (employeeId: string) => {
    onEndBreak(employeeId);
    setSelectedEmployee(null);
  };

  const activeEmployees = employees.filter(emp => emp.status === 'active');

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Günlük Devam Durumu
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {activeEmployees.length} aktif çalışan
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeEmployees.map((employee, index) => {
            const status = getEmployeeStatus(employee._id);
            const attendance = getEmployeeAttendance(employee._id);
            
            return (
              <motion.div
                key={employee._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                {/* Employee Info */}
                <div className="flex items-center mb-3">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {employee.position} • {employee.department}
                    </p>
                  </div>
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedEmployee(selectedEmployee === employee._id ? null : employee._id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <User className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
                    {status === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {status === 'absent' && <XCircle className="h-3 w-3 mr-1" />}
                    {status === 'late' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {statusLabels[status]}
                  </span>
                </div>

                {/* Time Info */}
                <div className="space-y-2 mb-3">
                  {getCheckInTime(employee._id) && (
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <LogIn className="h-3 w-3 mr-1" />
                      Giriş: {getCheckInTime(employee._id)}
                    </div>
                  )}
                  {getCheckOutTime(employee._id) && (
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <LogOut className="h-3 w-3 mr-1" />
                      Çıkış: {getCheckOutTime(employee._id)}
                    </div>
                  )}
                  {getWorkHours(employee._id) > 0 && (
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Çalışma: {getWorkHours(employee._id).toFixed(1)} saat
                    </div>
                  )}
                  {getBreakTime(employee._id) > 0 && (
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <Coffee className="h-3 w-3 mr-1" />
                      Mola: {getBreakTime(employee._id).toFixed(1)} saat
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {canCheckIn(employee._id) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCheckIn(employee._id)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      <LogIn className="h-3 w-3 mr-1" />
                      Giriş
                    </motion.button>
                  )}

                  {canCheckOut(employee._id) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCheckOut(employee._id)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      Çıkış
                    </motion.button>
                  )}

                  {canStartBreak(employee._id) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStartBreak(employee._id)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Coffee className="h-3 w-3 mr-1" />
                      Mola Başlat
                    </motion.button>
                  )}

                  {canEndBreak(employee._id) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEndBreak(employee._id)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                    >
                      <Coffee className="h-3 w-3 mr-1" />
                      Mola Bitir
                    </motion.button>
                  )}

                  {isOnBreak(employee._id) && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900">
                      <Coffee className="h-3 w-3 mr-1" />
                      Molada
                    </span>
                  )}
                </div>

                {/* Quick Actions Dropdown */}
                {selectedEmployee === employee._id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-12 right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        Hızlı İşlemler
                      </div>
                      
                      {canCheckIn(employee._id) && (
                        <button
                          onClick={() => handleCheckIn(employee._id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Giriş Yap
                        </button>
                      )}

                      {canCheckOut(employee._id) && (
                        <button
                          onClick={() => handleCheckOut(employee._id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Çıkış Yap
                        </button>
                      )}

                      {canStartBreak(employee._id) && (
                        <button
                          onClick={() => handleStartBreak(employee._id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Coffee className="h-4 w-4 mr-2" />
                          Mola Başlat
                        </button>
                      )}

                      {canEndBreak(employee._id) && (
                        <button
                          onClick={() => handleEndBreak(employee._id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Coffee className="h-4 w-4 mr-2" />
                          Mola Bitir
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {activeEmployees.length === 0 && (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <User className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              Aktif çalışan bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bugün için aktif çalışan bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 