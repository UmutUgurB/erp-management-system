'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Notification, { NotificationProps } from './Notification';

export interface NotificationItem extends Omit<NotificationProps, 'onClose'> {
  id: string;
}

interface NotificationManagerProps {
  notifications: NotificationItem[];
  onRemove: (id: string) => void;
}

export default function NotificationManager({ notifications, onRemove }: NotificationManagerProps) {
  const handleClose = useCallback((id: string) => {
    onRemove(id);
  }, [onRemove]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification, index) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: 300, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 300, y: -20 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.1,
            type: "spring", 
            stiffness: 200 
          }}
        >
          <Notification
            {...notification}
            onClose={handleClose}
          />
        </motion.div>
      ))}
    </div>
  );
} 