const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    name: String!
    role: String!
    department: String
    position: String
    phone: String
    isActive: Boolean!
    lastLogin: String
    createdAt: String!
    updatedAt: String!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    sku: String!
    category: String!
    price: Float!
    cost: Float!
    stock: Int!
    minStock: Int!
    supplier: String
    location: String
    image: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Order {
    id: ID!
    orderNumber: String!
    customer: Customer!
    items: [OrderItem!]!
    totalAmount: Float!
    status: String!
    paymentStatus: String!
    shippingAddress: Address
    billingAddress: Address
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    id: ID!
    product: Product!
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!
  }

  type Customer {
    id: ID!
    name: String!
    email: String!
    phone: String
    company: String
    address: Address
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Address {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
  }

  type Employee {
    id: ID!
    employeeId: String!
    name: String!
    email: String!
    phone: String
    department: String!
    position: String!
    hireDate: String!
    salary: Float
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Attendance {
    id: ID!
    employee: Employee!
    date: String!
    checkIn: String
    checkOut: String
    totalHours: Float
    status: String!
    notes: String
  }

  type Payroll {
    id: ID!
    employee: Employee!
    period: String!
    baseSalary: Float!
    overtime: Float
    bonuses: Float
    deductions: Float
    netSalary: Float!
    status: String!
    paidAt: String
  }

  type Report {
    id: ID!
    name: String!
    type: String!
    data: String!
    filters: String
    createdAt: String!
    createdBy: User!
  }

  type Dashboard {
    id: ID!
    name: String!
    description: String
    widgets: [Widget!]!
    isDefault: Boolean!
    createdAt: String!
    createdBy: User!
  }

  type Widget {
    id: ID!
    type: String!
    title: String!
    config: String!
    position: Int!
  }

  type Notification {
    id: ID!
    title: String!
    message: String!
    type: String!
    isRead: Boolean!
    createdAt: String!
    user: User!
  }

  type AuditLog {
    id: ID!
    action: String!
    entity: String!
    entityId: String!
    changes: String
    user: User!
    ipAddress: String
    userAgent: String
    createdAt: String!
  }

  # Input types
  input UserInput {
    username: String!
    email: String!
    name: String!
    role: String!
    department: String
    position: String
    phone: String
    password: String!
  }

  input ProductInput {
    name: String!
    description: String
    sku: String!
    category: String!
    price: Float!
    cost: Float!
    stock: Int!
    minStock: Int!
    supplier: String
    location: String
    image: String
  }

  input OrderInput {
    customerId: ID!
    items: [OrderItemInput!]!
    shippingAddress: AddressInput
    billingAddress: AddressInput
    notes: String
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
    unitPrice: Float!
  }

  input CustomerInput {
    name: String!
    email: String!
    phone: String
    company: String
    address: AddressInput
  }

  input AddressInput {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
  }

  input EmployeeInput {
    employeeId: String!
    name: String!
    email: String!
    phone: String
    department: String!
    position: String!
    hireDate: String!
    salary: Float
  }

  input AttendanceInput {
    employeeId: ID!
    date: String!
    checkIn: String
    checkOut: String
    notes: String
  }

  input PayrollInput {
    employeeId: ID!
    period: String!
    baseSalary: Float!
    overtime: Float
    bonuses: Float
    deductions: Float
  }

  input ReportInput {
    name: String!
    type: String!
    data: String!
    filters: String
  }

  input DashboardInput {
    name: String!
    description: String
    widgets: [WidgetInput!]!
    isDefault: Boolean
  }

  input WidgetInput {
    type: String!
    title: String!
    config: String!
    position: Int!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input FilterInput {
    field: String!
    operator: String!
    value: String!
  }

  input PaginationInput {
    page: Int!
    limit: Int!
  }

  input SortInput {
    field: String!
    direction: String!
  }

  # Query types
  type Query {
    # Auth
    me: User
    users(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [User!]!
    user(id: ID!): User

    # Products
    products(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Product!]!
    product(id: ID!): Product
    productsByCategory(category: String!): [Product!]!
    lowStockProducts: [Product!]!

    # Orders
    orders(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Order!]!
    order(id: ID!): Order
    ordersByStatus(status: String!): [Order!]!
    ordersByCustomer(customerId: ID!): [Order!]!

    # Customers
    customers(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Customer!]!
    customer(id: ID!): Customer

    # Employees
    employees(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Employee!]!
    employee(id: ID!): Employee
    employeesByDepartment(department: String!): [Employee!]!

    # Attendance
    attendance(employeeId: ID!, startDate: String!, endDate: String!): [Attendance!]!
    attendanceByDate(date: String!): [Attendance!]!

    # Payroll
    payroll(employeeId: ID!, period: String!): Payroll
    payrollByPeriod(period: String!): [Payroll!]!

    # Reports
    reports(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Report!]!
    report(id: ID!): Report

    # Dashboards
    dashboards: [Dashboard!]!
    dashboard(id: ID!): Dashboard
    defaultDashboard: Dashboard

    # Notifications
    notifications(pagination: PaginationInput): [Notification!]!
    unreadNotifications: [Notification!]!

    # Audit Logs
    auditLogs(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [AuditLog!]!

    # Analytics
    salesAnalytics(startDate: String!, endDate: String!): SalesAnalytics!
    inventoryAnalytics: InventoryAnalytics!
    employeeAnalytics: EmployeeAnalytics!
  }

  # Mutation types
  type Mutation {
    # Auth
    login(input: LoginInput!): AuthResponse!
    logout: Boolean!
    register(input: UserInput!): AuthResponse!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
    resetPassword(email: String!): Boolean!

    # Users
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): Boolean!
    activateUser(id: ID!): User!
    deactivateUser(id: ID!): User!

    # Products
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    updateStock(id: ID!, quantity: Int!): Product!

    # Orders
    createOrder(input: OrderInput!): Order!
    updateOrder(id: ID!, input: OrderInput!): Order!
    deleteOrder(id: ID!): Boolean!
    updateOrderStatus(id: ID!, status: String!): Order!

    # Customers
    createCustomer(input: CustomerInput!): Customer!
    updateCustomer(id: ID!, input: CustomerInput!): Customer!
    deleteCustomer(id: ID!): Boolean!

    # Employees
    createEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeInput!): Employee!
    deleteEmployee(id: ID!): Boolean!

    # Attendance
    checkIn(employeeId: ID!): Attendance!
    checkOut(employeeId: ID!): Attendance!
    updateAttendance(id: ID!, input: AttendanceInput!): Attendance!

    # Payroll
    createPayroll(input: PayrollInput!): Payroll!
    updatePayroll(id: ID!, input: PayrollInput!): Payroll!
    processPayroll(period: String!): [Payroll!]!

    # Reports
    createReport(input: ReportInput!): Report!
    updateReport(id: ID!, input: ReportInput!): Report!
    deleteReport(id: ID!): Boolean!

    # Dashboards
    createDashboard(input: DashboardInput!): Dashboard!
    updateDashboard(id: ID!, input: DashboardInput!): Dashboard!
    deleteDashboard(id: ID!): Boolean!
    setDefaultDashboard(id: ID!): Dashboard!

    # Notifications
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Boolean!
    deleteNotification(id: ID!): Boolean!
  }

  # Subscription types
  type Subscription {
    # Real-time updates
    userUpdated: User!
    productUpdated: Product!
    orderUpdated: Order!
    customerUpdated: Customer!
    employeeUpdated: Employee!
    attendanceUpdated: Attendance!
    notificationCreated: Notification!
  }

  # Response types
  type AuthResponse {
    token: String!
    user: User!
  }

  type SalesAnalytics {
    totalSales: Float!
    totalOrders: Int!
    averageOrderValue: Float!
    topProducts: [ProductSales!]!
    salesByDate: [SalesByDate!]!
  }

  type ProductSales {
    product: Product!
    quantity: Int!
    revenue: Float!
  }

  type SalesByDate {
    date: String!
    sales: Float!
    orders: Int!
  }

  type InventoryAnalytics {
    totalProducts: Int!
    totalValue: Float!
    lowStockItems: [Product!]!
    outOfStockItems: [Product!]!
    categoryDistribution: [CategoryDistribution!]!
  }

  type CategoryDistribution {
    category: String!
    count: Int!
    value: Float!
  }

  type EmployeeAnalytics {
    totalEmployees: Int!
    activeEmployees: Int!
    averageSalary: Float!
    departmentDistribution: [DepartmentDistribution!]!
    attendanceRate: Float!
  }

  type DepartmentDistribution {
    department: String!
    count: Int!
    averageSalary: Float!
  }
`;

module.exports = typeDefs; 