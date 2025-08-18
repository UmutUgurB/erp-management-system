'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  Plus,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import LeaveFilters from '@/components/Leave/LeaveFilters';
import LeaveStats from '@/components/Leave/LeaveStats';
import LeaveOverview from '@/components/Leave/LeaveOverview';
import LeaveTable from '@/components/Leave/LeaveTable';
import LeaveForm from '@/components/Leave/LeaveForm';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

interface Leave {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  reason: string;
  urgency: string;
  category: string;
  createdAt: string;
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
}

interface LeaveStats {
  totalLeaves: number;
  totalDays: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  cancelledLeaves: number;
  annualLeaves: number;
  sickLeaves: number;
  personalLeaves: number;
}

const LeavePage = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  // State management
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [filters, setFilters] = useState({
    employee: '',
    department: '',
    status: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    year: new Date().getFullYear()
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalRecords: 0
  });

  // Fetch leaves data
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
      
      queryParams.append('page', pagination.current.toString());
      queryParams.append('limit', '20');
      
      const response = await fetch(`/api/leave?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch leaves');
      
      const data = await response.json();
      setLeaves(data.data.leaves);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      showNotification('İzin verileri yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave statistics
  const fetchStats = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.year) queryParams.append('year', filters.year.toString());
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.status) queryParams.append('status', filters.status);
      
      const response = await fetch(`/api/leave/stats/overview?${queryParams}`, {
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
      const url = selectedLeave ? `/api/leave/${selectedLeave._id}` : '/api/leave';
      const method = selectedLeave ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to save leave request');
      
      const data = await response.json();
      
      showNotification(
        selectedLeave ? 'İzin talebi güncellendi' : 'İzin talebi oluşturuldu',
        'success'
      );
      
      setShowForm(false);
      setSelectedLeave(null);
      fetchLeaves();
      fetchStats();
    } catch (error) {
      console.error('Error saving leave request:', error);
      showNotification('İzin talebi kaydedilirken hata oluştu', 'error');
    }
  };

  // Handle leave approval/rejection
  const handleLeaveAction = async (leaveId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await fetch(`/api/leave/${leaveId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ approvalNotes: notes })
      });
      
      if (!response.ok) throw new Error(`Failed to ${action} leave request`);
      
      showNotification(`İzin talebi ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`, 'success');
      fetchLeaves();
      fetchStats();
    } catch (error) {
      console.error(`Error ${action}ing leave request:`, error);
      showNotification(`İzin talebi ${action === 'approve' ? 'onaylanırken' : 'reddedilirken'} hata oluştu`, 'error');
    }
  };

  // Handle leave deletion
  const handleDeleteLeave = async (leaveId: string) => {
    if (!confirm('Bu izin talebini silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch(`/api/leave/${leaveId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete leave request');
      
      showNotification('İzin talebi silindi', 'success');
      fetchLeaves();
      fetchStats();
    } catch (error) {
      console.error('Error deleting leave request:', error);
      showNotification('İzin talebi silinirken hata oluştu', 'error');
    }
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
      
      const response = await fetch(`/api/leave/export/${format}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to export data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leaves-${new Date().toISOString().split('T')[0]}.${format}`;
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
    fetchLeaves();
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                İzin Yönetimi
              </h1>
              <p className="text-gray-600 mt-2">
                Çalışan izin taleplerini yönetin ve takip edin
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchLeaves()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Yenile
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Yeni İzin Talebi
              </motion.button>
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
          <LeaveFilters
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
          <LeaveStats stats={stats} />
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <LeaveOverview leaves={leaves} stats={stats} />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <LeaveTable
            leaves={leaves}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={(leave) => {
              setSelectedLeave(leave);
              setShowForm(true);
            }}
            onDelete={handleDeleteLeave}
            onApprove={(leaveId) => handleLeaveAction(leaveId, 'approve')}
            onReject={(leaveId) => handleLeaveAction(leaveId, 'reject')}
          />
        </motion.div>

        {/* Form Modal */}
        {showForm && (
          <LeaveForm
            leave={selectedLeave}
            onClose={() => {
              setShowForm(false);
              setSelectedLeave(null);
            }}
            onSubmit={handleFormSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default LeavePage; 