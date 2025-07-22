'use client';

import { motion } from 'framer-motion';
import { AttendanceStats } from '@/types/attendance';
import { Users, Clock, AlertTriangle, CheckCircle, XCircle, Coffee, TrendingUp } from 'lucide-react';

interface AttendanceOverviewProps {
  stats: AttendanceStats;
  selectedDate: string;
}

const overviewCards = [
  {
    name: 'Toplam Çalışan',
    value: 'totalRecords',
    icon: Users,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300'
  },
  {
    name: 'Gelen',
    value: 'presentDays',
    icon: CheckCircle,
    color: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-300'
  },
  {
    name: 'Gelmeyen',
    value: 'absentDays',
    icon: XCircle,
    color: 'bg-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-300'
  },
  {
    name: 'Geç Gelen',
    value: 'lateDays',
    icon: AlertTriangle,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-700 dark:text-yellow-300'
  },
  {
    name: 'Evden Çalışan',
    value: 'workFromHomeDays',
    icon: Coffee,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-300'
  },
  {
    name: 'Toplam Çalışma Saati',
    value: 'totalWorkHours',
    icon: Clock,
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    format: (value: number) => `${value.toFixed(1)} saat`
  }
];

export default function AttendanceOverview({ stats, selectedDate }: AttendanceOverviewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAttendanceRate = () => {
    if (stats.overview.totalRecords === 0) return 0;
    return ((stats.overview.presentDays / stats.overview.totalRecords) * 100).toFixed(1);
  };

  const getLateRate = () => {
    if (stats.overview.totalRecords === 0) return 0;
    return ((stats.overview.lateDays / stats.overview.totalRecords) * 100).toFixed(1);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {formatDate(selectedDate)} - Günlük Özet
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Devam oranı: %{getAttendanceRate()} | Geç gelme oranı: %{getLateRate()}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          const value = stats.overview[card.value as keyof typeof stats.overview] as number;
          const displayValue = card.format ? card.format(value) : value.toString();
          
          return (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className={`relative overflow-hidden rounded-lg ${card.bgColor} px-4 pb-12 pt-5 shadow border border-gray-200 dark:border-gray-700`}
            >
              <dt>
                <div className={`absolute rounded-md ${card.color} p-3`}>
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className={`ml-16 truncate text-sm font-medium ${card.textColor}`}>
                  {card.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {displayValue}
                </p>
              </dd>
            </motion.div>
          );
        })}
      </div>

      {/* Status Distribution */}
      {stats.statusDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Durum Dağılımı
          </h3>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.statusDistribution.map((status, index) => (
                  <motion.div
                    key={status._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {status._id === 'present' ? 'Gelen' :
                         status._id === 'absent' ? 'Gelmeyen' :
                         status._id === 'late' ? 'Geç Gelen' :
                         status._id === 'work_from_home' ? 'Evden Çalışan' :
                         status._id === 'on_leave' ? 'İzinde' :
                         status._id === 'half_day' ? 'Yarım Gün' :
                         status._id === 'early_leave' ? 'Erken Ayrılan' : status._id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {status.count} kişi
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {stats.overview.totalRecords > 0 
                          ? ((status.count / stats.overview.totalRecords) * 100).toFixed(1)
                          : '0'}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Günlük İçgörüler
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-indigo-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Ortalama Çalışma Saati
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stats.overview.totalRecords > 0 
                    ? (stats.overview.averageWorkHours).toFixed(1)
                    : '0'} saat
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Toplam Geç Kalma
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(stats.overview.totalLateMinutes)} dk
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center">
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
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 