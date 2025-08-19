'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, UserCheck, AlertTriangle } from 'lucide-react';

interface LeaveOverviewProps {
  stats: {
    totalLeaves: number;
    totalDays: number;
    pendingLeaves: number;
    approvedLeaves: number;
    rejectedLeaves: number;
    cancelledLeaves: number;
    annualLeaves: number;
    sickLeaves: number;
    personalLeaves: number;
  } | null;
}

const LeaveOverview: React.FC<LeaveOverviewProps> = ({ stats }) => {
  if (!stats) return null;

  const overviewCards = [
    {
      title: 'Toplam İzin',
      value: stats.totalLeaves,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      title: 'Toplam Gün',
      value: stats.totalDays,
      icon: Clock,
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    {
      title: 'Bekleyen',
      value: stats.pendingLeaves,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500'
    },
    {
      title: 'Onaylanan',
      value: stats.approvedLeaves,
      icon: UserCheck,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {overviewCards.map((card, index) => (
        <motion.div
          key={card.title}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {card.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${card.color} bg-opacity-10`}>
              <card.icon className={`h-6 w-6 ${card.textColor}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LeaveOverview;
