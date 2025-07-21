import { useEffect, useCallback } from 'react';
import { useNotification } from '@/context/NotificationContext';
import socketClient from '@/lib/socket';

export const useRealtimeNotifications = () => {
  const notification = useNotification();

  const handleSystemNotification = useCallback((data: any) => {
    const { type, title, message } = data;
    
    switch (type) {
      case 'success':
        notification.success(message, { title });
        break;
      case 'error':
        notification.error(message, { title });
        break;
      case 'warning':
        notification.warning(message, { title });
        break;
      case 'info':
      default:
        notification.info(message, { title });
        break;
    }
  }, [notification]);

  const handleOrderUpdate = useCallback((data: any) => {
    const { orderId, status, order } = data;
    
    const statusMessages = {
      'confirmed': 'Sipariş onaylandı',
      'processing': 'Sipariş işleme alındı',
      'shipped': 'Sipariş kargoya verildi',
      'delivered': 'Sipariş teslim edildi',
      'cancelled': 'Sipariş iptal edildi'
    };

    notification.info(
      `Sipariş #${orderId} ${statusMessages[status] || 'güncellendi'}`,
      {
        title: 'Sipariş Güncellemesi',
        duration: 5000
      }
    );
  }, [notification]);

  const handleStockAlert = useCallback((data: any) => {
    const { productName, currentStock, minStock } = data;
    
    notification.warning(
      `${productName} ürününün stok seviyesi kritik seviyede (${currentStock}/${minStock})`,
      {
        title: 'Stok Uyarısı',
        duration: 8000
      }
    );
  }, [notification]);

  const handleNewOrder = useCallback((data: any) => {
    const { order } = data;
    
    notification.success(
      `Yeni sipariş alındı: #${order.orderNumber}`,
      {
        title: 'Yeni Sipariş',
        duration: 5000
      }
    );
  }, [notification]);

  const handleUserActivity = useCallback((data: any) => {
    const { userId, activity } = data;
    
    notification.info(
      `Kullanıcı aktivitesi: ${activity}`,
      {
        title: 'Kullanıcı Aktivitesi',
        duration: 3000
      }
    );
  }, [notification]);

  useEffect(() => {
    // Set up WebSocket event listeners
    socketClient.onSystemNotification(handleSystemNotification);
    socketClient.onOrderUpdate(handleOrderUpdate);
    socketClient.onStockAlert(handleStockAlert);
    socketClient.onNewOrder(handleNewOrder);
    socketClient.onUserActivity(handleUserActivity);

    // Cleanup function
    return () => {
      // Note: Socket.IO automatically removes listeners when disconnecting
      // but we can add manual cleanup if needed
    };
  }, [handleSystemNotification, handleOrderUpdate, handleStockAlert, handleNewOrder, handleUserActivity]);

  return {
    isConnected: socketClient.connected,
    socket: socketClient.socketInstance
  };
}; 