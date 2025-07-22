'use client';

import { motion } from 'framer-motion';
import { AttendanceStats as Stats } from '@/types/attendance';
import { BarChart3, PieChart, TrendingUp, Clock, Users, Calendar } from 'lucide-react';

interface AttendanceStatsProps {
  stats: Stats;
}

export default function AttendanceStats({ stats }: AttendanceStatsProps) {
  const getAttendanceRate = () => {
    if (stats.overview.totalRecords === 0) return 0;
    return ((stats.overview.presentDays / stats.overview.totalRecords) * 100).toFixed(1);
  };

  const getLateRate = () => {
    if (stats.overview.totalRecords === 0) return 0;
    return ((stats.overview.lateDays / stats.overview.totalRecords) * 100).toFixed(1);
  };

  const getWorkFromHomeRate = () => {
    if (stats.overview.totalRecords === 0) return 0;
    return ((stats.overview.workFromHomeDays / stats.overview.totalRecords) * 100).toFixed(1);
  };

  const getAbsentRate = () => {
    if (stats.overview.totalRecords === 0) return 0;
    return ((stats.overview.absentDays / stats.overview.totalRecords) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Detaylı İstatistikler
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Attendance Rate */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="relative">
                <svg className="w-20 h-20 mx-auto" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray={`${getAttendanceRate()}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    %{getAttendanceRate()}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                Devam Oranı
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.overview.presentDays} / {stats.overview.totalRecords}
              </p>
            </motion.div>

            {/* Late Rate */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="relative">
                <svg className="w-20 h-20 mx-auto" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray={`${getLateRate()}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    %{getLateRate()}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                Geç Gelme Oranı
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.overview.lateDays} / {stats.overview.totalRecords}
              </p>
            </motion.div>

            {/* Work from Home Rate */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="relative">
                <svg className="w-20 h-20 mx-auto" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeDasharray={`${getWorkFromHomeRate()}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    %{getWorkFromHomeRate()}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                Evden Çalışma
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.overview.workFromHomeDays} / {stats.overview.totalRecords}
              </p>
            </motion.div>

            {/* Absent Rate */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <div className="relative">
                <svg className="w-20 h-20 mx-auto" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray={`${getAbsentRate()}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    %{getAbsentRate()}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                Devamsızlık Oranı
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.overview.absentDays} / {stats.overview.totalRecords}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Time Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Zaman İstatistikleri
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-indigo-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Ortalama Çalışma Saati
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stats.overview.averageWorkHours.toFixed(1)} saat
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Toplam Mesai
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stats.overview.totalOvertime.toFixed(1)} saat
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Toplam Geç Kalma
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(stats.overview.totalLateMinutes)} dk
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Department Statistics */}
      {stats.departmentStats && stats.departmentStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
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
                  {stats.departmentStats.map((dept, index) => (
                    <motion.tr
                      key={dept._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 1.0 + index * 0.1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {dept._id}
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
                              style={{ width: `${dept.total > 0 ? (dept.present / dept.total) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">
                            {dept.total > 0 ? ((dept.present / dept.total) * 100).toFixed(1) : 0}%
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