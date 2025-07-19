'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Order, 
  OrderItem, 
  OrderFormSchema, 
  orderFormSchema, 
  PAYMENT_METHOD_OPTIONS,
  calculateOrderTotals,
  generateOrderNumber
} from '@/types/order';
import { Product } from '@/types/product';
import { OrderItemRow } from './OrderItemRow';
import { ProductSelector } from './ProductSelector';
import { productsAPI } from '@/lib/api';
import { 
  ShoppingCart, 
  User, 
  Calculator, 
  FileText,
  Plus,
  Trash2
} from 'lucide-react';

interface OrderFormProps {
  order?: Order;
  onSubmit: (data: OrderFormSchema) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export interface OrderFormRef {
  submit: () => void;
}

export const OrderForm = forwardRef<OrderFormRef, OrderFormProps>(({
  order,
  onSubmit,
  isLoading = false,
  mode
}, ref) => {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, dirtyFields },
    reset
  } = useForm<OrderFormSchema>({
    resolver: zodResolver(orderFormSchema),
    mode: 'onChange',
    defaultValues: order ? {
      customerId: order.customerId,
      customerName: order.customerName,
      items: order.items,
      taxRate: order.taxRate,
      discountRate: order.discountRate,
      paymentMethod: order.paymentMethod,
      notes: order.notes || ''
    } : {
      customerId: '',
      customerName: '',
      items: [],
      taxRate: 18, // Default KDV
      discountRate: 0,
      paymentMethod: 'cash',
      notes: ''
    }
  });

  // Watch form values for calculations
  const taxRate = watch('taxRate');
  const discountRate = watch('discountRate');

  // Expose submit function to parent via ref
  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit(handleFormSubmit)();
    }
  }));

  useEffect(() => {
    fetchProducts();
    if (order) {
      setItems(order.items);
      setCustomerName(order.customerName);
      setCustomerId(order.customerId);
    }
  }, [order]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getProducts({ isActive: true });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleFormSubmit = async (data: OrderFormSchema) => {
    try {
      // Update items in form data
      const formData = {
        ...data,
        items: items
      };
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleAddProduct = (newItem: OrderItem) => {
    setItems(prev => [...prev, newItem]);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setItems(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
        : item
    ));
  };

  const handleUpdatePrice = (productId: string, price: number) => {
    setItems(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, unitPrice: price, totalPrice: price * item.quantity }
        : item
    ));
  };

  const handleRemoveItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCustomerName(name);
    setValue('customerName', name);
    // Generate a temporary customer ID for new customers
    if (!customerId) {
      const tempId = `temp_${Date.now()}`;
      setCustomerId(tempId);
      setValue('customerId', tempId);
    }
  };

  // Calculate totals
  const totals = calculateOrderTotals(items, taxRate, discountRate);

  // Get product by ID for display
  const getProduct = (productId: string) => {
    return products.find(p => p._id === productId);
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-6 w-6 text-indigo-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {mode === 'create' ? 'Yeni Sipariş' : 'Sipariş Düzenle'}
              </h3>
              <p className="text-sm text-gray-500">
                {mode === 'create' ? generateOrderNumber() : order?.orderNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ₺{totals.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-500">Toplam Tutar</div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <User className="h-5 w-5 text-gray-500" />
          <h4 className="text-lg font-medium text-gray-900">Müşteri Bilgileri</h4>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
              Müşteri Adı *
            </label>
            <input
              {...register('customerName')}
              type="text"
              value={customerName}
              onChange={handleCustomerChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.customerName 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="Müşteri adını giriniz"
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
              Ödeme Yöntemi *
            </label>
            <select
              {...register('paymentMethod')}
              className={`mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                errors.paymentMethod ? 'border-red-300' : ''
              }`}
            >
              {PAYMENT_METHOD_OPTIONS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-5 w-5 text-gray-500" />
            <h4 className="text-lg font-medium text-gray-900">Ürünler</h4>
          </div>
          <div className="text-sm text-gray-500">
            {items.length} ürün
          </div>
        </div>

        {/* Product Selector */}
        <div className="mb-6">
          <ProductSelector
            onAddProduct={handleAddProduct}
            existingProductIds={items.map(item => item.productId)}
          />
        </div>

        {/* Order Items */}
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item, index) => (
              <OrderItemRow
                key={item.productId}
                item={item}
                product={getProduct(item.productId)}
                onUpdateQuantity={handleUpdateQuantity}
                onUpdatePrice={handleUpdatePrice}
                onRemove={handleRemoveItem}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm">Henüz ürün eklenmedi</p>
            <p className="text-xs">Yukarıdaki arama kutusunu kullanarak ürün ekleyin</p>
          </div>
        )}
      </div>

      {/* Pricing & Totals */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Calculator className="h-5 w-5 text-gray-500" />
          <h4 className="text-lg font-medium text-gray-900">Fiyatlandırma</h4>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Tax & Discount Rates */}
          <div className="space-y-4">
            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                Vergi Oranı (%)
              </label>
              <input
                {...register('taxRate', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                max="100"
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.taxRate 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                placeholder="18"
              />
              {errors.taxRate && (
                <p className="mt-1 text-sm text-red-600">{errors.taxRate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="discountRate" className="block text-sm font-medium text-gray-700">
                İndirim Oranı (%)
              </label>
              <input
                {...register('discountRate', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                max="100"
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.discountRate 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                placeholder="0"
              />
              {errors.discountRate && (
                <p className="mt-1 text-sm text-red-600">{errors.discountRate.message}</p>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ara Toplam:</span>
                <span className="font-medium">₺{totals.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vergi (%{taxRate}):</span>
                <span className="font-medium">₺{totals.taxAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">İndirim (%{discountRate}):</span>
                <span className="font-medium text-red-600">-₺{totals.discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam:</span>
                  <span>₺{totals.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="h-5 w-5 text-gray-500" />
          <h4 className="text-lg font-medium text-gray-900">Notlar</h4>
        </div>
        
        <textarea
          {...register('notes')}
          rows={3}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.notes ? 'border-red-300' : ''
          }`}
          placeholder="Sipariş hakkında notlar..."
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Form Status */}
      {Object.keys(dirtyFields).length > 0 && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Form Durumu
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  {isValid ? '✅ Form geçerli' : '❌ Form hatalar içeriyor'}
                </p>
                <p>Ürün Sayısı: {items.length}</p>
                <p>Toplam Tutar: ₺{totals.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

OrderForm.displayName = 'OrderForm'; 