'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, Users, Building, Calendar, DollarSign } from 'lucide-react';

interface PayrollFiltersProps {
  filters: {
    month: number;
    year: number;
    employee: string;
    department: string;
    status: string;
  };
  onFilterChange: (filters: any) => void;
}

const departments = [
  'Tümü',
  'İnsan Kaynakları',
  'Muhasebe',
  'Satış',
  'Pazarlama',
  'Teknoloji',
  'Operasyon',
  'Yönetim'
];

const paymentStatuses = [
  { value: '', label: 'Tümü' },
  { value: 'pending', label: 'Bekliyor' },
  { value: 'paid', label: 'Ödendi' },
  { value: 'cancelled', label: 'İptal Edildi' }
];

const months = [
  { value: 1, label: 'Ocak' },
  { value: 2, label: 'Şubat' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Nisan' },
  { value: 5, label: 'Mayıs' },
  { value: 6, label: 'Haziran' },
  { value: 7, label: 'Temmuz' },
  { value: 8, label: 'Ağustos' },
  { value: 9, label: 'Eylül' },
  { value: 10, label: 'Ekim' },
  { value: 11, label: 'Kasım' },
  { value: 12, label: 'Aralık' }
];

export default function PayrollFilters({ filters, onFilterChange }: PayrollFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ [key]: value });
    updateActiveFiltersCount({ ...filters, [key]: value });
  };

  const updateActiveFiltersCount = (newFilters: any) => {
    let count = 0;
    if (newFilters.department && newFilters.department !== 'Tümü') count++;
    if (newFilters.employee) count++;
    if (newFilters.status) count++;
    setActiveFilters(count);
  };

  const clearAllFilters = () => {
    onFilterChange({
      department: '',
      employee: '',
      status: ''
    });
    setActiveFilters(0);
  };

  const clearFilter = (key: string) => {
    handleFilterChange(key, '');
  };

  const getCurrentMonthYear = () => {
    const currentDate = new Date();
    return {
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear()
    };
  };

  const setCurrentPeriod = () => {
    const { month, year } = getCurrentMonthYear();
    handleFilterChange('month', month);
    handleFilterChange('year', year);
  };

  const setPreviousMonth = () => {
    const currentMonth = filters.month;
    const currentYear = filters.year;
    
    if (currentMonth === 1) {
      handleFilterChange('month', 12);
      handleFilterChange('year', currentYear - 1);
    } else {
      handleFilterChange('month', currentMonth - 1);
    }
  };

  const setNextMonth = () => {
    const currentMonth = filters.month;
    const currentYear = filters.year;
    
    if (currentMonth === 12) {
      handleFilterChange('month', 1);
      handleFilterChange('year', currentYear + 1);
    } else {
      handleFilterChange('month', currentMonth + 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Maaş Filtreleri
            </h3>
            {activeFilters > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                {activeFilters} aktif
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFilters > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAllFilters}
                className="inline-flex items-center px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Temizle
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              {isOpen ? 'Gizle' : 'Göster'}
            </motion.button>
          </div>
        </div>

        {/* Active Filters Display */}
        <AnimatePresence>
          {activeFilters > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="flex flex-wrap gap-2">
                {filters.department && filters.department !== 'Tümü' && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    <Building className="h-3 w-3 mr-1" />
                    {filters.department}
                    <button
                      onClick={() => clearFilter('department')}
                      className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                )}
                
                {filters.employee && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {filters.employee}
                    <button
                      onClick={() => clearFilter('employee')}
                      className="ml-2 hover:text-green-600 dark:hover:text-green-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                )}
                
                {filters.status && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    {paymentStatuses.find(s => s.value === filters.status)?.label}
                    <button
                      onClick={() => clearFilter('status')}
                      className="ml-2 hover:text-purple-600 dark:hover:text-purple-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Month/Year Selector */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Dönem Seçimi
            </h4>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={setPreviousMonth}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ←
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={setCurrentPeriod}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                Bu Ay
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={setNextMonth}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                →
              </motion.button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ay
              </label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Yıl
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filters Form */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Departman
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept === 'Tümü' ? '' : dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Çalışan
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.employee}
                      onChange={(e) => handleFilterChange('employee', e.target.value)}
                      placeholder="Çalışan ara..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ödeme Durumu
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {paymentStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 