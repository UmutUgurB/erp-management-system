'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { productsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Filter,
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  supplier: string;
  profitMargin: number;
  stockStatus: string;
  isActive: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const { success, error, warning } = useNotification();

  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, stockFilter]);

  const fetchProducts = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (stockFilter) params.stockStatus = stockFilter;

      const response = await productsAPI.getProducts(params);
      setProducts(response.data.products || []);
    } catch (error) {
      error('Ürünler yüklenirken hata oluştu', {
        title: 'Yükleme Hatası'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, productName: string) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      await productsAPI.deleteProduct(id);
      success(`${productName} başarıyla silindi`, {
        title: 'Ürün Silindi',
        actions: [
          {
            label: 'Geri Al',
            action: () => warning('Geri alma özelliği yakında eklenecek'),
            style: 'secondary'
          }
        ]
      });
      fetchProducts();
    } catch (error: any) {
      error(error.response?.data?.message || 'Ürün silinirken hata oluştu', {
        title: 'Silme Hatası'
      });
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return 'text-red-600 bg-red-100';
      case 'low_stock':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return 'Tükendi';
      case 'low_stock':
        return 'Düşük Stok';
      default:
        return 'Yeterli';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Ürün Yönetimi</h1>
            <p className="mt-2 text-sm text-gray-700">
              Tüm ürünleri görüntüleyin, düzenleyin ve yönetin.
            </p>
          </div>
          {canEdit && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ürün
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ürün ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Tüm Kategoriler</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Gıda">Gıda</option>
            <option value="Giyim">Giyim</option>
            <option value="Ev & Bahçe">Ev & Bahçe</option>
          </select>

          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="">Tüm Stok Durumları</option>
            <option value="low">Düşük Stok</option>
            <option value="out">Tükenen</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Ürün
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        SKU / Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Fiyat / Maliyet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Stok
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Kar Marjı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Durum
                      </th>
                      {(canEdit || canDelete) && (
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.supplier}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.sku}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₺{product.price.toLocaleString('tr-TR')}
                          </div>
                          <div className="text-sm text-gray-500">
                            Maliyet: ₺{product.cost.toLocaleString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-900">
                              {product.stock} {product.unit}
                            </div>
                            {product.stock <= product.minStock && (
                              <AlertTriangle className="ml-2 h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Min: {product.minStock} {product.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            %{product.profitMargin}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(
                              product.stockStatus
                            )}`}
                          >
                            {getStockStatusText(product.stockStatus)}
                          </span>
                        </td>
                        {(canEdit || canDelete) && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              {canEdit && (
                                <button
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="Düzenle"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(product._id, product.name)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Sil"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Ürün bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Arama kriterlerinizi değiştirin veya yeni ürün ekleyin.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 