'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, CheckCircle, XCircle, Clock, Award, User, Calendar, Target } from 'lucide-react';
import { Performance as PerformanceType } from '@/types/performance';

interface PerformanceTableProps {
  performances: PerformanceType[];
  loading?: boolean;
  pagination: {
    current: number;
    total: number;
    totalRecords: number;
  };
  onPageChange: (page: number) => void;
  onEdit: (performance: PerformanceType) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onComplete: (id: string) => void;
}

const PerformanceTable: React.FC<PerformanceTableProps> = ({
  performances,
  loading = false,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onApprove,
  onComplete
}) => {
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceType | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'approved': return 'Onaylandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'pending': return 'Beklemede';
      case 'rejected': return 'Reddedildi';
      default: return 'Bilinmeyen';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Mükemmel';
    if (score >= 80) return 'İyi';
    if (score >= 70) return 'Orta';
    if (score >= 60) return 'Orta Altı';
    return 'Zayıf';
  };

  const getEvaluationTypeText = (type: string) => {
    switch (type) {
      case 'quarterly': return '3 Aylık';
      case 'annual': return 'Yıllık';
      case 'project': return 'Proje Bazlı';
      case 'skill': return 'Yetenek Bazlı';
      default: return 'Bilinmeyen';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (performances.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Henüz performans değerlendirmesi bulunmuyor
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          İlk performans değerlendirmesini oluşturmak için yukarıdaki &quot;Yeni Değerlendirme&quot; butonuna tıklayın.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Performans Değerlendirmeleri
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Toplam {pagination.totalRecords} kayıt bulundu
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Çalışan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Değerlendirme
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Puan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {performances.map((performance, index) => (
              <motion.tr
                key={performance._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {/* Employee Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {performance.employee?.name || 'Bilinmeyen Çalışan'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {performance.employee?.department || 'Departman yok'} • {performance.employee?.position || 'Pozisyon yok'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Evaluation Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {getEvaluationTypeText(performance.evaluationType || '')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {performance.evaluationType === 'quarterly' ? '3 Aylık' : 
                     performance.evaluationType === 'annual' ? 'Yıllık' : 
                     performance.evaluationType === 'project' ? 'Proje Bazlı' : 'Yetenek Bazlı'}
                  </div>
                </td>

                {/* Score */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`text-2xl font-bold ${getScoreColor(performance.score || 0)}`}>
                      {performance.score || 0}
                    </div>
                    <div className="ml-2">
                      <div className={`text-sm font-medium ${getScoreColor(performance.score || 0)}`}>
                        {getScoreLabel(performance.score || 0)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        /100
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(performance.status || 'pending')}`}>
                    {getStatusText(performance.status || 'pending')}
                  </span>
                </td>

                {/* Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {performance.evaluationDate ? 
                      new Date(performance.evaluationDate).toLocaleDateString('tr-TR') : 
                      'Tarih yok'
                    }
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {/* View Details */}
                    <button
                      onClick={() => setSelectedPerformance(performance)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Detayları Görüntüle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(performance)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Approve */}
                    {performance.status === 'pending' && (
                      <button
                        onClick={() => onApprove(performance._id || '')}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Onayla"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Complete */}
                    {performance.status === 'approved' && (
                      <button
                        onClick={() => onComplete(performance._id || '')}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Tamamla"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(performance._id || '')}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Sayfa {pagination.current} / {pagination.total} ({pagination.totalRecords} kayıt)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(pagination.current - 1)}
                disabled={pagination.current <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Önceki
              </button>
              <button
                onClick={() => onPageChange(pagination.current + 1)}
                disabled={pagination.current >= pagination.total}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Details Modal */}
      {selectedPerformance && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPerformance(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Performans Detayları
                </h3>
                <button
                  onClick={() => setSelectedPerformance(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Çalışan</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPerformance.employee?.name || 'Bilinmeyen'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Puan</label>
                    <p className={`text-sm font-bold ${getScoreColor(selectedPerformance.score || 0)}`}>
                      {selectedPerformance.score || 0}/100
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPerformance.status || 'pending')}`}>
                      {getStatusText(selectedPerformance.status || 'pending')}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tarih</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedPerformance.evaluationDate ? 
                        new Date(selectedPerformance.evaluationDate).toLocaleDateString('tr-TR') : 
                        'Tarih yok'
                      }
                    </p>
                  </div>
                </div>
                
                {selectedPerformance.goals && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Hedefler</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPerformance.goals}</p>
                  </div>
                )}
                
                {selectedPerformance.achievements && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Başarılar</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPerformance.achievements}</p>
                  </div>
                )}
                
                {selectedPerformance.comments && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Yorumlar</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedPerformance.comments}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PerformanceTable;
