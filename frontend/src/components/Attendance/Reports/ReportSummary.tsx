'use client';

import { motion } from 'framer-motion';
import { Attendance } from '@/types/attendance';
import { Users, CheckCircle, XCircle, AlertTriangle, Coffee, TrendingUp, Clock, Calendar } from 'lucide-react';

interface ReportSummaryProps {
  attendance: Attendance[];
  filters: {
    startDate: string;
    endDate: string;
    department: string;
    employee: string;
    status: string;
    reportType: string;
  };
}

const statuses = [
  { value: '', label: 'Tümü' },
  { value: 'present', label: 'Gelen' },
  { value: 'absent', label: 'Gelmeyen' },
  { value: 'late', label: 'Geç Gelen' },
  { value: 'work_from_home', label: 'Evden Çalışan' },
  { value: 'on_leave', label: 'İzinde' },
  { value: 'half_day', label: 'Yarım Gün' },
  { value: 'early_leave', label: 'Erken Ayrılan' }
];

export default function ReportSummary({ attendance, filters }: ReportSummaryProps) {
  const getReportStats = () => {
    const totalRecords = attendance.length;
    
    const stats = {
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
      attendanceRate: 0,
      uniqueEmployees: 0,
      departments: new Set<string>()
    };

    const employeeSet = new Set<string>();

    attendance.forEach(att => {
      employeeSet.add(att.employee._id);
      stats.departments.add(att.employee.department);
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

    stats.uniqueEmployees = employeeSet.size;
    stats.averageWorkHours = totalRecords > 0 ? stats.totalWorkHours / totalRecords : 0;
    stats.attendanceRate = totalRecords > 0 ? (stats.presentDays / totalRecords) * 100 : 0;

    return stats;
  };

  const getDateRange = () => {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      start: start.toLocaleDateString('tr-TR'),
      end: end.toLocaleDateString('tr-TR'),
      days: daysDiff
    };
  };

  const stats = getReportStats();
  const dateRange = getDateRange();

  const summaryCards = [
    {
      title: 'Toplam Kayıt',
      value: stats.totalRecords,
      subtitle: `${dateRange.days} gün`,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    {
      title: 'Benzersiz Çalışan',
      value: stats.uniqueEmployees,
      subtitle: `${stats.departments.size} departman`,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      title: 'Devam Oranı',
      value: `${stats.attendanceRate.toFixed(1)}%`,
      subtitle: `${stats.presentDays} gelen`,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-700 dark:text-emerald-300'
    },
    {
      title: 'Ortalama Çalışma',
      value: `${stats.averageWorkHours.toFixed(1)} saat`,
      subtitle: `${stats.totalWorkHours.toFixed(1)} toplam`,
      icon: Clock,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-700 dark:text-indigo-300'
    },
    {
      title: 'Toplam Mesai',
      value: `${stats.totalOvertime.toFixed(1)} saat`,
      subtitle: `${Math.round(stats.totalOvertime / 8)} gün`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300'
    },
    {
      title: 'Geç Kalma',
      value: `${Math.round(stats.totalLateMinutes)} dk`,
      subtitle: `${stats.lateDays} kez`,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-700 dark:text-yellow-300'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Rapor Özeti
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {dateRange.start} - {dateRange.end} tarihleri arası
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {dateRange.days} günlük veri
              </span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
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
                      {card.title}
                    </p>
                  </dt>
                  <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {card.value}
                    </p>
                    <p className="ml-2 flex items-baseline text-sm font-semibold text-gray-500 dark:text-gray-400">
                      {card.subtitle}
                    </p>
                  </dd>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
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
              { label: 'Yarım Gün', count: stats.halfDays, color: 'bg-orange-500', icon: Clock },
              { label: 'Erken Ayrılan', count: stats.earlyLeaveDays, color: 'bg-pink-500', icon: Clock },
              { label: 'Toplam Çalışma', count: stats.totalWorkHours.toFixed(1), color: 'bg-indigo-500', icon: TrendingUp, unit: 'saat' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
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

      {/* Filter Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Filtre Özeti
          </h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Tarih Aralığı
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {dateRange.start} - {dateRange.end}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {dateRange.days} gün
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Departman
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {filters.department || 'Tümü'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.departments.size} departman
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Durum Filtresi
              </p>
                           <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
               {filters.status ? 
                 ['present', 'absent', 'late', 'work_from_home', 'on_leave', 'half_day', 'early_leave']
                   .find(s => s === filters.status) ? 
                   ['Gelen', 'Gelmeyen', 'Geç Gelen', 'Evden Çalışan', 'İzinde', 'Yarım Gün', 'Erken Ayrılan'][
                     ['present', 'absent', 'late', 'work_from_home', 'on_leave', 'half_day', 'early_leave'].indexOf(filters.status)
                   ] : 'Tümü' : 'Tümü'}
             </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.totalRecords} kayıt
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 