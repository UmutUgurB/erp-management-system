'use client';

import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface PayrollStatsProps {
  stats: any;
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

export default function PayrollStats({ stats, filters }: PayrollStatsProps) {
  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500 dark:text-gray-400">İstatistikler yükleniyor...</div>
          </div>
        </div>
      </div>
    );
  }

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

  const statCards = [
    {
      title: 'Toplam Kayıt',
      value: formatNumber(stats.totalRecords),
      subtitle: `${getCurrentPeriod()} dönemi`,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    {
      title: 'Toplam Brüt Maaş',
      value: formatCurrency(stats.totalGrossSalary),
      subtitle: `${formatCurrency(stats.totalGrossSalary / Math.max(stats.totalRecords, 1))} ortalama`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      title: 'Toplam Net Maaş',
      value: formatCurrency(stats.totalNetSalary),
      subtitle: `${formatCurrency(stats.totalNetSalary / Math.max(stats.totalRecords, 1))} ortalama`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-700 dark:text-emerald-300'
    },
    {
      title: 'Toplam Mesai',
      value: formatCurrency(stats.totalOvertimePay),
      subtitle: `${formatCurrency(stats.totalOvertimePay / Math.max(stats.totalRecords, 1))} ortalama`,
      icon: Clock,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300'
    },
    {
      title: 'Toplam Kesinti',
      value: formatCurrency(stats.totalDeductions),
      subtitle: `${formatCurrency(stats.totalDeductions / Math.max(stats.totalRecords, 1))} ortalama`,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-700 dark:text-yellow-300'
    },
    {
      title: 'Toplam Bonus',
      value: formatCurrency(stats.totalBonus),
      subtitle: `${formatCurrency(stats.totalBonus / Math.max(stats.totalRecords, 1))} ortalama`,
      icon: DollarSign,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-700 dark:text-indigo-300'
    }
  ];

  const statusCards = [
    {
      title: 'Ödendi',
      value: stats.paidRecords,
      percentage: stats.totalRecords > 0 ? (stats.paidRecords / stats.totalRecords) * 100 : 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Bekliyor',
      value: stats.pendingRecords,
      percentage: stats.totalRecords > 0 ? (stats.pendingRecords / stats.totalRecords) * 100 : 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'İptal Edildi',
      value: stats.cancelledRecords,
      percentage: stats.totalRecords > 0 ? (stats.cancelledRecords / stats.totalRecords) * 100 : 0,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400'
    }
  ];

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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Maaş İstatistikleri
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getCurrentPeriod()} dönemi
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((card, index) => {
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
            Ödeme Durumu Dağılımı
          </h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {statusCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${card.color} flex items-center justify-center mr-3`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {card.title}
                      </span>
                    </div>
                    <span className={`text-lg font-semibold ${card.textColor}`}>
                      {card.value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${card.color}`}
                      style={{ width: `${card.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    %{card.percentage.toFixed(1)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Özet Bilgiler
          </h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Toplam Maaş Maliyeti
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(stats.totalGrossSalary + stats.totalOvertimePay + stats.totalBonus)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Brüt + Mesai + Bonus
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Ortalama Net Maaş
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(stats.totalNetSalary / Math.max(stats.totalRecords, 1))}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kişi başı ortalama
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Kesinti Oranı
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                %{stats.totalGrossSalary > 0 ? ((stats.totalDeductions / stats.totalGrossSalary) * 100).toFixed(1) : 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Toplam kesinti oranı
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Ödeme Tamamlanma
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                %{stats.totalRecords > 0 ? ((stats.paidRecords / stats.totalRecords) * 100).toFixed(1) : 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ödenen kayıt oranı
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 