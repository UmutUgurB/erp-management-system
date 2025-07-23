'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, Users, Building, Calendar } from 'lucide-react';

interface CalendarFiltersProps {
  filters: {
    department: string;
    employee: string;
    status: string;
    startDate: string;
    endDate: string;
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

export default function CalendarFilters({ filters, onFilterChange }: CalendarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ [key]: value });
    updateActiveFiltersCount({ ...filters, [key]: value });
  };

  const updateActiveFiltersCount = (newFilters: any) => {
    let count = 0;
    if (newFilters.department) count++;
    if (newFilters.employee) count++;
    if (newFilters.status) count++;
    if (newFilters.startDate) count++;
    if (newFilters.endDate) count++;
    setActiveFilters(count);
  };

  const clearAllFilters = () => {
    onFilterChange({
      department: '',
      employee: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    setActiveFilters(0);
  };

  const clearFilter = (key: string) => {
    handleFilterChange(key, '');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Filtreler
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
                {filters.department && (
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
                    <Calendar className="h-3 w-3 mr-1" />
                    {statuses.find(s => s.value === filters.status)?.label}
                    <button
                      onClick={() => clearFilter('status')}
                      className="ml-2 hover:text-purple-600 dark:hover:text-purple-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                )}
                
                {(filters.startDate || filters.endDate) && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {filters.startDate && filters.endDate 
                      ? `${filters.startDate} - ${filters.endDate}`
                      : filters.startDate || filters.endDate
                    }
                    <button
                      onClick={() => {
                        clearFilter('startDate');
                        clearFilter('endDate');
                      }}
                      className="ml-2 hover:text-orange-600 dark:hover:text-orange-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    Durum
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tarih Aralığı
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Date Presets */}
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    
                    handleFilterChange('startDate', startOfWeek.toISOString().split('T')[0]);
                    handleFilterChange('endDate', endOfWeek.toISOString().split('T')[0]);
                  }}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  Bu Hafta
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const today = new Date();
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    
                    handleFilterChange('startDate', startOfMonth.toISOString().split('T')[0]);
                    handleFilterChange('endDate', endOfMonth.toISOString().split('T')[0]);
                  }}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  Bu Ay
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date(today);
                    lastWeek.setDate(today.getDate() - 7);
                    
                    handleFilterChange('startDate', lastWeek.toISOString().split('T')[0]);
                    handleFilterChange('endDate', today.toISOString().split('T')[0]);
                  }}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                >
                  Son 7 Gün
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today);
                    lastMonth.setDate(today.getDate() - 30);
                    
                    handleFilterChange('startDate', lastMonth.toISOString().split('T')[0]);
                    handleFilterChange('endDate', today.toISOString().split('T')[0]);
                  }}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                >
                  Son 30 Gün
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 