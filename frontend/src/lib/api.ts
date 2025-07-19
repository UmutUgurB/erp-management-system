import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/auth/register', userData),
  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Products API
export const productsAPI = {
  getProducts: (params?: any) =>
    api.get('/products', { params }),
  getProduct: (id: string) =>
    api.get(`/products/${id}`),
  createProduct: (productData: any) =>
    api.post('/products', productData),
  updateProduct: (id: string, productData: any) =>
    api.put(`/products/${id}`, productData),
  deleteProduct: (id: string) =>
    api.delete(`/products/${id}`),
  updateStock: (id: string, stock: number) =>
    api.patch(`/products/${id}/stock`, { stock }),
};

// Orders API
export const ordersAPI = {
  getOrders: (params?: any) =>
    api.get('/orders', { params }),
  getOrder: (id: string) =>
    api.get(`/orders/${id}`),
  createOrder: (orderData: any) =>
    api.post('/orders', orderData),
  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
  updatePaymentStatus: (id: string, paymentStatus: string) =>
    api.patch(`/orders/${id}/payment`, { paymentStatus }),
  deleteOrder: (id: string) =>
    api.delete(`/orders/${id}`),
};

// Users API
export const usersAPI = {
  getUsers: (params?: any) =>
    api.get('/users', { params }),
  getUser: (id: string) =>
    api.get(`/users/${id}`),
  updateUser: (id: string, userData: any) =>
    api.put(`/users/${id}`, userData),
  updateUserStatus: (id: string, isActive: boolean) =>
    api.patch(`/users/${id}/status`, { isActive }),
  changePassword: (id: string, passwordData: any) =>
    api.patch(`/users/${id}/password`, passwordData),
  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
};

export default api; 