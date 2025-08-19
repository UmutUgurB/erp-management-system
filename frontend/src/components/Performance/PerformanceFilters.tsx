'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, X, Search, Calendar, User, Building, Award } from 'lucide-react';

interface PerformanceFiltersProps {
  filters: {
    employee: string;
    department: string;
    status: string;
    evaluationType: string;
    year: number;
    quarter: number;
  };
  onFilterChange: (filters: any) => void;
}

const PerformanceFilters: React.FC<PerformanceFiltersProps> = ({ filters, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      employee: '',
      department: '',
      status: '',
      evaluationType: '',
      year: new Date().getFullYear(),
      quarter: Math.ceil((new Date().getMonth() + 1) / 3)
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== new Date().getFullYear() && value !== Math.ceil((new Date().getMonth() + 1) / 3)
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filtreler</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                Aktif
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Temizle
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
              {showFilters ? 'Gizle' : 'Göster'}
            </button>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Employee Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Çalışan
                </label>
                <input
                  type="text"
                  value={filters.employee}
                  onChange={(e) => handleFilterChange('employee', e.target.value)}
                  placeholder="Çalışan adı..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  Departman
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Tümü</option>
                  <option value="IT">IT</option>
                  <option value="HR">İnsan Kaynakları</option>
                  <option value="Finance">Finans</option>
                  <option value="Marketing">Pazarlama</option>
                  <option value="Sales">Satış</option>
                  <option value="Operations">Operasyon</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Award className="w-4 h-4 inline mr-2" />
                  Durum
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Tümü</option>
                  <option value="pending">Beklemede</option>
                  <option value="in_progress">Devam Ediyor</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="approved">Onaylandı</option>
                  <option value="rejected">Reddedildi</option>
                </select>
              </div>

              {/* Evaluation Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Award className="w-4 h-4 inline mr-2" />
                  Değerlendirme Türü
                </label>
                <select
                  value={filters.evaluationType}
                  onChange={(e) => handleFilterChange('evaluationType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Tümü</option>
                  <option value="quarterly">3 Aylık</option>
                  <option value="annual">Yıllık</option>
                  <option value="project">Proje Bazlı</option>
                  <option value="skill">Yetenek Bazlı</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Yıl
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Quarter Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Çeyrek
                </label>
                <select
                  value={filters.quarter}
                  onChange={(e) => handleFilterChange('quarter', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value={1}>1. Çeyrek (Ocak-Mart)</option>
                  <option value={2}>2. Çeyrek (Nisan-Haziran)</option>
                  <option value={3}>3. Çeyrek (Temmuz-Eylül)</option>
                  <option value={4}>4. Çeyrek (Ekim-Aralık)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PerformanceFilters;
