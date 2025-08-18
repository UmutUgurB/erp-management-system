'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { productsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { ProductModal, useProductModal } from '@/components/Products/ProductModal';
import { Product } from '@/types/product';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Filter,
  CheckSquare,
  DollarSign,
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const { user } = useAuth();
  const notification = useNotification();
  
  // Destructure with safety check
  const { success, error, warning } = notification || {};
  
  // Product modal management
  const {
    isOpen: isModalOpen,
    mode: modalMode,
    selectedProduct,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useProductModal();

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
      // Safety check for error function
      if (typeof error === 'function') {
        error('Ürünler yüklenirken hata oluştu', {
          title: 'Yükleme Hatası'
        });
      } else {
        console.error('Ürünler yüklenirken hata:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, productName: string) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      await productsAPI.deleteProduct(id);
      // Safety check for success function
      if (typeof success === 'function') {
        success(`${productName} başarıyla silindi`, {
          title: 'Ürün Silindi',
          actions: [
            {
              label: 'Geri Al',
              action: () => {
                if (typeof warning === 'function') {
                  warning('Geri alma özelliği yakında eklenecek');
                }
              },
              style: 'secondary'
            }
          ]
        });
      }
      fetchProducts();
    } catch (error: any) {
      // Safety check for error function
      if (typeof error === 'function') {
        error(error.response?.data?.message || 'Ürün silinirken hata oluştu', {
          title: 'Silme Hatası'
        });
      } else {
        console.error('Ürün silinirken hata:', error);
      }
    }
  };

  const handleModalSuccess = () => {
    fetchProducts();
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
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
            <p className="mt-2 text-sm text-gray-700">
              Tüm ürünleri görüntüleyin, düzenleyin ve yönetin.
            </p>
          </div>
          {canEdit && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Yeni Ürün
              </button>
            </div>
          )}
        </div>

        {/* Product Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Products */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Toplam Ürün</p>
                <p className="text-3xl font-bold">{products.length}</p>
              </div>
              <div className="p-3 bg-blue-400 rounded-full">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-blue-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+8%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>

          {/* Active Products */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Aktif Ürünler</p>
                <p className="text-3xl font-bold">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-400 rounded-full">
                <CheckSquare className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-green-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+12%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Düşük Stok</p>
                <p className="text-3xl font-bold">
                  {products.filter(p => p.stockStatus === 'low_stock').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-400 rounded-full">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-yellow-100 text-sm">
                <span className="text-red-300">↘</span>
                <span className="ml-1">-3%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Toplam Değer</p>
                <p className="text-3xl font-bold">
                  ₺{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="p-3 bg-purple-400 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-purple-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+15%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Dağılımı</h3>
            <div className="space-y-3">
              {Array.from(new Set(products.map(p => p.category))).map((category) => {
                const count = products.filter(p => p.category === category).length;
                const percentage = products.length > 0 ? (count / products.length) * 100 : 0;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-400 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">{category || 'Kategorisiz'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                      <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stok Durumu</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Yeterli Stok</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {products.filter(p => p.stockStatus === 'in_stock').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Düşük Stok</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {products.filter(p => p.stockStatus === 'low_stock').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Stok Tükendi</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {products.filter(p => p.stockStatus === 'out_of_stock').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                            %{product.profitMargin || ((product.price - product.cost) / product.cost * 100).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(
                              product.stockStatus || (product.stock <= product.minStock ? 'low_stock' : 'in_stock')
                            )}`}
                          >
                            {getStockStatusText(product.stockStatus || (product.stock <= product.minStock ? 'low_stock' : 'in_stock'))}
                          </span>
                        </td>
                        {(canEdit || canDelete) && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              {canEdit && (
                                <button
                                  onClick={() => openEditModal(product)}
                                  className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                  title="Düzenle"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(product._id, product.name)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
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
                    {canEdit && (
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={openCreateModal}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Ürünü Ekle
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
        product={selectedProduct}
        mode={modalMode}
      />
    </DashboardLayout>
  );
} 