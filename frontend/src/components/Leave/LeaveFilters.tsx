'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  Search, 
  Calendar,
  User,
  Building,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { LeaveFilters as LeaveFiltersType } from '@/types/leave';

interface LeaveFiltersProps {
  filters: LeaveFiltersType;
  onFilterChange: (filters: LeaveFiltersType) => void;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  department: string;
}

const LeaveFilters: React.FC<LeaveFiltersProps> = ({ filters, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [localFilters, setLocalFilters] = useState<LeaveFiltersType>(filters);

  // Fetch employees and departments
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setEmployees(data.data.users || []);
          
          // Extract unique departments
          const uniqueDepartments = [...new Set(data.data.users.map((user: Employee) => user.department))];
          setDepartments(uniqueDepartments);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  // Apply filters
  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters = {
      employee: '',
      department: '',
      status: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      year: new Date().getFullYear()
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== undefined && value !== new Date().getFullYear()
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Aktif
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Temizle
              </button>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {showFilters ? 'Gizle' : 'Göster'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Yıl
                </label>
                <select
                  value={localFilters.year || new Date().getFullYear()}
                  onChange={(e) => setLocalFilters(prev => ({ 
                    ...prev, 
                    year: parseInt(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Employee Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Çalışan
                  </label>
                  <select
                    value={localFilters.employee || ''}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      employee: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tüm Çalışanlar</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Departman
                  </label>
                  <select
                    value={localFilters.department || ''}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      department: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tüm Departmanlar</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Durum
                  </label>
                  <select
                    value={localFilters.status || ''}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      status: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tüm Durumlar</option>
                    <option value="pending">Bekliyor</option>
                    <option value="approved">Onaylandı</option>
                    <option value="rejected">Reddedildi</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>
                </div>

                {/* Leave Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    İzin Türü
                  </label>
                  <select
                    value={localFilters.leaveType || ''}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      leaveType: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tüm İzin Türleri</option>
                    <option value="annual">Yıllık İzin</option>
                    <option value="sick">Hastalık İzni</option>
                    <option value="personal">Mazeret İzni</option>
                    <option value="maternity">Doğum İzni</option>
                    <option value="paternity">Babalar İzni</option>
                    <option value="unpaid">Ücretsiz İzin</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                {/* Start Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={localFilters.startDate || ''}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      startDate: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* End Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={localFilters.endDate || ''}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      endDate: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-4 h-4 inline mr-1" />
                  Filtrele
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaveFilters; 