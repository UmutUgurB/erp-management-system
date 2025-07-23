'use client';

import { motion } from 'framer-motion';
import { Attendance } from '@/types/attendance';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

interface ReportChartsProps {
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

export default function ReportCharts({ attendance, filters }: ReportChartsProps) {
  const getStatusDistribution = () => {
    const distribution = {
      present: 0,
      absent: 0,
      late: 0,
      work_from_home: 0,
      on_leave: 0,
      half_day: 0,
      early_leave: 0
    };

    attendance.forEach(att => {
      distribution[att.status as keyof typeof distribution]++;
    });

    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
      percentage: attendance.length > 0 ? (count / attendance.length) * 100 : 0,
      label: getStatusLabel(status)
    })).filter(item => item.count > 0);
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      present: 'Gelen',
      absent: 'Gelmeyen',
      late: 'Geç Gelen',
      work_from_home: 'Evden Çalışan',
      on_leave: 'İzinde',
      half_day: 'Yarım Gün',
      early_leave: 'Erken Ayrılan'
    };
    return labels[status as keyof typeof labels] || status;
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
          earlyLeave: 0,
          totalWorkHours: 0,
          totalOvertime: 0
        };
      }
      
      deptStats[dept].total++;
      deptStats[dept].totalWorkHours += att.totalWorkHours || 0;
      deptStats[dept].totalOvertime += att.overtime || 0;
      
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
      attendanceRate: stats.total > 0 ? (stats.present / stats.total) * 100 : 0,
      averageWorkHours: stats.total > 0 ? stats.totalWorkHours / stats.total : 0
    }));
  };

  const getDailyTrends = () => {
    const dailyStats: { [key: string]: any } = {};
    
    attendance.forEach(att => {
      const date = att.date;
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          totalWorkHours: 0,
          totalOvertime: 0
        };
      }
      
      dailyStats[date].total++;
      dailyStats[date].totalWorkHours += att.totalWorkHours || 0;
      dailyStats[date].totalOvertime += att.overtime || 0;
      
      switch (att.status) {
        case 'present':
          dailyStats[date].present++;
          break;
        case 'absent':
          dailyStats[date].absent++;
          break;
        case 'late':
          dailyStats[date].late++;
          break;
      }
    });

    return Object.values(dailyStats)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(stat => ({
        ...stat,
        attendanceRate: stat.total > 0 ? (stat.present / stat.total) * 100 : 0,
        averageWorkHours: stat.total > 0 ? stat.totalWorkHours / stat.total : 0
      }));
  };

  const getEmployeePerformance = () => {
    const empStats: { [key: string]: any } = {};
    
    attendance.forEach(att => {
      const empId = att.employee._id;
      const empName = `${att.employee.firstName} ${att.employee.lastName}`;
      
      if (!empStats[empId]) {
        empStats[empId] = {
          id: empId,
          name: empName,
          department: att.employee.department,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          totalWorkHours: 0,
          totalOvertime: 0,
          totalLateMinutes: 0
        };
      }
      
      empStats[empId].total++;
      empStats[empId].totalWorkHours += att.totalWorkHours || 0;
      empStats[empId].totalOvertime += att.overtime || 0;
      empStats[empId].totalLateMinutes += att.lateMinutes || 0;
      
      switch (att.status) {
        case 'present':
          empStats[empId].present++;
          break;
        case 'absent':
          empStats[empId].absent++;
          break;
        case 'late':
          empStats[empId].late++;
          break;
      }
    });

    return Object.values(empStats)
      .map(stat => ({
        ...stat,
        attendanceRate: stat.total > 0 ? (stat.present / stat.total) * 100 : 0,
        averageWorkHours: stat.total > 0 ? stat.totalWorkHours / stat.total : 0
      }))
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 10); // Top 10 employees
  };

  const statusDistribution = getStatusDistribution();
  const departmentStats = getDepartmentStats();
  const dailyTrends = getDailyTrends();
  const employeePerformance = getEmployeePerformance();

  const getChartColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Status Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Durum Dağılımı
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statusDistribution.map((item, index) => (
              <motion.div
                key={item.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChartColor(index)} text-white`}>
                    {item.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getChartColor(index)}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  %{item.percentage.toFixed(1)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Department Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Departman Performansı
            </h3>
          </div>
          
          <div className="space-y-4">
            {departmentStats.map((dept, index) => (
              <motion.div
                key={dept.department}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {dept.department}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {dept.total} kayıt
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Devam Oranı</p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      %{dept.attendanceRate.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ort. Çalışma</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {dept.averageWorkHours.toFixed(1)} saat
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Mesai</p>
                    <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {dept.totalOvertime.toFixed(1)} saat
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${dept.attendanceRate}%` }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Daily Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Günlük Trendler
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <div className="flex space-x-4 min-w-max">
              {dailyTrends.slice(-14).map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className="flex flex-col items-center min-w-[80px]"
                >
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-t h-32 relative">
                    <div
                      className="absolute bottom-0 w-full bg-blue-500 rounded-t"
                      style={{ height: `${(day.attendanceRate / 100) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(day.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                    </p>
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      %{day.attendanceRate.toFixed(0)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              En İyi Performans Gösterenler
            </h3>
          </div>
          
          <div className="space-y-3">
            {employeePerformance.map((emp, index) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full ${getChartColor(index)} flex items-center justify-center mr-3`}>
                    <span className="text-white text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {emp.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {emp.department}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    %{emp.attendanceRate.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {emp.averageWorkHours.toFixed(1)} saat/gün
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 