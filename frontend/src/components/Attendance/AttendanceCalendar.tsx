'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Attendance } from '@/types/attendance';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, Coffee, Clock } from 'lucide-react';
import AnimatedLoading from '@/components/UI/AnimatedLoading';

interface AttendanceCalendarProps {
  attendance: Attendance[];
  currentDate: Date;
  loading: boolean;
}

const statusColors = {
  present: 'bg-green-500',
  absent: 'bg-red-500',
  late: 'bg-yellow-500',
  work_from_home: 'bg-purple-500',
  on_leave: 'bg-blue-500',
  half_day: 'bg-orange-500',
  early_leave: 'bg-pink-500'
};

const statusIcons = {
  present: CheckCircle,
  absent: XCircle,
  late: AlertTriangle,
  work_from_home: Coffee,
  on_leave: Clock,
  half_day: Clock,
  early_leave: Clock
};

export default function AttendanceCalendar({ attendance, currentDate, loading }: AttendanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getAttendanceForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return attendance.filter(att => att.date === dateString);
  };

  const getStatusCounts = (date: Date) => {
    const dayAttendance = getAttendanceForDate(date);
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      work_from_home: 0,
      on_leave: 0,
      half_day: 0,
      early_leave: 0
    };
    
    dayAttendance.forEach(att => {
      counts[att.status as keyof typeof counts]++;
    });
    
    return counts;
  };

  const getDayStatus = (date: Date) => {
    const counts = getStatusCounts(date);
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return null;
    
    // En çok olan durumu döndür
    const maxStatus = Object.entries(counts).reduce((max, [status, count]) => 
      count > max.count ? { status, count } : max, 
      { status: 'present', count: 0 }
    );
    
    return maxStatus.status;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getDayTooltip = (date: Date) => {
    const counts = getStatusCounts(date);
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return 'Devam kaydı yok';
    
    const tooltip = [
      `Tarih: ${formatDate(date)}`,
      `Toplam: ${total} çalışan`,
      counts.present > 0 && `Gelen: ${counts.present}`,
      counts.absent > 0 && `Gelmeyen: ${counts.absent}`,
      counts.late > 0 && `Geç Gelen: ${counts.late}`,
      counts.work_from_home > 0 && `Evden Çalışan: ${counts.work_from_home}`,
      counts.on_leave > 0 && `İzinde: ${counts.on_leave}`,
      counts.half_day > 0 && `Yarım Gün: ${counts.half_day}`,
      counts.early_leave > 0 && `Erken Ayrılan: ${counts.early_leave}`
    ].filter(Boolean).join('\n');
    
    return tooltip;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <AnimatedLoading size="md" text="Takvim yükleniyor..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Aylık Takvim Görünümü
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Günlük devam durumlarını takvim üzerinde görüntüleyin
          </p>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week Days Header */}
          {weekDays.map((day, index) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-t"
            >
              {day}
            </motion.div>
          ))}

          {/* Calendar Days */}
          {days.map((day, index) => {
            const status = getDayStatus(day);
            const counts = getStatusCounts(day);
            const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);
            
            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: (index + 7) * 0.02 }}
                whileHover={{ scale: 1.05 }}
                className={`
                  relative p-2 min-h-[80px] border border-gray-200 dark:border-gray-600 
                  ${isCurrentMonthDay ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                  ${isTodayDay ? 'ring-2 ring-indigo-500' : ''}
                  ${!isCurrentMonthDay ? 'opacity-50' : ''}
                  cursor-pointer transition-all duration-200
                `}
                onClick={() => setSelectedDate(day)}
                title={getDayTooltip(day)}
              >
                {/* Date Number */}
                <div className={`
                  text-sm font-medium mb-1
                  ${isCurrentMonthDay ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}
                  ${isTodayDay ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}
                `}>
                  {day.getDate()}
                </div>

                {/* Status Indicators */}
                {status && (
                  <div className="space-y-1">
                    {/* Main Status */}
                    <div className="flex items-center justify-center">
                      {(() => {
                        const Icon = statusIcons[status as keyof typeof statusIcons];
                        return (
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center
                            ${statusColors[status as keyof typeof statusColors]}
                          `}>
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                        );
                      })()}
                    </div>

                    {/* Count Badge */}
                    {total > 0 && (
                      <div className="text-xs text-center text-gray-600 dark:text-gray-400">
                        {total} kişi
                      </div>
                    )}

                    {/* Multiple Status Indicators */}
                    {total > 1 && (
                      <div className="flex justify-center space-x-1">
                        {Object.entries(counts).map(([statusKey, count]) => {
                          if (count === 0) return null;
                          return (
                            <div
                              key={statusKey}
                              className={`
                                w-2 h-2 rounded-full ${statusColors[statusKey as keyof typeof statusColors]}
                                ${count > 0 ? 'opacity-100' : 'opacity-0'}
                              `}
                              title={`${statusKey}: ${count}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {!status && isCurrentMonthDay && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                    Kayıt yok
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Durum Açıklamaları
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(statusColors).map(([status, color]) => {
              const Icon = statusIcons[status as keyof typeof statusIcons];
              const labels = {
                present: 'Gelen',
                absent: 'Gelmeyen',
                late: 'Geç Gelen',
                work_from_home: 'Evden Çalışan',
                on_leave: 'İzinde',
                half_day: 'Yarım Gün',
                early_leave: 'Erken Ayrılan'
              };
              
              return (
                <div key={status} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${color} flex items-center justify-center`}>
                    <Icon className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {labels[status as keyof typeof labels]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDate(selectedDate)} - Detaylar
              </h4>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2">
              {getAttendanceForDate(selectedDate).map((att) => (
                <div key={att._id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {att.employee.firstName} {att.employee.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {att.employee.department} • {att.employee.position}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[att.status as keyof typeof statusColors]} text-white`}>
                      {(() => {
                        const Icon = statusIcons[att.status as keyof typeof statusIcons];
                        return (
                          <>
                            <Icon className="w-3 h-3 mr-1" />
                            {att.status === 'present' ? 'Gelen' :
                             att.status === 'absent' ? 'Gelmeyen' :
                             att.status === 'late' ? 'Geç Gelen' :
                             att.status === 'work_from_home' ? 'Evden Çalışan' :
                             att.status === 'on_leave' ? 'İzinde' :
                             att.status === 'half_day' ? 'Yarım Gün' :
                             att.status === 'early_leave' ? 'Erken Ayrılan' : att.status}
                          </>
                        );
                      })()}
                    </span>
                    {att.checkInTime && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Giriş: {new Date(att.checkInTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {getAttendanceForDate(selectedDate).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Bu tarih için devam kaydı bulunamadı
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 