'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useNotification } from '@/context/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { NotificationPosition } from '@/types/notification';

export const NotificationContainer: React.FC = () => {
  const { notifications, clearAll } = useNotification();

  // Group notifications by position
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const position = notification.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(notification);
    return acc;
  }, {} as Record<NotificationPosition, typeof notifications>);

  const getPositionStyles = (position: NotificationPosition) => {
    const baseStyles = "fixed z-50 pointer-events-none";
    
    switch (position) {
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'top-center':
        return `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`;
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'bottom-center':
        return `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      default:
        return `${baseStyles} top-4 right-4`;
    }
  };

  // Don't render anything if no notifications
  if (notifications.length === 0) {
    return null;
  }

  return createPortal(
    <>
      {Object.entries(groupedNotifications).map(([position, positionNotifications]) => (
        <div
          key={position}
          className={getPositionStyles(position as NotificationPosition)}
        >
          <div className="w-full max-w-sm">
            {/* Clear all button for positions with multiple notifications */}
            {positionNotifications.length > 1 && (
              <div className="mb-2 flex justify-end pointer-events-auto">
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 bg-white rounded-md px-2 py-1 shadow-sm border border-gray-200 transition-colors"
                >
                  Tümünü Temizle
                </button>
              </div>
            )}
            
            {/* Notifications */}
            <div className="space-y-2 pointer-events-auto">
              {positionNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </>,
    document.body
  );
};

// Helper component for notification debugging (can be removed in production)
export const NotificationDebugPanel: React.FC = () => {
  const { notifications, success, error, warning, info, loading, clearAll } = useNotification();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs z-50">
      <h3 className="font-semibold text-sm mb-2">Notification Debug</h3>
      
      <div className="space-y-1 mb-3">
        <button
          onClick={() => success('İşlem başarılı!')}
          className="block w-full text-left text-xs p-1 bg-green-100 hover:bg-green-200 rounded"
        >
          Success
        </button>
        <button
          onClick={() => error('Bir hata oluştu!')}
          className="block w-full text-left text-xs p-1 bg-red-100 hover:bg-red-200 rounded"
        >
          Error
        </button>
        <button
          onClick={() => warning('Dikkat edilmesi gereken durum!')}
          className="block w-full text-left text-xs p-1 bg-yellow-100 hover:bg-yellow-200 rounded"
        >
          Warning
        </button>
        <button
          onClick={() => info('Bilgilendirme mesajı')}
          className="block w-full text-left text-xs p-1 bg-blue-100 hover:bg-blue-200 rounded"
        >
          Info
        </button>
        <button
          onClick={() => loading('Yükleniyor...')}
          className="block w-full text-left text-xs p-1 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Loading
        </button>
        <button
          onClick={() => success('Action Test', {
            title: 'İşlem Tamamlandı',
            actions: [
              {
                label: 'Geri Al',
                action: () => warning('Geri alındı!'),
                style: 'danger'
              },
              {
                label: 'Detay',
                action: () => info('Detay bilgileri...'),
                style: 'secondary'
              }
            ]
          })}
          className="block w-full text-left text-xs p-1 bg-purple-100 hover:bg-purple-200 rounded"
        >
          With Actions
        </button>
      </div>
      
      <div className="text-xs text-gray-600 mb-2">
        Active: {notifications.length}
      </div>
      
      <button
        onClick={clearAll}
        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded w-full"
      >
        Clear All
      </button>
    </div>
  );
}; 