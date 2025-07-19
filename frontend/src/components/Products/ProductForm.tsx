'use client';

import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Product, 
  ProductFormSchema, 
  productFormSchema, 
  PRODUCT_CATEGORIES, 
  PRODUCT_UNITS 
} from '@/types/product';
import { Calculator, Package, DollarSign, Hash } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormSchema) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export interface ProductFormRef {
  submit: () => void;
}

export const ProductForm = forwardRef<ProductFormRef, ProductFormProps>(({
  product,
  onSubmit,
  isLoading = false,
  mode
}, ref) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, dirtyFields },
    reset
  } = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    mode: 'onChange',
    defaultValues: product ? {
      name: product.name,
      description: product.description,
      sku: product.sku,
      category: product.category as any,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit as any,
      supplier: product.supplier,
      isActive: product.isActive
    } : {
      name: '',
      description: '',
      sku: '',
      category: 'Elektronik' as any,
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 10,
      unit: 'adet' as any,
      supplier: '',
      isActive: true
    }
  });

  // Expose submit function to parent via ref
  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit(handleFormSubmit)();
    }
  }));

  // Watch price and cost for profit calculation
  const price = watch('price');
  const cost = watch('cost');
  const name = watch('name');

  // Calculate profit margin
  const profitMargin = cost > 0 ? ((price - cost) / cost * 100).toFixed(2) : '0';

  // Auto-generate SKU based on name and category
  const generateSKU = () => {
    const category = watch('category');
    if (name && category) {
      const namePrefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
      const categoryPrefix = category.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
      const sku = `${categoryPrefix}${namePrefix}-${randomSuffix}`;
      setValue('sku', sku, { shouldValidate: true });
    }
  };

  const handleFormSubmit = async (data: ProductFormSchema) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Product Name */}
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Ürün Adı *
          </label>
          <div className="mt-1 relative">
            <input
              {...register('name')}
              type="text"
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.name 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="Ürün adını giriniz"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Package className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* SKU */}
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
            SKU *
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              {...register('sku')}
              type="text"
              className={`flex-1 rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.sku ? 'border-red-300' : ''
              }`}
              placeholder="SKU-123"
            />
            <button
              type="button"
              onClick={generateSKU}
              className="relative -ml-px inline-flex items-center px-3 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 rounded-r-md"
            >
              <Hash className="h-4 w-4" />
            </button>
          </div>
          {errors.sku && (
            <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Kategori *
          </label>
          <select
            {...register('category')}
            className={`mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
              errors.category ? 'border-red-300' : ''
            }`}
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Açıklama *
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.description ? 'border-red-300' : ''
          }`}
          placeholder="Ürün açıklamasını giriniz..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Cost */}
        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
            Maliyet Fiyatı (₺) *
          </label>
          <div className="mt-1 relative">
            <input
              {...register('cost', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className={`block w-full rounded-md shadow-sm pr-10 sm:text-sm ${
                errors.cost 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          {errors.cost && (
            <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Satış Fiyatı (₺) *
          </label>
          <div className="mt-1 relative">
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className={`block w-full rounded-md shadow-sm pr-10 sm:text-sm ${
                errors.price 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        {/* Profit Margin */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Kar Marjı (%)
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              value={profitMargin}
              readOnly
              className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm pr-10 sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Calculator className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Otomatik hesaplanır
          </p>
        </div>
      </div>

      {/* Inventory */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Stock */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
            Mevcut Stok *
          </label>
          <input
            {...register('stock', { valueAsNumber: true })}
            type="number"
            min="0"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.stock ? 'border-red-300' : ''
            }`}
            placeholder="0"
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>

        {/* Min Stock */}
        <div>
          <label htmlFor="minStock" className="block text-sm font-medium text-gray-700">
            Minimum Stok *
          </label>
          <input
            {...register('minStock', { valueAsNumber: true })}
            type="number"
            min="0"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.minStock ? 'border-red-300' : ''
            }`}
            placeholder="10"
          />
          {errors.minStock && (
            <p className="mt-1 text-sm text-red-600">{errors.minStock.message}</p>
          )}
        </div>

        {/* Unit */}
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
            Birim *
          </label>
          <select
            {...register('unit')}
            className={`mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
              errors.unit ? 'border-red-300' : ''
            }`}
          >
            {PRODUCT_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          {errors.unit && (
            <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
          )}
        </div>
      </div>

      {/* Supplier */}
      <div>
        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
          Tedarikçi *
        </label>
        <input
          {...register('supplier')}
          type="text"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.supplier ? 'border-red-300' : ''
          }`}
          placeholder="Tedarikçi adı"
        />
        {errors.supplier && (
          <p className="mt-1 text-sm text-red-600">{errors.supplier.message}</p>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            {...register('isActive')}
            type="checkbox"
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="isActive" className="font-medium text-gray-700">
            Aktif Ürün
          </label>
          <p className="text-gray-500">
            Bu ürün satışa açık olacak mı?
          </p>
        </div>
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
                {price > 0 && cost > 0 && (
                  <p>Kar Marjı: %{profitMargin}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ProductForm.displayName = 'ProductForm'; 