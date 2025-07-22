'use client';

import { motion } from 'framer-motion';
import { EmployeeStats as EmployeeStatsType } from '@/types/employee';
import { Users, UserCheck, UserX, UserMinus, DollarSign, TrendingUp } from 'lucide-react';

interface EmployeeStatsProps {
  stats: EmployeeStatsType;
}

const statCards = [
  {
    name: 'Toplam Çalışan',
    value: 'totalEmployees',
    icon: Users,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300'
  },
  {
    name: 'Aktif Çalışan',
    value: 'activeEmployees',
    icon: UserCheck,
    color: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-300'
  },
  {
    name: 'Pasif Çalışan',
    value: 'inactiveEmployees',
    icon: UserX,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-700 dark:text-yellow-300'
  },
  {
    name: 'İşten Ayrılan',
    value: 'terminatedEmployees',
    icon: UserMinus,
    color: 'bg-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-300'
  },
  {
    name: 'Ortalama Maaş',
    value: 'averageSalary',
    icon: DollarSign,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-300',
    format: (value: number) => `₺${value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
  },
  {
    name: 'Toplam Maaş',
    value: 'totalSalary',
    icon: TrendingUp,
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    format: (value: number) => `₺${value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
  }
];

export default function EmployeeStats({ stats }: EmployeeStatsProps) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Genel İstatistikler
      </h2>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const value = stats.overview[card.value as keyof typeof stats.overview] as number;
          const displayValue = card.format ? card.format(value) : value.toLocaleString('tr-TR');
          
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

      {/* Department Stats */}
      {stats.departmentStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Departman Dağılımı
          </h3>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.departmentStats.map((dept, index) => (
                  <motion.div
                    key={dept._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {dept._id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {dept.count} çalışan
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ₺{dept.averageSalary.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ortalama maaş
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Hires */}
      {stats.recentHires.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Son İşe Alınanlar
          </h3>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-3">
                {stats.recentHires.map((employee, index) => (
                  <motion.div
                    key={employee._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {employee.position} • {employee.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(employee.hireDate).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 