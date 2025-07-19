'use client';

import React, { useState, useRef } from 'react';
import { Modal, ModalFooter } from '@/components/UI/Modal';
import { OrderForm, OrderFormRef } from './OrderForm';
import { Order, OrderFormSchema } from '@/types/order';
import { ordersAPI } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  order?: Order;
  mode: 'create' | 'edit';
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  order,
  mode
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<OrderFormRef>(null);
  const { success, error } = useNotification();

  const handleSubmit = async (data: OrderFormSchema) => {
    setIsLoading(true);
    
    try {
      if (mode === 'create') {
        await ordersAPI.createOrder(data);
        success('Sipariş başarıyla oluşturuldu', {
          title: 'Sipariş Oluşturuldu',
          actions: [
            {
              label: 'Yeni Sipariş',
              action: () => {
                onSuccess();
                // Keep modal open for adding another order
              },
              style: 'primary'
            }
          ]
        });
      } else if (order) {
        await ordersAPI.updateOrder(order._id, data);
        success('Sipariş başarıyla güncellendi', {
          title: 'Sipariş Düzenlendi',
          duration: 3000
        });
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Order operation error:', err);
      
      error(
        err.response?.data?.message || 
        `Sipariş ${mode === 'create' ? 'oluşturulurken' : 'güncellenirken'} bir hata oluştu`,
        {
          title: `${mode === 'create' ? 'Oluşturma' : 'Güncelleme'} Hatası`,
          duration: 5000
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = () => {
    formRef.current?.submit();
  };

  const modalTitle = mode === 'create' ? 'Yeni Sipariş Oluştur' : 'Sipariş Düzenle';
  const submitButtonText = mode === 'create' ? 'Sipariş Oluştur' : 'Güncelle';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="xl"
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleFormSubmit}
          cancelText="İptal"
          confirmText={submitButtonText}
          confirmLoading={isLoading}
          confirmVariant="primary"
        />
      }
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <OrderForm
          ref={formRef}
          order={order}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          mode={mode}
        />
      </div>
    </Modal>
  );
};

// Hook for managing order modal state
export const useOrderModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(undefined);

  const openCreateModal = () => {
    setMode('create');
    setSelectedOrder(undefined);
    setIsOpen(true);
  };

  const openEditModal = (order: Order) => {
    setMode('edit');
    setSelectedOrder(order);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedOrder(undefined);
  };

  return {
    isOpen,
    mode,
    selectedOrder,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}; 