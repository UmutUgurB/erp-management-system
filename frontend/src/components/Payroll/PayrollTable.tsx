'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, Users, CheckCircle, AlertTriangle, XCircle, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import AnimatedLoading from '@/components/UI/AnimatedLoading';

interface PayrollTableProps {
  payroll: any[];
  loading: boolean;
  filters: {
    month: number;
    year: number;
    employee: string;
    department: string;
    status: string;
  };
  onRefresh: () => void;
}

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

const months = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function PayrollTable({ payroll, loading, filters, onRefresh }: PayrollTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortField, setSortField] = useState('employee');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons];
    return <Icon className="h-4 w-4" />;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortData = (data: any[]) => {
    return data.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'employee':
          aValue = `${a.employee.firstName} ${a.employee.lastName}`;
          bValue = `${b.employee.firstName} ${b.employee.lastName}`;
          break;
        case 'department':
          aValue = a.employee.department;
          bValue = b.employee.department;
          break;
        case 'netSalary':
          aValue = a.netSalary || 0;
          bValue = b.netSalary || 0;
          break;
        case 'grossSalary':
          aValue = a.grossSalary || 0;
          bValue = b.grossSalary || 0;
          break;
        case 'overtimePay':
          aValue = a.overtimePay || 0;
          bValue = b.overtimePay || 0;
          break;
        case 'paymentStatus':
          aValue = statusLabels[a.paymentStatus as keyof typeof statusLabels];
          bValue = statusLabels[b.paymentStatus as keyof typeof statusLabels];
          break;
        case 'workDays':
          aValue = a.totalWorkDays || 0;
          bValue = b.totalWorkDays || 0;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedData = sortData([...payroll]);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleViewDetails = (payrollId: string) => {
    // TODO: Implement view details modal
    console.log('View details for payroll:', payrollId);
  };

  const handleEdit = (payrollId: string) => {
    // TODO: Implement edit modal
    console.log('Edit payroll:', payrollId);
  };

  const handleDelete = (payrollId: string) => {
    // TODO: Implement delete confirmation
    console.log('Delete payroll:', payrollId);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-center h-32">
            <AnimatedLoading size="md" text="Maaş verileri yükleniyor..." />
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
            Maaş Tablosu
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {payroll.length} kayıt bulundu
          </p>
        </div>

        {payroll.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <DollarSign className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              Maaş kaydı bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Seçilen dönem için maaş kaydı bulunmuyor.
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {[
                      { key: 'employee', label: 'Çalışan' },
                      { key: 'department', label: 'Departman' },
                      { key: 'period', label: 'Dönem' },
                      { key: 'grossSalary', label: 'Brüt Maaş' },
                      { key: 'overtimePay', label: 'Mesai' },
                      { key: 'bonus', label: 'Bonus' },
                      { key: 'deductions', label: 'Kesintiler' },
                      { key: 'netSalary', label: 'Net Maaş' },
                      { key: 'workDays', label: 'Çalışma Günü' },
                      { key: 'paymentStatus', label: 'Durum' },
                      { key: 'actions', label: 'İşlemler' }
                    ].map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => column.key !== 'actions' && handleSort(column.key)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.label}</span>
                          {column.key !== 'actions' && getSortIcon(column.key) && (
                            <span className="text-gray-400">{getSortIcon(column.key)}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentData.map((p, index) => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                                {p.employee.firstName.charAt(0)}{p.employee.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {p.employee.firstName} {p.employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {p.employee.position}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {p.employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {months[p.month - 1]} {p.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          {formatCurrency(p.grossSalary || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {formatCurrency(p.overtimePay || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(p.bonus || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(p.totalDeductions || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(p.netSalary || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {p.totalWorkDays || 0} gün
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[p.paymentStatus as keyof typeof statusColors]}`}>
                          {getStatusIcon(p.paymentStatus)}
                          <span className="ml-1">{statusLabels[p.paymentStatus as keyof typeof statusLabels]}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewDetails(p._id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(p._id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(p._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 flex items-center justify-between"
              >
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <span>
                    {startIndex + 1} - {Math.min(endIndex, payroll.length)} / {payroll.length} kayıt
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Önceki
                  </motion.button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </motion.button>
                    );
                  })}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sonraki
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 