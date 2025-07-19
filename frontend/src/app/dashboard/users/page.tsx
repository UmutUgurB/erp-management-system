'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { usersAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Key,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // Only admin can access this page
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      toast.error('Bu sayfaya erişim yetkiniz bulunmuyor');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [search, roleFilter, departmentFilter, user]);

  const fetchUsers = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (departmentFilter) params.department = departmentFilter;

      const response = await usersAPI.getUsers(params);
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await usersAPI.updateUserStatus(userId, !currentStatus);
      toast.success(`Kullanıcı ${!currentStatus ? 'aktif edildi' : 'deaktif edildi'}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Durum güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;

    try {
      await usersAPI.deleteUser(id);
      toast.success('Kullanıcı başarıyla silindi');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kullanıcı silinirken hata oluştu');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-100';
      case 'manager':
        return 'text-blue-600 bg-blue-100';
      case 'employee':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'employee':
        return 'Employee';
      default:
        return role;
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

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
            <h1 className="text-2xl font-semibold text-gray-900">Kullanıcı Yönetimi</h1>
            <p className="mt-2 text-sm text-gray-700">
              Sistem kullanıcılarını görüntüleyin, düzenleyin ve yönetin.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kullanıcı
            </button>
          </div>
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
              placeholder="Kullanıcı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tüm Roller</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>

          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">Tüm Departmanlar</option>
            <option value="IT">IT</option>
            <option value="İnsan Kaynakları">İnsan Kaynakları</option>
            <option value="Satış">Satış</option>
            <option value="Pazarlama">Pazarlama</option>
            <option value="Muhasebe">Muhasebe</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Departman
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Kayıt Tarihi
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userData) => (
                      <tr key={userData._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {userData.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {userData._id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{userData.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                              userData.role
                            )}`}
                          >
                            {getRoleText(userData.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{userData.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userData.isActive
                                ? 'text-green-600 bg-green-100'
                                : 'text-red-600 bg-red-100'
                            }`}
                          >
                            {userData.isActive ? 'Aktif' : 'Deaktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(userData.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="Görüntüle"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Düzenle"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(userData._id, userData.isActive)}
                              className={`${
                                userData.isActive
                                  ? 'text-red-600 hover:text-red-900'
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={userData.isActive ? 'Deaktif Et' : 'Aktif Et'}
                            >
                              {userData.isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              className="text-purple-600 hover:text-purple-900"
                              title="Şifre Sıfırla"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            {userData._id !== user._id && (
                              <button
                                onClick={() => handleDelete(userData._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Sil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Kullanıcı bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Arama kriterlerinizi değiştirin veya yeni kullanıcı ekleyin.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Kullanıcı İstatistikleri</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Toplam Kullanıcı
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {users.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Aktif Kullanıcı
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {users.filter(u => u.isActive).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserX className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Deaktif Kullanıcı
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {users.filter(u => !u.isActive).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 