'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  TrendingUp,
  FileText,
  Heart,
  UserCheck,
  Ban
} from 'lucide-react';
import { LeaveStats as LeaveStatsType } from '@/types/leave';

interface LeaveStatsProps {
  stats: LeaveStatsType | null;
}

const LeaveStats: React.FC<LeaveStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="text-right">
                <div className="w-12 h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-8 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full h-3 bg-gray-200 rounded mb-2"></div>
              <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam İzin',
      value: stats.totalLeaves,
      change: '+12%',
      changeType: 'increase' as const,
      icon: Calendar,
      color: 'blue',
      description: 'Bu yıl toplam izin talebi'
    },
    {
      title: 'Toplam Gün',
      value: stats.totalDays,
      change: '+8%',
      changeType: 'increase' as const,
      icon: Clock,
      color: 'green',
      description: 'Kullanılan toplam izin günü'
    },
    {
      title: 'Bekleyen',
      value: stats.pendingLeaves,
      change: '-5%',
      changeType: 'decrease' as const,
      icon: AlertTriangle,
      color: 'yellow',
      description: 'Onay bekleyen izin talepleri'
    },
    {
      title: 'Onaylanan',
      value: stats.approvedLeaves,
      change: '+15%',
      changeType: 'increase' as const,
      icon: CheckCircle,
      color: 'green',
      description: 'Onaylanan izin talepleri'
    }
  ];

  const detailCards = [
    {
      title: 'Yıllık İzin',
      value: stats.annualLeaves,
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Hastalık İzni',
      value: stats.sickLeaves,
      icon: Heart,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Mazeret İzni',
      value: stats.personalLeaves,
      icon: UserCheck,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Reddedilen',
      value: stats.rejectedLeaves,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'İptal Edilen',
      value: stats.cancelledLeaves,
      icon: Ban,
      color: 'gray',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      red: 'bg-red-500 text-white',
      purple: 'bg-purple-500 text-white',
      gray: 'bg-gray-500 text-white'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getChangeColor = (changeType: 'increase' | 'decrease') => {
    return changeType === 'increase' 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(card.color)}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChangeColor(card.changeType)}`}>
                  {card.change}
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {card.value.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {card.title}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {card.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          İzin Türü Dağılımı
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {detailCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                {card.value.toLocaleString()}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {card.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approval Rate */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Onay Oranı</h3>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.totalLeaves > 0 
                ? Math.round((stats.approvedLeaves / stats.totalLeaves) * 100)
                : 0}%
            </div>
            <p className="text-sm text-gray-600">
              {stats.approvedLeaves} / {stats.totalLeaves} onaylandı
            </p>
          </div>
        </motion.div>

        {/* Average Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ortalama Gün</h3>
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.totalLeaves > 0 
                ? (stats.totalDays / stats.totalLeaves).toFixed(1)
                : 0}
            </div>
            <p className="text-sm text-gray-600">
              İzin başına ortalama gün
            </p>
          </div>
        </motion.div>

        {/* Pending Rate */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bekleme Oranı</h3>
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {stats.totalLeaves > 0 
                ? Math.round((stats.pendingLeaves / stats.totalLeaves) * 100)
                : 0}%
            </div>
            <p className="text-sm text-gray-600">
              {stats.pendingLeaves} talep bekliyor
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaveStats; 