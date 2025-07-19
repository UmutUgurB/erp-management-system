'use client';

import React, { useState, useRef } from 'react';
import { Modal, ModalFooter } from '@/components/UI/Modal';
import { ProductForm, ProductFormRef } from './ProductForm';
import { Product, ProductFormSchema } from '@/types/product';
import { productsAPI } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product;
  mode: 'create' | 'edit';
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
  mode
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<ProductFormRef>(null);
  const { success, error } = useNotification();

  const handleSubmit = async (data: ProductFormSchema) => {
    setIsLoading(true);
    
    try {
      if (mode === 'create') {
        await productsAPI.createProduct(data);
        success('Ürün başarıyla oluşturuldu', {
          title: 'Ürün Eklendi',
          actions: [
            {
              label: 'Yeni Ürün Ekle',
              action: () => {
                onSuccess();
                // Keep modal open for adding another product
              },
              style: 'primary'
            }
          ]
        });
      } else if (product) {
        await productsAPI.updateProduct(product._id, data);
        success('Ürün başarıyla güncellendi', {
          title: 'Ürün Düzenlendi',
          duration: 3000
        });
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Product operation error:', err);
      
      if (err.response?.status === 400 && err.response?.data?.message?.includes('SKU')) {
        error('Bu SKU zaten kullanımda. Lütfen farklı bir SKU giriniz.', {
          title: 'SKU Hatası',
          duration: 6000
        });
      } else {
        error(
          err.response?.data?.message || 
          `Ürün ${mode === 'create' ? 'oluşturulurken' : 'güncellenirken'} bir hata oluştu`,
          {
            title: `${mode === 'create' ? 'Oluşturma' : 'Güncelleme'} Hatası`,
            duration: 5000
          }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = () => {
    formRef.current?.submit();
  };

  const modalTitle = mode === 'create' ? 'Yeni Ürün Ekle' : 'Ürün Düzenle';
  const submitButtonText = mode === 'create' ? 'Ürün Ekle' : 'Güncelle';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="lg"
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
      <div className="max-h-[70vh] overflow-y-auto">
        <ProductForm
          ref={formRef}
          product={product}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          mode={mode}
        />
      </div>
    </Modal>
  );
};

// Hook for managing product modal state
export const useProductModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const openCreateModal = () => {
    setMode('create');
    setSelectedProduct(undefined);
    setIsOpen(true);
  };

  const openEditModal = (product: Product) => {
    setMode('edit');
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedProduct(undefined);
  };

  return {
    isOpen,
    mode,
    selectedProduct,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}; 