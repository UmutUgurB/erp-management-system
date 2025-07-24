'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Users, 
  Award, 
  Plus,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import PerformanceFilters from '@/components/Performance/PerformanceFilters';
import PerformanceStats from '@/components/Performance/PerformanceStats';
import PerformanceOverview from '@/components/Performance/PerformanceOverview';
import PerformanceTable from '@/components/Performance/PerformanceTable';
import PerformanceForm from '@/components/Performance/PerformanceForm';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Performance as PerformanceType, PerformanceStats as PerformanceStatsType } from '@/types/performance';

const PerformancePage = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  // State management
  const [performances, setPerformances] = useState<PerformanceType[]>([]);
  const [stats, setStats] = useState<PerformanceStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceType | null>(null);
  const [filters, setFilters] = useState({
    employee: '',
    department: '',
    status: '',
    evaluationType: '',
    year: new Date().getFullYear(),
    quarter: Math.ceil((new Date().getMonth() + 1) / 3)
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalRecords: 0
  });

  // Fetch performances data
  const fetchPerformances = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
      
      queryParams.append('page', pagination.current.toString());
      queryParams.append('limit', '20');
      
      const response = await fetch(`/api/performance?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch performances');
      
      const data = await response.json();
      setPerformances(data.data.performances);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching performances:', error);
      showNotification('Performans verileri yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch performance statistics
  const fetchStats = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.year) queryParams.append('year', filters.year.toString());
      if (filters.quarter) queryParams.append('quarter', filters.quarter.toString());
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.status) queryParams.append('status', filters.status);
      
      const response = await fetch(`/api/performance/stats/overview?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData: any) => {
    try {
      const url = selectedPerformance ? `/api/performance/${selectedPerformance._id}` : '/api/performance';
      const method = selectedPerformance ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to save performance evaluation');
      
      const data = await response.json();
      
      showNotification(
        selectedPerformance ? 'Performans değerlendirmesi güncellendi' : 'Performans değerlendirmesi oluşturuldu',
        'success'
      );
      
      setShowForm(false);
      setSelectedPerformance(null);
      fetchPerformances();
      fetchStats();
    } catch (error) {
      console.error('Error saving performance evaluation:', error);
      showNotification('Performans değerlendirmesi kaydedilirken hata oluştu', 'error');
    }
  };

  // Handle performance approval
  const handlePerformanceAction = async (performanceId: string, action: 'approve' | 'complete') => {
    try {
      const response = await fetch(`/api/performance/${performanceId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error(`Failed to ${action} performance evaluation`);
      
      showNotification(`Performans değerlendirmesi ${action === 'approve' ? 'onaylandı' : 'tamamlandı'}`, 'success');
      fetchPerformances();
      fetchStats();
    } catch (error) {
      console.error(`Error ${action}ing performance evaluation:`, error);
      showNotification(`Performans değerlendirmesi ${action === 'approve' ? 'onaylanırken' : 'tamamlanırken'} hata oluştu`, 'error');
    }
  };

  // Handle performance deletion
  const handleDeletePerformance = async (performanceId: string) => {
    if (!confirm('Bu performans değerlendirmesini silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch(`/api/performance/${performanceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete performance evaluation');
      
      showNotification('Performans değerlendirmesi silindi', 'success');
      fetchPerformances();
      fetchStats();
    } catch (error) {
      console.error('Error deleting performance evaluation:', error);
      showNotification('Performans değerlendirmesi silinirken hata oluştu', 'error');
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
      
      const response = await fetch(`/api/performance/export/${format}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to export data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification(`${format.toUpperCase()} dosyası indirildi`, 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('Dosya indirilirken hata oluştu', 'error');
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  // Initial data fetch
  useEffect(() => {
    fetchPerformances();
    fetchStats();
  }, [filters, pagination.current]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                Performans Yönetimi
              </h1>
              <p className="text-gray-600 mt-2">
                Çalışan performans değerlendirmelerini yönetin ve takip edin
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchPerformances()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Yenile
              </button>
              
              <div className="relative">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Dışa Aktar
                </button>
              </div>
              
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni Değerlendirme
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <PerformanceFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <PerformanceStats stats={stats} />
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <PerformanceOverview performances={performances} stats={stats} />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PerformanceTable
            performances={performances}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={(performance) => {
              setSelectedPerformance(performance);
              setShowForm(true);
            }}
            onDelete={handleDeletePerformance}
            onApprove={(performanceId) => handlePerformanceAction(performanceId, 'approve')}
            onComplete={(performanceId) => handlePerformanceAction(performanceId, 'complete')}
          />
        </motion.div>

        {/* Form Modal */}
        {showForm && (
          <PerformanceForm
            performance={selectedPerformance}
            onClose={() => {
              setShowForm(false);
              setSelectedPerformance(null);
            }}
            onSubmit={handleFormSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default PerformancePage; 