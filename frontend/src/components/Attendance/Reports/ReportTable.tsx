'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Attendance } from '@/types/attendance';
import { Clock, LogIn, LogOut, Coffee, AlertTriangle, CheckCircle, XCircle, Calendar } from 'lucide-react';
import AnimatedLoading from '@/components/UI/AnimatedLoading';

interface ReportTableProps {
  attendance: Attendance[];
  loading: boolean;
  filters: {
    startDate: string;
    endDate: string;
    department: string;
    employee: string;
    status: string;
    reportType: string;
  };
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

export default function ReportTable({ attendance, loading, filters }: ReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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

  const getNetWorkHours = (att: Attendance) => {
    const workHours = att.totalWorkHours || 0;
    const breakHours = att.totalBreakHours || 0;
    return workHours - breakHours;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortData = (data: Attendance[]) => {
    return data.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'employee':
          aValue = `${a.employee.firstName} ${a.employee.lastName}`;
          bValue = `${b.employee.firstName} ${b.employee.lastName}`;
          break;
        case 'department':
          aValue = a.employee.department;
          bValue = b.employee.department;
          break;
        case 'status':
          aValue = statusLabels[a.status as keyof typeof statusLabels];
          bValue = statusLabels[b.status as keyof typeof statusLabels];
          break;
        case 'workHours':
          aValue = getNetWorkHours(a);
          bValue = getNetWorkHours(b);
          break;
        case 'overtime':
          aValue = a.overtime || 0;
          bValue = b.overtime || 0;
          break;
        default:
          aValue = a[sortField as keyof Attendance];
          bValue = b[sortField as keyof Attendance];
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedData = sortData([...attendance]);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-center h-32">
            <AnimatedLoading size="md" text="Veriler yükleniyor..." />
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
            Detaylı Rapor Tablosu
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {attendance.length} kayıt bulundu
          </p>
        </div>

        {attendance.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Calendar className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              Veri bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Seçilen filtreler için veri bulunmuyor.
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
                      { key: 'date', label: 'Tarih' },
                      { key: 'employee', label: 'Çalışan' },
                      { key: 'department', label: 'Departman' },
                      { key: 'status', label: 'Durum' },
                      { key: 'checkIn', label: 'Giriş' },
                      { key: 'checkOut', label: 'Çıkış' },
                      { key: 'workHours', label: 'Çalışma' },
                      { key: 'breakHours', label: 'Mola' },
                      { key: 'netWorkHours', label: 'Net Çalışma' },
                      { key: 'overtime', label: 'Mesai' },
                      { key: 'lateMinutes', label: 'Geç Kalma' }
                    ].map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort(column.key)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.label}</span>
                          {getSortIcon(column.key) && (
                            <span className="text-gray-400">{getSortIcon(column.key)}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentData.map((att, index) => (
                    <motion.tr
                      key={att._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(att.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                                {att.employee.firstName.charAt(0)}{att.employee.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {att.employee.firstName} {att.employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {att.employee.position}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {att.employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[att.status as keyof typeof statusColors]}`}>
                          {getStatusIcon(att.status)}
                          <span className="ml-1">{statusLabels[att.status as keyof typeof statusLabels]}</span>
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
                          {(att.totalWorkHours || 0).toFixed(1)} saat
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <Coffee className="h-4 w-4 mr-1 text-gray-400" />
                          {(att.totalBreakHours || 0).toFixed(1)} saat
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {getNetWorkHours(att).toFixed(1)} saat
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {(att.overtime || 0).toFixed(1)} saat
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {att.lateMinutes ? (
                          <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {att.lateMinutes} dk
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
                    {startIndex + 1} - {Math.min(endIndex, attendance.length)} / {attendance.length} kayıt
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