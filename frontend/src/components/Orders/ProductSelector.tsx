'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { OrderItem } from '@/types/order';
import { productsAPI } from '@/lib/api';
import { Search, Package, Plus, X } from 'lucide-react';

interface ProductSelectorProps {
  onAddProduct: (item: OrderItem) => void;
  existingProductIds: string[];
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  onAddProduct,
  existingProductIds
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter(product => 
        !existingProductIds.includes(product._id) &&
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
         product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered.slice(0, 10)); // Limit to 10 results
      setShowDropdown(true);
    } else {
      setFilteredProducts([]);
      setShowDropdown(false);
    }
  }, [searchTerm, products, existingProductIds]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getProducts({ isActive: true });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setShowDropdown(false);
  };

  const handleAddProduct = () => {
    if (!selectedProduct) return;

    const orderItem: OrderItem = {
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      quantity: quantity,
      unitPrice: selectedProduct.price,
      totalPrice: selectedProduct.price * quantity,
      availableStock: selectedProduct.stock
    };

    onAddProduct(orderItem);
    
    // Reset form
    setSelectedProduct(null);
    setSearchTerm('');
    setQuantity(1);
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    setSearchTerm('');
    setQuantity(1);
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 bg-red-100';
    if (stock < 10) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return 'Tükendi';
    if (stock < 10) return 'Düşük Stok';
    return 'Yeterli';
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Ürün ara (ad, SKU, kategori)..."
          disabled={loading}
        />
        {selectedProduct && (
          <button
            type="button"
            onClick={handleClearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Product Dropdown */}
      {showDropdown && filteredProducts.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {filteredProducts.map((product) => (
            <button
              key={product._id}
              onClick={() => handleProductSelect(product)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      SKU: {product.sku} • {product.category}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ₺{product.price.toLocaleString('tr-TR')}
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(product.stock)}`}>
                    {product.stock} {product.unit}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected Product Details */}
      {selectedProduct && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {selectedProduct.name}
                </h4>
                <p className="text-sm text-gray-500">
                  SKU: {selectedProduct.sku} • {selectedProduct.category}
                </p>
                <p className="text-xs text-gray-400">
                  Stok: {selectedProduct.stock} {selectedProduct.unit} • 
                  <span className={`ml-1 ${getStockStatusColor(selectedProduct.stock)} px-2 py-0.5 rounded-full text-xs`}>
                    {getStockStatusText(selectedProduct.stock)}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-gray-900">
                ₺{selectedProduct.price.toLocaleString('tr-TR')}
              </div>
              <div className="text-sm text-gray-500">
                Birim Fiyat
              </div>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Miktar
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={selectedProduct.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {quantity > selectedProduct.stock && (
                <p className="mt-1 text-xs text-red-600">
                  Stok yetersiz! Mevcut: {selectedProduct.stock}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-gray-900">
                ₺{(selectedProduct.price * quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">
                Toplam
              </div>
            </div>
          </div>

          {/* Add Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleAddProduct}
              disabled={quantity > selectedProduct.stock || quantity < 1}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Siparişe Ekle
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {showDropdown && searchTerm && filteredProducts.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm">Ürün bulunamadı</p>
          <p className="text-xs">Farklı anahtar kelimeler deneyin</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Ürünler yükleniyor...</p>
        </div>
      )}
    </div>
  );
}; 