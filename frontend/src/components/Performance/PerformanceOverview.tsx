'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, Target } from 'lucide-react';
import { Performance as PerformanceType, PerformanceStats as PerformanceStatsType } from '@/types/performance';

interface PerformanceOverviewProps {
  performances: PerformanceType[];
  stats: PerformanceStatsType | null;
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ performances, stats }) => {
  // Calculate department performance
  const departmentPerformance = performances.reduce((acc, perf) => {
    const dept = perf.employee?.department || 'Bilinmeyen';
    if (!acc[dept]) {
      acc[dept] = { total: 0, count: 0, average: 0 };
    }
    acc[dept].total += perf.score || 0;
    acc[dept].count += 1;
    acc[dept].average = acc[dept].total / acc[dept].count;
    return acc;
  }, {} as Record<string, { total: number; count: number; average: number }>);

  // Calculate status distribution
  const statusDistribution = performances.reduce((acc, perf) => {
    const status = perf.status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate score ranges
  const scoreRanges = performances.reduce((acc, perf) => {
    const score = perf.score || 0;
    if (score >= 90) acc.excellent = (acc.excellent || 0) + 1;
    else if (score >= 80) acc.good = (acc.good || 0) + 1;
    else if (score >= 70) acc.average = (acc.average || 0) + 1;
    else if (score >= 60) acc.belowAverage = (acc.belowAverage || 0) + 1;
    else acc.poor = (acc.poor || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'approved': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Department Performance Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Departman Performansı
          </h3>
        </div>
        
        <div className="space-y-4">
          {Object.entries(departmentPerformance).map(([dept, data]) => (
            <div key={dept} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{dept}</span>
                <span className={`font-bold ${getScoreColor(data.average)}`}>
                  {data.average.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreColor(data.average).replace('text-', 'bg-')}`}
                  style={{ width: `${(data.average / 100) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {data.count} değerlendirme
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Durum Dağılımı
          </h3>
        </div>
        
        <div className="space-y-3">
          {Object.entries(statusDistribution).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {getStatusText(status)}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {count}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Score Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Puan Dağılımı
          </h3>
        </div>
        
        <div className="space-y-3">
          {[
            { key: 'excellent', label: 'Mükemmel (90+)', count: scoreRanges.excellent || 0, color: 'bg-green-500' },
            { key: 'good', label: 'İyi (80-89)', count: scoreRanges.good || 0, color: 'bg-blue-500' },
            { key: 'average', label: 'Orta (70-79)', count: scoreRanges.average || 0, color: 'bg-yellow-500' },
            { key: 'belowAverage', label: 'Orta Altı (60-69)', count: scoreRanges.belowAverage || 0, color: 'bg-orange-500' },
            { key: 'poor', label: 'Zayıf (<60)', count: scoreRanges.poor || 0, color: 'bg-red-500' }
          ].map((range) => (
            <div key={range.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${range.color}`}></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {range.label}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {range.count}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Performance Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Son Performans Trendleri
          </h3>
        </div>
        
        <div className="space-y-3">
          {performances.slice(0, 5).map((perf, index) => (
            <div key={perf._id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${getScoreColor(perf.score || 0).replace('text-', 'bg-')}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {perf.employee?.name || 'Bilinmeyen Çalışan'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {perf.evaluationType || 'Değerlendirme'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${getScoreColor(perf.score || 0)}`}>
                  {perf.score || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {perf.evaluationDate ? new Date(perf.evaluationDate).toLocaleDateString('tr-TR') : 'Tarih yok'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceOverview;
