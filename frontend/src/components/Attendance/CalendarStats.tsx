'use client';

import { motion } from 'framer-motion';
import { Attendance } from '@/types/attendance';
import { Users, CheckCircle, XCircle, AlertTriangle, Coffee, TrendingUp, Calendar } from 'lucide-react';

interface CalendarStatsProps {
  attendance: Attendance[];
  currentDate: Date;
}

export default function CalendarStats({ attendance, currentDate }: CalendarStatsProps) {
  const getMonthlyStats = () => {
    const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const totalRecords = attendance.length;
    
    const stats = {
      totalDays,
      totalRecords,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      workFromHomeDays: 0,
      onLeaveDays: 0,
      halfDays: 0,
      earlyLeaveDays: 0,
      totalWorkHours: 0,
      totalBreakHours: 0,
      totalOvertime: 0,
      totalLateMinutes: 0,
      averageWorkHours: 0,
      attendanceRate: 0
    };

    attendance.forEach(att => {
      stats.totalWorkHours += att.totalWorkHours || 0;
      stats.totalBreakHours += att.totalBreakHours || 0;
      stats.totalOvertime += att.overtime || 0;
      stats.totalLateMinutes += att.lateMinutes || 0;

      switch (att.status) {
        case 'present':
          stats.presentDays++;
          break;
        case 'absent':
          stats.absentDays++;
          break;
        case 'late':
          stats.lateDays++;
          break;
        case 'work_from_home':
          stats.workFromHomeDays++;
          break;
        case 'on_leave':
          stats.onLeaveDays++;
          break;
        case 'half_day':
          stats.halfDays++;
          break;
        case 'early_leave':
          stats.earlyLeaveDays++;
          break;
      }
    });

    stats.averageWorkHours = totalRecords > 0 ? stats.totalWorkHours / totalRecords : 0;
    stats.attendanceRate = totalRecords > 0 ? (stats.presentDays / totalRecords) * 100 : 0;

    return stats;
  };

  const getDepartmentStats = () => {
    const deptStats: { [key: string]: any } = {};
    
    attendance.forEach(att => {
      const dept = att.employee.department;
      if (!deptStats[dept]) {
        deptStats[dept] = {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          workFromHome: 0,
          onLeave: 0,
          halfDay: 0,
          earlyLeave: 0
        };
      }
      
      deptStats[dept].total++;
      
      switch (att.status) {
        case 'present':
          deptStats[dept].present++;
          break;
        case 'absent':
          deptStats[dept].absent++;
          break;
        case 'late':
          deptStats[dept].late++;
          break;
        case 'work_from_home':
          deptStats[dept].workFromHome++;
          break;
        case 'on_leave':
          deptStats[dept].onLeave++;
          break;
        case 'half_day':
          deptStats[dept].halfDay++;
          break;
        case 'early_leave':
          deptStats[dept].earlyLeave++;
          break;
      }
    });

    return Object.entries(deptStats).map(([dept, stats]) => ({
      department: dept,
      ...stats,
      attendanceRate: stats.total > 0 ? (stats.present / stats.total) * 100 : 0
    }));
  };

  const stats = getMonthlyStats();
  const departmentStats = getDepartmentStats();

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="space-y-6">
      {/* Monthly Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {formatMonth(currentDate)} - Aylık Özet
          </h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-indigo-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Toplam Kayıt
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.totalRecords}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.totalDays} gün
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Devam Oranı
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                %{stats.attendanceRate.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.presentDays} gelen
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Ortalama Çalışma
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.averageWorkHours.toFixed(1)} saat
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.totalWorkHours.toFixed(1)} toplam
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Geç Gelen
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.lateDays}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(stats.totalLateMinutes)} dk toplam
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Durum Dağılımı
          </h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Gelen', count: stats.presentDays, color: 'bg-green-500', icon: CheckCircle },
              { label: 'Gelmeyen', count: stats.absentDays, color: 'bg-red-500', icon: XCircle },
              { label: 'Geç Gelen', count: stats.lateDays, color: 'bg-yellow-500', icon: AlertTriangle },
              { label: 'Evden Çalışan', count: stats.workFromHomeDays, color: 'bg-purple-500', icon: Coffee },
              { label: 'İzinde', count: stats.onLeaveDays, color: 'bg-blue-500', icon: Calendar },
              { label: 'Yarım Gün', count: stats.halfDays, color: 'bg-orange-500', icon: Calendar },
              { label: 'Erken Ayrılan', count: stats.earlyLeaveDays, color: 'bg-pink-500', icon: Calendar },
              { label: 'Toplam Mesai', count: stats.totalOvertime.toFixed(1), color: 'bg-indigo-500', icon: TrendingUp, unit: 'saat' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center mr-3`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.label}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {item.count}{item.unit ? ` ${item.unit}` : ''}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Department Statistics */}
      {departmentStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Departman Bazlı İstatistikler
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Departman
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Toplam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Gelen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Gelmeyen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Geç Gelen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Devam Oranı
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {departmentStats.map((dept, index) => (
                    <motion.tr
                      key={dept.department}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {dept.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {dept.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                        {dept.present}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                        {dept.absent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400">
                        {dept.late}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${dept.attendanceRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">
                            {dept.attendanceRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 