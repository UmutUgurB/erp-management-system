'use client';

import { motion } from 'framer-motion';
import { Attendance } from '@/types/attendance';
import { Clock, LogIn, LogOut, Coffee, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import AnimatedLoading from '@/components/UI/AnimatedLoading';

interface DailyAttendanceProps {
  attendance: Attendance[];
  loading: boolean;
  selectedDate: string;
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

export default function DailyAttendance({ attendance, loading, selectedDate }: DailyAttendanceProps) {
  const formatTime = (time: string) => {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4" />;
      case 'absent':
        return <XCircle className="h-4 w-4" />;
      case 'late':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getLateMinutes = (checkInTime: string, expectedTime: string = '09:00') => {
    if (!checkInTime) return 0;
    
    const checkIn = new Date(checkInTime);
    const expected = new Date();
    const [hours, minutes] = expectedTime.split(':');
    expected.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const diffMs = checkIn.getTime() - expected.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    return diffMinutes > 0 ? diffMinutes : 0;
  };

  const getWorkHours = (att: Attendance) => {
    if (!att.checkIn || !att.checkOut) return 0;
    
    const checkIn = new Date(att.checkIn);
    const checkOut = new Date(att.checkOut);
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours;
  };

  const getBreakHours = (att: Attendance) => {
    if (!att.breakTime || att.breakTime.length === 0) return 0;
    
    let totalBreakMinutes = 0;
    att.breakTime.forEach(break_ => {
      if (break_.startTime && break_.endTime) {
        const start = new Date(break_.startTime);
        const end = new Date(break_.endTime);
        const diffMs = end.getTime() - start.getTime();
        totalBreakMinutes += diffMs / (1000 * 60);
      }
    });
    
    return totalBreakMinutes / 60;
  };

  const getNetWorkHours = (att: Attendance) => {
    const workHours = getWorkHours(att);
    const breakHours = getBreakHours(att);
    return workHours - breakHours;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-center h-32">
            <AnimatedLoading size="md" text="Devam kayıtları yükleniyor..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Günlük Devam Listesi
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(selectedDate)}
          </p>
        </div>

        {attendance.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Clock className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              Devam kaydı bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formatDate(selectedDate)} tarihi için devam kaydı bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Çalışan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Giriş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Çıkış
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Çalışma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mola
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Net Çalışma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Geç Kalma
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {attendance.map((att, index) => (
                  <motion.tr
                    key={att._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                              {att.employee.firstName.charAt(0)}{att.employee.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {att.employee.firstName} {att.employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {att.employee.position} • {att.employee.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[att.status]}`}>
                        {getStatusIcon(att.status)}
                        <span className="ml-1">{statusLabels[att.status]}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <LogIn className="h-4 w-4 mr-1 text-gray-400" />
                        {formatTime(att.checkInTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-1 text-gray-400" />
                        {formatTime(att.checkOutTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {getWorkHours(att).toFixed(1)} saat
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <Coffee className="h-4 w-4 mr-1 text-gray-400" />
                        {getBreakHours(att).toFixed(1)} saat
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {getNetWorkHours(att).toFixed(1)} saat
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {att.status === 'late' ? (
                        <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {getLateMinutes(att.checkInTime)} dk
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {attendance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Toplam Çalışan
                </p>
                <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                  {attendance.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Gelen
                </p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                  {attendance.filter(att => att.status === 'present' || att.status === 'late').length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Ortalama Çalışma
                </p>
                <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                  {(attendance.reduce((sum, att) => sum + getNetWorkHours(att), 0) / attendance.length).toFixed(1)} saat
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Geç Gelen
                </p>
                <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                  {attendance.filter(att => att.status === 'late').length}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 