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
};

// Inventory API
export const inventoryAPI = {
  getTransactions: (params?: any) => api.get('/inventory', { params }),
  getTransaction: (id: string) => api.get(`/inventory/${id}`),
  stockIn: (data: any) => api.post('/inventory/stock-in', data),
  stockOut: (data: any) => api.post('/inventory/stock-out', data),
  stockTransfer: (data: any) => api.post('/inventory/stock-transfer', data),
  stockAdjustment: (data: any) => api.post('/inventory/stock-adjustment', data),
  getStats: (params?: any) => api.get('/inventory/stats/overview', { params }),
  getProductHistory: (productId: string, params?: any) => 
    api.get(`/inventory/product/${productId}/history`, { params }),
};

// Stock Count API
export const stockCountAPI = {
  getStockCounts: (params?: any) => api.get('/stockcount', { params }),
  getStockCount: (id: string) => api.get(`/stockcount/${id}`),
  createStockCount: (data: any) => api.post('/stockcount', data),
  updateStockCount: (id: string, data: any) => api.put(`/stockcount/${id}`, data),
  startStockCount: (id: string) => api.patch(`/stockcount/${id}/start`),
  completeStockCount: (id: string) => api.patch(`/stockcount/${id}/complete`),
  updateItemCount: (id: string, itemIndex: number, data: any) =>
    api.patch(`/stockcount/${id}/items/${itemIndex}`, data),
  cancelStockCount: (id: string) => api.patch(`/stockcount/${id}/cancel`),
  getStats: () => api.get('/stockcount/stats/overview'),
};

export const customerAPI = {
  getCustomers: (params?: any) => api.get('/customers', { params }),
  getCustomer: (id: string) => api.get(`/customers/${id}`),
  createCustomer: (data: any) => api.post('/customers', data),
  updateCustomer: (id: string, data: any) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id: string) => api.delete(`/customers/${id}`),
  getCustomerInteractions: (customerId: string, params?: any) =>
    api.get(`/customers/${customerId}/interactions`, { params }),
  createCustomerInteraction: (customerId: string, data: any) =>
    api.post(`/customers/${customerId}/interactions`, data),
  updateCustomerInteraction: (customerId: string, interactionId: string, data: any) =>
    api.put(`/customers/${customerId}/interactions/${interactionId}`, data),
  getStats: () => api.get('/customers/stats/overview'),
  getAssignedCustomers: (userId: string) => api.get(`/customers/assigned/${userId}`),
  searchCustomers: (query: string) => api.get(`/customers/search/${query}`),
};

// Financial API
export const financialAPI = {
  getInvoices: (params?: any) => api.get('/invoices', { params }),
  getInvoice: (id: string) => api.get(`/invoices/${id}`),
  createInvoice: (data: any) => api.post('/invoices', data),
  updateInvoice: (id: string, data: any) => api.put(`/invoices/${id}`, data),
  deleteInvoice: (id: string) => api.delete(`/invoices/${id}`),
  recordPayment: (invoiceId: string, data: any) => api.post(`/invoices/${invoiceId}/payments`, data),
  sendInvoice: (id: string) => api.patch(`/invoices/${id}/send`),
  markAsPaid: (id: string) => api.patch(`/invoices/${id}/mark-paid`),
  getStats: (params?: any) => api.get('/invoices/stats/overview', { params }),
};

// Project API
export const projectAPI = {
  getProjects: (params?: any) => api.get('/projects', { params }),
  getProject: (id: string) => api.get(`/projects/${id}`),
  createProject: (data: any) => api.post('/projects', data),
  updateProject: (id: string, data: any) => api.put(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
  addTeamMember: (projectId: string, data: any) => api.post(`/projects/${projectId}/team`, data),
  removeTeamMember: (projectId: string, userId: string) => api.delete(`/projects/${projectId}/team/${userId}`),
  updateProgress: (projectId: string, data: any) => api.patch(`/projects/${projectId}/progress`, data),
  getStats: () => api.get('/projects/stats/overview'),
  getMyProjects: () => api.get('/projects/my/projects'),
};

// Task API
export const taskAPI = {
  getTasks: (params?: any) => api.get('/tasks', { params }),
  getTask: (id: string) => api.get(`/tasks/${id}`),
  createTask: (data: any) => api.post('/tasks', data),
  updateTask: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  addComment: (taskId: string, data: any) => api.post(`/tasks/${taskId}/comments`, data),
  startTimeTracking: (taskId: string, data: any) => api.post(`/tasks/${taskId}/time/start`, data),
  stopTimeTracking: (taskId: string) => api.post(`/tasks/${taskId}/time/stop`),
  updateProgress: (taskId: string, data: any) => api.patch(`/tasks/${taskId}/progress`, data),
  getMyTasks: (params?: any) => api.get('/tasks/my/tasks', { params }),
  getStats: (params?: any) => api.get('/tasks/stats/overview', { params }),
};

// Asset API
export const assetAPI = {
  getAssets: (params?: any) => api.get('/assets', { params }),
  getAsset: (id: string) => api.get(`/assets/${id}`),
  createAsset: (data: any) => api.post('/assets', data),
  updateAsset: (id: string, data: any) => api.put(`/assets/${id}`, data),
  deleteAsset: (id: string) => api.delete(`/assets/${id}`),
  addMaintenance: (assetId: string, data: any) => api.post(`/assets/${assetId}/maintenance`, data),
  updateStatus: (assetId: string, data: any) => api.patch(`/assets/${assetId}/status`, data),
  assignAsset: (assetId: string, data: any) => api.patch(`/assets/${assetId}/assign`, data),
  getStats: () => api.get('/assets/stats/overview'),
  getMyAssets: () => api.get('/assets/my/assets'),
  searchAssets: (query: string) => api.get(`/assets/search/${query}`),
};
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