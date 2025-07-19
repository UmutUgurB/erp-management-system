'use client';

import React from 'react';
import { OrderItem } from '@/types/order';
import { Product } from '@/types/product';
import { Trash2, Package } from 'lucide-react';

interface OrderItemRowProps {
  item: OrderItem;
  product?: Product;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdatePrice: (productId: string, price: number) => void;
  onRemove: (productId: string) => void;
  index: number;
}

export const OrderItemRow: React.FC<OrderItemRowProps> = ({
  item,
  product,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove,
  index
}) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value) || 0;
    onUpdateQuantity(item.productId, quantity);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = parseFloat(e.target.value) || 0;
    onUpdatePrice(item.productId, price);
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return 'Tükendi';
    if (stock < 10) return 'Düşük Stok';
    return 'Yeterli';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white hover:shadow-sm transition-shadow">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Product Info */}
        <div className="col-span-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-gray-500" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.productName}
              </p>
              <p className="text-sm text-gray-500">
                SKU: {item.sku}
              </p>
              {product && (
                <p className="text-xs text-gray-400">
                  Stok: <span className={getStockStatusColor(item.availableStock)}>
                    {item.availableStock} {product.unit}
                  </span>
                  <span className="ml-2 text-xs">
                    ({getStockStatusText(item.availableStock)})
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quantity */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Miktar
          </label>
          <input
            type="number"
            min="1"
            max={item.availableStock}
            value={item.quantity}
            onChange={handleQuantityChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="1"
          />
          {item.quantity > item.availableStock && (
            <p className="mt-1 text-xs text-red-600">
              Stok yetersiz! Mevcut: {item.availableStock}
            </p>
          )}
        </div>

        {/* Unit Price */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Birim Fiyat (₺)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={item.unitPrice}
            onChange={handlePriceChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="0.00"
          />
        </div>

        {/* Total Price */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Toplam (₺)
          </label>
          <div className="text-sm font-medium text-gray-900">
            ₺{item.totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-2 flex justify-end">
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="text-red-600 hover:text-red-900 transition-colors p-1"
            title="Ürünü kaldır"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stock Warning */}
      {item.quantity > item.availableStock && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-sm text-red-700">
                <strong>Stok Uyarısı:</strong> İstenen miktar ({item.quantity}) mevcut stoktan ({item.availableStock}) fazla.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 