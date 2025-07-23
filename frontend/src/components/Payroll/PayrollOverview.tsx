'use client';

import { motion } from 'framer-motion';
import { DollarSign, Clock, Users, TrendingUp, Calendar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface PayrollOverviewProps {
  payroll: any[];
  filters: {
    month: number;
    year: number;
    employee: string;
    department: string;
    status: string;
  };
}

const months = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const statusColors = {
  pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  paid: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  cancelled: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
};

const statusLabels = {
  pending: 'Bekliyor',
  paid: 'Ödendi',
  cancelled: 'İptal Edildi'
};

const statusIcons = {
  pending: AlertTriangle,
  paid: CheckCircle,
  cancelled: XCircle
};

export default function PayrollOverview({ payroll, filters }: PayrollOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const getCurrentPeriod = () => {
    return `${months[filters.month - 1]} ${filters.year}`;
  };

  const getOverviewStats = () => {
    if (!payroll || payroll.length === 0) {
      return {
        totalEmployees: 0,
        totalGrossSalary: 0,
        totalNetSalary: 0,
        totalOvertimePay: 0,
        totalBonus: 0,
        totalDeductions: 0,
        averageNetSalary: 0,
        averageGrossSalary: 0,
        averageOvertimePay: 0,
        paidCount: 0,
        pendingCount: 0,
        cancelledCount: 0,
        totalWorkDays: 0,
        totalWorkHours: 0,
        totalOvertimeHours: 0
      };
    }

    const stats = payroll.reduce((acc, p) => {
      acc.totalGrossSalary += p.grossSalary || 0;
      acc.totalNetSalary += p.netSalary || 0;
      acc.totalOvertimePay += p.overtimePay || 0;
      acc.totalBonus += p.bonus || 0;
      acc.totalDeductions += p.totalDeductions || 0;
      acc.totalWorkDays += p.totalWorkDays || 0;
      acc.totalWorkHours += p.totalWorkHours || 0;
      acc.totalOvertimeHours += p.overtimeHours || 0;

      if (p.paymentStatus === 'paid') acc.paidCount++;
      else if (p.paymentStatus === 'pending') acc.pendingCount++;
      else if (p.paymentStatus === 'cancelled') acc.cancelledCount++;

      return acc;
    }, {
      totalEmployees: payroll.length,
      totalGrossSalary: 0,
      totalNetSalary: 0,
      totalOvertimePay: 0,
      totalBonus: 0,
      totalDeductions: 0,
      paidCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      totalWorkDays: 0,
      totalWorkHours: 0,
      totalOvertimeHours: 0
    });

    stats.averageNetSalary = stats.totalEmployees > 0 ? stats.totalNetSalary / stats.totalEmployees : 0;
    stats.averageGrossSalary = stats.totalEmployees > 0 ? stats.totalGrossSalary / stats.totalEmployees : 0;
    stats.averageOvertimePay = stats.totalEmployees > 0 ? stats.totalOvertimePay / stats.totalEmployees : 0;

    return stats;
  };

  const getDepartmentBreakdown = () => {
    if (!payroll || payroll.length === 0) return [];

    const deptStats: { [key: string]: any } = {};
    
    payroll.forEach(p => {
      const dept = p.employee.department;
      if (!deptStats[dept]) {
        deptStats[dept] = {
          department: dept,
          count: 0,
          totalGrossSalary: 0,
          totalNetSalary: 0,
          totalOvertimePay: 0,
          totalBonus: 0,
          totalDeductions: 0,
          paidCount: 0,
          pendingCount: 0,
          cancelledCount: 0
        };
      }
      
      deptStats[dept].count++;
      deptStats[dept].totalGrossSalary += p.grossSalary || 0;
      deptStats[dept].totalNetSalary += p.netSalary || 0;
      deptStats[dept].totalOvertimePay += p.overtimePay || 0;
      deptStats[dept].totalBonus += p.bonus || 0;
      deptStats[dept].totalDeductions += p.totalDeductions || 0;
      
      if (p.paymentStatus === 'paid') deptStats[dept].paidCount++;
      else if (p.paymentStatus === 'pending') deptStats[dept].pendingCount++;
      else if (p.paymentStatus === 'cancelled') deptStats[dept].cancelledCount++;
    });

    return Object.values(deptStats).map(dept => ({
      ...dept,
      averageNetSalary: dept.count > 0 ? dept.totalNetSalary / dept.count : 0,
      averageGrossSalary: dept.count > 0 ? dept.totalGrossSalary / dept.count : 0,
      paymentCompletionRate: dept.count > 0 ? (dept.paidCount / dept.count) * 100 : 0
    }));
  };

  const getTopEarners = () => {
    if (!payroll || payroll.length === 0) return [];

    return [...payroll]
      .sort((a, b) => (b.netSalary || 0) - (a.netSalary || 0))
      .slice(0, 5)
      .map(p => ({
        employee: `${p.employee.firstName} ${p.employee.lastName}`,
        department: p.employee.department,
        netSalary: p.netSalary || 0,
        grossSalary: p.grossSalary || 0,
        overtimePay: p.overtimePay || 0,
        bonus: p.bonus || 0,
        workDays: p.totalWorkDays || 0,
        workHours: p.totalWorkHours || 0
      }));
  };

  const stats = getOverviewStats();
  const departmentBreakdown = getDepartmentBreakdown();
  const topEarners = getTopEarners();

  const overviewCards = [
    {
      title: 'Toplam Çalışan',
      value: formatNumber(stats.totalEmployees),
      subtitle: `${getCurrentPeriod()} dönemi`,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    {
      title: 'Toplam Brüt Maaş',
      value: formatCurrency(stats.totalGrossSalary),
      subtitle: `${formatCurrency(stats.averageGrossSalary)} ortalama`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      title: 'Toplam Net Maaş',
      value: formatCurrency(stats.totalNetSalary),
      subtitle: `${formatCurrency(stats.averageNetSalary)} ortalama`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-700 dark:text-emerald-300'
    },
    {
      title: 'Toplam Mesai',
      value: formatCurrency(stats.totalOvertimePay),
      subtitle: `${formatCurrency(stats.averageOvertimePay)} ortalama`,
      icon: Clock,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
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
                Genel Bakış
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getCurrentPeriod()} dönemi özeti
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overviewCards.map((card, index) => {
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

      {/* Department Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Departman Dağılımı
          </h3>
          
          <div className="space-y-4">
            {departmentBreakdown.map((dept, index) => (
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
                    {dept.count} çalışan
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ort. Net Maaş</p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(dept.averageNetSalary)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Net</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(dept.totalNetSalary)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Mesai</p>
                    <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {formatCurrency(dept.totalOvertimePay)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ödeme Tamamlanma</p>
                    <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                      %{dept.paymentCompletionRate.toFixed(1)}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${dept.paymentCompletionRate}%` }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Top Earners */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            En Yüksek Maaş Alanlar
          </h3>
          
          <div className="space-y-3">
            {topEarners.map((earner, index) => (
              <motion.div
                key={earner.employee}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center mr-3`}>
                    <span className="text-white text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {earner.employee}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {earner.department}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(earner.netSalary)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {earner.workDays} gün, {earner.workHours.toFixed(1)} saat
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Payment Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Ödeme Durumu Özeti
          </h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { status: 'paid', count: stats.paidCount, total: stats.totalEmployees },
              { status: 'pending', count: stats.pendingCount, total: stats.totalEmployees },
              { status: 'cancelled', count: stats.cancelledCount, total: stats.totalEmployees }
            ].map((item, index) => {
              const Icon = statusIcons[item.status as keyof typeof statusIcons];
              const percentage = item.total > 0 ? (item.count / item.total) * 100 : 0;
              
              return (
                <motion.div
                  key={item.status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${statusColors[item.status as keyof typeof statusColors]} mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {item.count}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {statusLabels[item.status as keyof typeof statusLabels]}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    %{percentage.toFixed(1)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 