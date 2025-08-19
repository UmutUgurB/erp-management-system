'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Users, Award, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { PerformanceStats as PerformanceStatsType } from '@/types/performance';

interface PerformanceStatsProps {
  stats: PerformanceStatsType | null;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Ortalama Puan',
      value: stats.averageScore?.toFixed(1) || '0.0',
      change: stats.scoreChange || 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      changeColor: stats.scoreChange >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Hedef Gerçekleşme',
      value: `${stats.goalAchievement || 0}%`,
      change: (stats.goalAchievement || 0) - 75, // Assuming 75% is baseline
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      changeColor: (stats.goalAchievement || 0) >= 75 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Değerlendirilen Çalışan',
      value: stats.evaluatedEmployees || 0,
      change: stats.employeeChange || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      changeColor: stats.employeeChange >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Tamamlanan Değerlendirme',
      value: stats.completedEvaluations || 0,
      change: stats.completionChange || 0,
      icon: CheckCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      changeColor: stats.completionChange >= 0 ? 'text-green-600' : 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${stat.bgColor} dark:bg-gray-700`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className={`text-sm font-medium ${stat.changeColor}`}>
              {stat.change >= 0 ? '+' : ''}{stat.change}%
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stat.value}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PerformanceStats;
