'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { employeesAPI } from '@/lib/api';
import { Employee, EmployeeFilters as EmployeeFiltersType, EmployeeStats as EmployeeStatsType } from '@/types/employee';
import EmployeeList from '@/components/Employees/EmployeeList';
import EmployeeStats from '@/components/Employees/EmployeeStats';
import EmployeeFilters from '@/components/Employees/EmployeeFilters';
import EmployeeModal from '@/components/Employees/EmployeeModal';
import AnimatedLoading from '@/components/UI/AnimatedLoading';
import { Plus, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EmployeeFiltersType>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesAPI.getEmployees(filters);
      setEmployees(response.data.employees);
      setTotalPages(response.data.totalPages);
      setTotalEmployees(response.data.totalEmployees);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await employeesAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) {
      try {
        await employeesAPI.deleteEmployee(id);
        fetchEmployees();
        fetchStats();
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const handleSaveEmployee = async (employeeData: any) => {
    try {
      if (selectedEmployee) {
        await employeesAPI.updateEmployee(selectedEmployee._id, employeeData);
      } else {
        await employeesAPI.createEmployee(employeeData);
      }
      setShowModal(false);
      fetchEmployees();
      fetchStats();
    } catch (error) {
      console.error('Failed to save employee:', error);
    }
  };

  const handleFilterChange = (newFilters: Partial<EmployeeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (loading && employees.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <AnimatedLoading size="lg" text="Çalışanlar yükleniyor..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
              Çalışan Yönetimi
            </h1>
            <p className="text-muted-foreground mt-2">
              Çalışan bilgileri, performans takibi ve ekip yönetimi
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateEmployee}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Yeni Çalışan
          </motion.button>
        </div>

        {/* Enhanced Stats Cards */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Toplam Çalışan</p>
                  <p className="text-3xl font-bold">{stats.totalEmployees}</p>
                </div>
                <div className="p-3 bg-blue-400 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-blue-100 text-sm">
                  <span className="text-green-300">↗</span>
                  <span className="ml-1">+8%</span>
                  <span className="ml-2">geçen aya göre</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Aktif Çalışan</p>
                  <p className="text-3xl font-bold">{stats.activeEmployees}</p>
                </div>
                <div className="p-3 bg-green-400 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-green-100 text-sm">
                  <span className="text-green-300">↗</span>
                  <span className="ml-1">+12%</span>
                  <span className="ml-2">geçen aya göre</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Yeni Çalışan</p>
                  <p className="text-3xl font-bold">{stats.newEmployeesThisMonth}</p>
                </div>
                <div className="p-3 bg-purple-400 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-purple-100 text-sm">
                  <span className="text-green-300">↗</span>
                  <span className="ml-1">+15%</span>
                  <span className="ml-2">geçen aya göre</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">İzinli Çalışan</p>
                  <p className="text-3xl font-bold">{stats.employeesOnLeave}</p>
                </div>
                <div className="p-3 bg-orange-400 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-orange-100 text-sm">
                  <span className="text-red-300">↘</span>
                  <span className="ml-1">-3%</span>
                  <span className="ml-2">geçen aya göre</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Employee Insights */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Departman Dağılımı</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">IT Departmanı</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((stats.departmentStats?.IT || 0) / stats.totalEmployees * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Satış Departmanı</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((stats.departmentStats?.Sales || 0) / stats.totalEmployees * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Pazarlama</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((stats.departmentStats?.Marketing || 0) / stats.totalEmployees * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Çalışan Trendi</h3>
              <div className="h-48 flex items-end justify-between space-x-2">
                {Array.from({ length: 6 }, (_, i) => {
                  const month = new Date();
                  month.setMonth(month.getMonth() - (5 - i));
                  const monthEmployees = Math.floor(Math.random() * 30) + 20; // Mock data
                  const maxEmployees = 50;
                  const height = (monthEmployees / maxEmployees) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center space-y-2">
                      <div 
                        className="w-8 bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg transition-all duration-300 hover:scale-110"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500">
                        {month.toLocaleDateString('tr-TR', { month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <EmployeeFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            totalEmployees={totalEmployees}
          />
        </motion.div>

        {/* Employee List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <EmployeeList
            employees={employees}
            loading={loading}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
            currentPage={filters.page || 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </motion.div>

        {/* Modal */}
        {showModal && (
          <EmployeeModal
            employee={selectedEmployee}
            onClose={() => setShowModal(false)}
            onSave={handleSaveEmployee}
          />
        )}
      </div>
    </DashboardLayout>
  );
} 