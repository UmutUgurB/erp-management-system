'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { ordersAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingCart,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Package,
  CreditCard,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      sku: string;
    };
    quantity: number;
    price: number;
  }>;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  notes?: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const { user } = useAuth();

  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;

      const response = await ordersAPI.getOrders(params);
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Siparişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      toast.success('Sipariş durumu güncellendi');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Durum güncellenirken hata oluştu');
    }
  };

  const handlePaymentUpdate = async (orderId: string, newPaymentStatus: string) => {
    try {
      await ordersAPI.updatePaymentStatus(orderId, newPaymentStatus);
      toast.success('Ödeme durumu güncellendi');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ödeme durumu güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu siparişi silmek istediğinizden emin misiniz?')) return;

    try {
      await ordersAPI.deleteOrder(id);
      toast.success('Sipariş başarıyla silindi');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Sipariş silinirken hata oluştu');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-purple-600 bg-purple-100';
      case 'shipped':
        return 'text-orange-600 bg-orange-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'confirmed':
        return 'Onaylandı';
      case 'processing':
        return 'İşleniyor';
      case 'shipped':
        return 'Kargoda';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'partial':
        return 'text-orange-600 bg-orange-100';
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'refunded':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'partial':
        return 'Kısmi';
      case 'paid':
        return 'Ödendi';
      case 'refunded':
        return 'İade Edildi';
      default:
        return status;
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
            <h1 className="text-2xl font-semibold text-gray-900">Sipariş Yönetimi</h1>
            <p className="mt-2 text-sm text-gray-700">
              Tüm siparişleri görüntüleyin, durumlarını güncelleyin ve yönetin.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Sipariş
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="confirmed">Onaylandı</option>
            <option value="processing">İşleniyor</option>
            <option value="shipped">Kargoda</option>
            <option value="delivered">Teslim Edildi</option>
            <option value="cancelled">İptal Edildi</option>
          </select>

          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">Tüm Ödeme Durumları</option>
            <option value="pending">Bekliyor</option>
            <option value="partial">Kısmi</option>
            <option value="paid">Ödendi</option>
            <option value="refunded">İade Edildi</option>
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
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-gray-500" />
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
                          <div className="text-sm text-gray-900">{order.customer.name}</div>
                          <div className="text-sm text-gray-500">{order.customer.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₺{order.totalAmount.toLocaleString('tr-TR')}
                          </div>
                          <div className="text-sm text-gray-500">{order.paymentMethod}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {canEdit ? (
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(
                                order.status
                              )}`}
                            >
                              <option value="pending">Beklemede</option>
                              <option value="confirmed">Onaylandı</option>
                              <option value="processing">İşleniyor</option>
                              <option value="shipped">Kargoda</option>
                              <option value="delivered">Teslim Edildi</option>
                              <option value="cancelled">İptal Edildi</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {canEdit ? (
                            <select
                              value={order.paymentStatus}
                              onChange={(e) => handlePaymentUpdate(order._id, e.target.value)}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getPaymentStatusColor(
                                order.paymentStatus
                              )}`}
                            >
                              <option value="pending">Bekliyor</option>
                              <option value="partial">Kısmi</option>
                              <option value="paid">Ödendi</option>
                              <option value="refunded">İade Edildi</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                                order.paymentStatus
                              )}`}
                            >
                              {getPaymentStatusText(order.paymentStatus)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.createdBy.name}
                          </div>
                        </td>
                        {(canEdit || canDelete) && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                className="text-gray-600 hover:text-gray-900"
                                title="Görüntüle"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(order._id)}
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
                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Sipariş bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Henüz sipariş bulunmuyor veya filtreleme kriterlerinizi değiştirin.
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