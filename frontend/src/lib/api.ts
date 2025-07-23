import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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

// Response interceptor to handle errors
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
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', userData),
  
  getProfile: () => api.get('/auth/profile'),
};

// Users API
export const usersAPI = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  createUser: (userData: any) => api.post('/users', userData),
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Products API
export const productsAPI = {
  getProducts: (params?: any) => api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  createProduct: (productData: any) => api.post('/products', productData),
  updateProduct: (id: string, productData: any) => api.put(`/products/${id}`, productData),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
};

// Orders API
export const ordersAPI = {
  getOrders: (params?: any) => api.get('/orders', { params }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  createOrder: (orderData: any) => api.post('/orders', orderData),
  updateOrder: (id: string, orderData: any) => api.put(`/orders/${id}`, orderData),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) => 
    api.patch(`/orders/${id}/status`, { status }),
  updatePaymentStatus: (id: string, paymentStatus: string) => 
    api.patch(`/orders/${id}/payment`, { paymentStatus }),
};

// Employees API
export const employeesAPI = {
  getEmployees: (filters?: any) => api.get('/employees', { params: filters }),
  getEmployee: (id: string) => api.get(`/employees/${id}`),
  createEmployee: (data: any) => api.post('/employees', data),
  updateEmployee: (id: string, data: any) => api.put(`/employees/${id}`, data),
  deleteEmployee: (id: string) => api.delete(`/employees/${id}`),
  getStats: () => api.get('/employees/stats/overview'),
  getByDepartment: (department: string) => api.get(`/employees/department/${department}`),
  searchEmployees: (query: string) => api.get(`/employees/search/${query}`),
};

// Attendance API
export const attendanceAPI = {
  getAttendance: (filters?: any) => api.get('/attendance', { params: filters }),
  getAttendanceRecord: (id: string) => api.get(`/attendance/${id}`),
  checkIn: (data: any) => api.post('/attendance/checkin', data),
  checkOut: (data: any) => api.post('/attendance/checkout', data),
  startBreak: (data: any) => api.post('/attendance/break/start', data),
  endBreak: (data: any) => api.post('/attendance/break/end', data),
  updateAttendance: (id: string, data: any) => api.put(`/attendance/${id}`, data),
  deleteAttendance: (id: string) => api.delete(`/attendance/${id}`),
  getStats: (filters?: any) => api.get('/attendance/stats/overview', { params: filters }),
  getEmployeeStats: (employeeId: string, filters?: any) =>
    api.get(`/attendance/stats/employee/${employeeId}`, { params: filters }),
  bulkImport: (data: any) => api.post('/attendance/bulk-import', data),
  getReports: (filters?: any) => api.get('/attendance/reports', { params: filters }),
  exportReport: (format: string, filters?: any) => 
    api.get(`/attendance/reports/export/${format}`, { params: filters }),
};

// Payroll API
export const payrollAPI = {
  getPayroll: (filters?: any) => api.get('/payroll', { params: filters }),
  getPayrollRecord: (id: string) => api.get(`/payroll/${id}`),
  createPayroll: (data: any) => api.post('/payroll', data),
  updatePayroll: (id: string, data: any) => api.put(`/payroll/${id}`, data),
  deletePayroll: (id: string) => api.delete(`/payroll/${id}`),
  approvePayroll: (id: string) => api.patch(`/payroll/${id}/approve`),
  markAsPaid: (id: string, data: any) => api.patch(`/payroll/${id}/pay`, data),
  bulkCreate: (data: any) => api.post('/payroll/bulk-create', data),
  getStats: (filters?: any) => api.get('/payroll/stats/overview', { params: filters }),
  getEmployeeHistory: (employeeId: string, filters?: any) => 
    api.get(`/payroll/employee/${employeeId}`, { params: filters }),
};

export default api; 