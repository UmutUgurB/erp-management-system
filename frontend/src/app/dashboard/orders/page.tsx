'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { ordersAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { OrderModal, useOrderModal } from '@/components/Orders/OrderModal';
import { Order, ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '@/types/order';
import {
  ShoppingCart,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Calendar,
  User,
  DollarSign,
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const { user } = useAuth();
  const notification = useNotification();
  
  // Destructure with safety check
  const { success, error, warning } = notification || {};
  
  // Order modal management
  const {
    isOpen: isModalOpen,
    mode: modalMode,
    selectedOrder,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useOrderModal();

  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;

      const response = await ordersAPI.getOrders(params);
      setOrders(response.data.orders || []);
    } catch (error) {
      // Safety check for error function
      if (typeof error === 'function') {
        error('Siparişler yüklenirken hata oluştu', {
          title: 'Yükleme Hatası'
        });
      } else {
        console.error('Siparişler yüklenirken hata:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, orderNumber: string) => {
    if (!window.confirm('Bu siparişi silmek istediğinizden emin misiniz?')) return;

    try {
      await ordersAPI.deleteOrder(id);
      // Safety check for success function
      if (typeof success === 'function') {
        success(`${orderNumber} başarıyla silindi`, {
          title: 'Sipariş Silindi',
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
      fetchOrders();
    } catch (error: any) {
      // Safety check for error function
      if (typeof error === 'function') {
        error(error.response?.data?.message || 'Sipariş silinirken hata oluştu', {
          title: 'Silme Hatası'
        });
      } else {
        console.error('Sipariş silinirken hata:', error);
      }
    }
  };

  const handleModalSuccess = () => {
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    const statusOption = ORDER_STATUS_OPTIONS.find(s => s.value === status);
    if (!statusOption) return 'text-gray-600 bg-gray-100';
    
    switch (statusOption.color) {
      case 'yellow': return 'text-yellow-800 bg-yellow-100';
      case 'blue': return 'text-blue-800 bg-blue-100';
      case 'purple': return 'text-purple-800 bg-purple-100';
      case 'indigo': return 'text-indigo-800 bg-indigo-100';
      case 'green': return 'text-green-800 bg-green-100';
      case 'red': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    const statusOption = ORDER_STATUS_OPTIONS.find(s => s.value === status);
    return statusOption?.label || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const statusOption = PAYMENT_STATUS_OPTIONS.find(s => s.value === status);
    if (!statusOption) return 'text-gray-600 bg-gray-100';
    
    switch (statusOption.color) {
      case 'yellow': return 'text-yellow-800 bg-yellow-100';
      case 'green': return 'text-green-800 bg-green-100';
      case 'orange': return 'text-orange-800 bg-orange-100';
      case 'red': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getPaymentStatusText = (status: string) => {
    const statusOption = PAYMENT_STATUS_OPTIONS.find(s => s.value === status);
    return statusOption?.label || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <h1 className="text-3xl font-bold text-gray-900">Sipariş Yönetimi</h1>
            <p className="mt-2 text-sm text-gray-700">
              Tüm siparişleri görüntüleyin, düzenleyin ve yönetin.
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
                Yeni Sipariş
              </button>
            </div>
          )}
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Toplam Sipariş</p>
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
              <div className="p-3 bg-blue-400 rounded-full">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-blue-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+12%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Bekleyen Siparişler</p>
                <p className="text-3xl font-bold">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-400 rounded-full">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-yellow-100 text-sm">
                <span className="text-red-300">↘</span>
                <span className="ml-1">-5%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Toplam Gelir</p>
                <p className="text-3xl font-bold">
                  ₺{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="p-3 bg-green-400 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-green-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+18%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Ortalama Sipariş</p>
                <p className="text-3xl font-bold">
                  ₺{orders.length > 0 ? (orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length).toLocaleString('tr-TR', { minimumFractionDigits: 0 }) : '0'}
                </p>
              </div>
              <div className="p-3 bg-purple-400 rounded-full">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-purple-100 text-sm">
                <span className="text-green-300">↗</span>
                <span className="ml-1">+8%</span>
                <span className="ml-2">geçen aya göre</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Durumu Dağılımı</h3>
            <div className="space-y-3">
              {ORDER_STATUS_OPTIONS.map((status) => {
                const count = orders.filter(o => o.status === status.value).length;
                const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                return (
                  <div key={status.value} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${status.color === 'yellow' ? 'bg-yellow-400' : status.color === 'blue' ? 'bg-blue-400' : status.color === 'purple' ? 'bg-purple-400' : status.color === 'indigo' ? 'bg-indigo-400' : status.color === 'green' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className="text-sm text-gray-600">{status.label}</span>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Sipariş Trendi</h3>
            <div className="h-48 flex items-end justify-between space-x-2">
              {Array.from({ length: 6 }, (_, i) => {
                const month = new Date();
                month.setMonth(month.getMonth() - (5 - i));
                const monthOrders = orders.filter(o => {
                  const orderDate = new Date(o.createdAt);
                  return orderDate.getMonth() === month.getMonth() && orderDate.getFullYear() === month.getFullYear();
                }).length;
                const maxOrders = Math.max(...Array.from({ length: 6 }, (_, j) => {
                  const m = new Date();
                  m.setMonth(m.getMonth() - (5 - j));
                  return orders.filter(o => {
                    const orderDate = new Date(o.createdAt);
                    return orderDate.getMonth() === m.getMonth() && orderDate.getFullYear() === m.getFullYear();
                  }).length;
                }));
                const height = maxOrders > 0 ? (monthOrders / maxOrders) * 100 : 0;
                return (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all duration-300 hover:scale-110"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-500">
                      {month.toLocaleDateString('tr-TR', { month: 'short' })}
                    </span>
                  </div>
                );
              })}
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
              placeholder="Sipariş ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tüm Durumlar</option>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">Tüm Ödeme Durumları</option>
            {PAYMENT_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Sipariş
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Müşteri
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Tutar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Ödeme
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Tarih
                      </th>
                      {(canEdit || canDelete) && (
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {order.orderNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.items.length} ürün
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₺{order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items.length} ürün
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}
                          >
                            {getPaymentStatusText(order.paymentStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        {(canEdit || canDelete) && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                title="Görüntüle"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {canEdit && (
                                <button
                                  onClick={() => openEditModal(order)}
                                  className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                  title="Düzenle"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(order._id, order.orderNumber)}
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
                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Sipariş bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Arama kriterlerinizi değiştirin veya yeni sipariş oluşturun.
                    </p>
                    {canEdit && (
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={openCreateModal}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Siparişi Oluştur
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

      {/* Order Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
        order={selectedOrder}
        mode={modalMode}
      />
    </DashboardLayout>
  );
} 