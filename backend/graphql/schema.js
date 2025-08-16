const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Scalar types
  scalar Date
  scalar JSON
  scalar Upload

  type User {
    id: ID!
    username: String!
    email: String!
    name: String!
    role: String!
    department: String
    position: String
    phone: String
    avatar: String
    isActive: Boolean!
    lastLogin: String
    preferences: UserPreferences
    permissions: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  type UserPreferences {
    theme: String!
    language: String!
    notifications: NotificationPreferences
    dashboard: DashboardPreferences
  }

  type NotificationPreferences {
    email: Boolean!
    push: Boolean!
    sms: Boolean!
    frequency: String!
  }

  type DashboardPreferences {
    layout: String!
    widgets: [String!]!
    refreshInterval: Int!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    sku: String!
    category: String!
    subcategory: String
    brand: String
    price: Float!
    cost: Float!
    stock: Int!
    minStock: Int!
    maxStock: Int
    supplier: Supplier
    location: String
    images: [String!]!
    tags: [String!]!
    specifications: JSON
    isActive: Boolean!
    isFeatured: Boolean!
    rating: Float
    reviews: [Review!]!
    createdAt: String!
    updatedAt: String!
  }

  type Supplier {
    id: ID!
    name: String!
    email: String!
    phone: String
    address: Address
    rating: Float
    isActive: Boolean!
  }

  type Review {
    id: ID!
    user: User!
    rating: Int!
    comment: String
    createdAt: String!
  }

  type Order {
    id: ID!
    orderNumber: String!
    customer: Customer!
    items: [OrderItem!]!
    totalAmount: Float!
    taxAmount: Float!
    discountAmount: Float!
    finalAmount: Float!
    status: OrderStatus!
    paymentStatus: PaymentStatus!
    shippingAddress: Address
    billingAddress: Address
    shippingMethod: String
    paymentMethod: String
    notes: String
    estimatedDelivery: String
    actualDelivery: String
    trackingNumber: String
    createdAt: String!
    updatedAt: String!
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    REFUNDED
  }

  enum PaymentStatus {
    PENDING
    PAID
    PARTIALLY_PAID
    FAILED
    REFUNDED
  }

  type OrderItem {
    id: ID!
    product: Product!
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!
    discount: Float
    notes: String
  }

  type Customer {
    id: ID!
    name: String!
    email: String!
    phone: String
    company: String
    address: Address
    preferences: CustomerPreferences
    loyaltyPoints: Int
    totalSpent: Float
    lastPurchase: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type CustomerPreferences {
    preferredPaymentMethod: String
    preferredShippingMethod: String
    marketingConsent: Boolean!
    newsletterSubscription: Boolean!
  }

  type Address {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
    isDefault: Boolean
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
    benefits: [String!]!
    supervisor: Employee
    subordinates: [Employee!]!
    skills: [String!]!
    certifications: [Certification!]!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Certification {
    id: ID!
    name: String!
    issuingOrganization: String!
    issueDate: String!
    expiryDate: String
    credentialId: String
  }

  type Attendance {
    id: ID!
    employee: Employee!
    date: String!
    checkIn: String
    checkOut: String
    totalHours: Float
    overtime: Float
    status: AttendanceStatus!
    location: String
    notes: String
    approvedBy: Employee
  }

  enum AttendanceStatus {
    PRESENT
    ABSENT
    LATE
    HALF_DAY
    LEAVE
    HOLIDAY
  }

  type Leave {
    id: ID!
    employee: Employee!
    type: LeaveType!
    startDate: String!
    endDate: String!
    days: Int!
    reason: String
    status: LeaveStatus!
    approvedBy: Employee
    createdAt: String!
  }

  enum LeaveType {
    ANNUAL
    SICK
    PERSONAL
    MATERNITY
    PATERNITY
    UNPAID
  }

  enum LeaveStatus {
    PENDING
    APPROVED
    REJECTED
    CANCELLED
  }

  type Payroll {
    id: ID!
    employee: Employee!
    period: String!
    baseSalary: Float!
    overtime: Float
    bonuses: Float
    allowances: Float
    deductions: Float
    tax: Float
    netSalary: Float!
    status: PayrollStatus!
    paidAt: String
    paymentMethod: String
  }

  enum PayrollStatus {
    PENDING
    PROCESSED
    PAID
    CANCELLED
  }

  type Project {
    id: ID!
    name: String!
    description: String
    client: Customer
    manager: Employee!
    team: [Employee!]!
    startDate: String!
    endDate: String
    status: ProjectStatus!
    priority: Priority!
    budget: Float
    actualCost: Float
    progress: Float
    tasks: [Task!]!
    milestones: [Milestone!]!
    createdAt: String!
    updatedAt: String!
  }

  enum ProjectStatus {
    PLANNING
    ACTIVE
    ON_HOLD
    COMPLETED
    CANCELLED
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  type Task {
    id: ID!
    title: String!
    description: String
    project: Project
    assignedTo: Employee
    assignedBy: Employee!
    status: TaskStatus!
    priority: Priority!
    dueDate: String
    estimatedHours: Float
    actualHours: Float
    progress: Float
    dependencies: [Task!]!
    comments: [TaskComment!]!
    attachments: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  enum TaskStatus {
    TODO
    IN_PROGRESS
    REVIEW
    COMPLETED
    CANCELLED
  }

  type TaskComment {
    id: ID!
    user: User!
    comment: String!
    createdAt: String!
  }

  type Milestone {
    id: ID!
    name: String!
    description: String
    dueDate: String!
    completedDate: String
    isCompleted: Boolean!
  }

  type Asset {
    id: ID!
    name: String!
    type: AssetType!
    category: String!
    serialNumber: String
    purchaseDate: String
    purchasePrice: Float
    currentValue: Float
    location: String
    assignedTo: Employee
    status: AssetStatus!
    maintenanceHistory: [MaintenanceRecord!]!
    warranty: Warranty
    createdAt: String!
    updatedAt: String!
  }

  enum AssetType {
    EQUIPMENT
    VEHICLE
    BUILDING
    SOFTWARE
    FURNITURE
    TOOL
  }

  enum AssetStatus {
    ACTIVE
    INACTIVE
    MAINTENANCE
    RETIRED
    LOST
  }

  type MaintenanceRecord {
    id: ID!
    asset: Asset!
    type: MaintenanceType!
    description: String!
    cost: Float
    performedBy: String
    performedAt: String!
    nextMaintenance: String
  }

  enum MaintenanceType {
    PREVENTIVE
    CORRECTIVE
    EMERGENCY
  }

  type Warranty {
    startDate: String!
    endDate: String!
    provider: String!
    terms: String
    contactInfo: String
  }

  type Invoice {
    id: ID!
    invoiceNumber: String!
    customer: Customer!
    order: Order
    items: [InvoiceItem!]!
    subtotal: Float!
    taxAmount: Float!
    discountAmount: Float!
    totalAmount: Float!
    status: InvoiceStatus!
    dueDate: String!
    paidDate: String
    paymentMethod: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  enum InvoiceStatus {
    DRAFT
    SENT
    PAID
    OVERDUE
    CANCELLED
  }

  type InvoiceItem {
    id: ID!
    product: Product!
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!
    description: String
  }

  type Payment {
    id: ID!
    invoice: Invoice!
    amount: Float!
    method: PaymentMethod!
    reference: String
    status: PaymentStatus!
    processedAt: String!
    notes: String
  }

  enum PaymentMethod {
    CASH
    CREDIT_CARD
    DEBIT_CARD
    BANK_TRANSFER
    CHECK
    DIGITAL_WALLET
  }

  type Report {
    id: ID!
    name: String!
    type: ReportType!
    data: JSON!
    filters: JSON
    format: ReportFormat!
    schedule: String
    recipients: [String!]!
    createdAt: String!
    createdBy: User!
  }

  enum ReportType {
    SALES
    INVENTORY
    FINANCIAL
    EMPLOYEE
    CUSTOMER
    PROJECT
    CUSTOM
  }

  enum ReportFormat {
    PDF
    EXCEL
    CSV
    JSON
    HTML
  }

  type Dashboard {
    id: ID!
    name: String!
    description: String
    widgets: [Widget!]!
    layout: JSON!
    isDefault: Boolean!
    isPublic: Boolean!
    permissions: [String!]!
    createdAt: String!
    createdBy: User!
  }

  type Widget {
    id: ID!
    type: WidgetType!
    title: String!
    config: JSON!
    position: Int!
    size: WidgetSize!
    refreshInterval: Int
  }

  enum WidgetType {
    CHART
    TABLE
    METRIC
    PROGRESS
    CALENDAR
    TIMELINE
    MAP
  }

  enum WidgetSize {
    SMALL
    MEDIUM
    LARGE
    FULL_WIDTH
  }

  type Notification {
    id: ID!
    title: String!
    message: String!
    type: NotificationType!
    priority: Priority!
    isRead: Boolean!
    actionUrl: String
    expiresAt: String
    createdAt: String!
    user: User!
  }

  enum NotificationType {
    INFO
    SUCCESS
    WARNING
    ERROR
    SYSTEM
  }

  type AuditLog {
    id: ID!
    action: String!
    entity: String!
    entityId: String!
    changes: JSON
    user: User!
    ipAddress: String
    userAgent: String
    timestamp: String!
  }

  type Backup {
    id: ID!
    filename: String!
    size: Float!
    type: BackupType!
    status: BackupStatus!
    createdAt: String!
    createdBy: User!
    expiresAt: String
  }

  enum BackupType {
    FULL
    INCREMENTAL
    DIFFERENTIAL
  }

  enum BackupStatus {
    IN_PROGRESS
    COMPLETED
    FAILED
    EXPIRED
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
    avatar: String
    preferences: UserPreferencesInput
    permissions: [String!]
  }

  input UserPreferencesInput {
    theme: String
    language: String
    notifications: NotificationPreferencesInput
    dashboard: DashboardPreferencesInput
  }

  input NotificationPreferencesInput {
    email: Boolean
    push: Boolean
    sms: Boolean
    frequency: String
  }

  input DashboardPreferencesInput {
    layout: String
    widgets: [String!]
    refreshInterval: Int
  }

  input ProductInput {
    name: String!
    description: String
    sku: String!
    category: String!
    subcategory: String
    brand: String
    price: Float!
    cost: Float!
    stock: Int!
    minStock: Int!
    maxStock: Int
    supplierId: ID
    location: String
    images: [String!]
    tags: [String!]
    specifications: JSON
    isFeatured: Boolean
  }

  input OrderInput {
    customerId: ID!
    items: [OrderItemInput!]!
    shippingAddress: AddressInput
    billingAddress: AddressInput
    shippingMethod: String
    paymentMethod: String
    notes: String
    estimatedDelivery: String
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
    unitPrice: Float!
    discount: Float
    notes: String
  }

  input CustomerInput {
    name: String!
    email: String!
    phone: String
    company: String
    address: AddressInput
    preferences: CustomerPreferencesInput
  }

  input CustomerPreferencesInput {
    preferredPaymentMethod: String
    preferredShippingMethod: String
    marketingConsent: Boolean
    newsletterSubscription: Boolean
  }

  input AddressInput {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
    isDefault: Boolean
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
    benefits: [String!]
    supervisorId: ID
    skills: [String!]
  }

  input AttendanceInput {
    employeeId: ID!
    date: String!
    checkIn: String
    checkOut: String
    location: String
    notes: String
  }

  input LeaveInput {
    employeeId: ID!
    type: LeaveType!
    startDate: String!
    endDate: String!
    reason: String
  }

  input PayrollInput {
    employeeId: ID!
    period: String!
    baseSalary: Float!
    overtime: Float
    bonuses: Float
    allowances: Float
    deductions: Float
    tax: Float
  }

  input ProjectInput {
    name: String!
    description: String
    clientId: ID
    managerId: ID!
    teamIds: [ID!]
    startDate: String!
    endDate: String
    priority: Priority!
    budget: Float
  }

  input TaskInput {
    title: String!
    description: String
    projectId: ID
    assignedToId: ID
    priority: Priority!
    dueDate: String
    estimatedHours: Float
    dependencies: [ID!]
  }

  input AssetInput {
    name: String!
    type: AssetType!
    category: String!
    serialNumber: String
    purchaseDate: String
    purchasePrice: Float
    location: String
    assignedToId: ID
  }

  input InvoiceInput {
    customerId: ID!
    orderId: ID
    items: [InvoiceItemInput!]!
    dueDate: String!
    notes: String
  }

  input InvoiceItemInput {
    productId: ID!
    quantity: Int!
    unitPrice: Float!
    description: String
  }

  input PaymentInput {
    invoiceId: ID!
    amount: Float!
    method: PaymentMethod!
    reference: String
    notes: String
  }

  input ReportInput {
    name: String!
    type: ReportType!
    data: JSON!
    filters: JSON
    format: ReportFormat!
    schedule: String
    recipients: [String!]
  }

  input DashboardInput {
    name: String!
    description: String
    widgets: [WidgetInput!]
    layout: JSON
    isPublic: Boolean
    permissions: [String!]
  }

  input WidgetInput {
    type: WidgetType!
    title: String!
    config: JSON!
    position: Int!
    size: WidgetSize!
    refreshInterval: Int
  }

  input LoginInput {
    username: String!
    password: String!
    rememberMe: Boolean
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

  input SearchInput {
    query: String!
    filters: [FilterInput!]
    pagination: PaginationInput
    sort: SortInput
  }

  # Query types
  type Query {
    # Auth
    me: User
    users(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [User!]!
    user(id: ID!): User
    userByEmail(email: String!): User

    # Products
    products(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Product!]!
    product(id: ID!): Product
    productsByCategory(category: String!): [Product!]!
    productsByBrand(brand: String!): [Product!]!
    lowStockProducts: [Product!]!
    outOfStockProducts: [Product!]!
    featuredProducts: [Product!]!
    searchProducts(input: SearchInput!): [Product!]!

    # Orders
    orders(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Order!]!
    order(id: ID!): Order
    ordersByStatus(status: OrderStatus!): [Order!]!
    ordersByCustomer(customerId: ID!): [Order!]!
    ordersByDateRange(startDate: String!, endDate: String!): [Order!]!

    # Customers
    customers(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Customer!]!
    customer(id: ID!): Customer
    customersByCompany(company: String!): [Customer!]!
    topCustomers(limit: Int!): [Customer!]!

    # Employees
    employees(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Employee!]!
    employee(id: ID!): Employee
    employeesByDepartment(department: String!): [Employee!]!
    employeesByPosition(position: String!): [Employee!]!

    # Attendance
    attendance(employeeId: ID!, startDate: String!, endDate: String!): [Attendance!]!
    attendanceByDate(date: String!): [Attendance!]!
    attendanceByEmployee(employeeId: ID!): [Attendance!]!

    # Leave
    leaveRequests(pagination: PaginationInput, filters: [FilterInput!]): [Leave!]!
    leaveRequest(id: ID!): Leave
    leaveRequestsByEmployee(employeeId: ID!): [Leave!]!
    leaveRequestsByStatus(status: LeaveStatus!): [Leave!]!

    # Payroll
    payroll(employeeId: ID!, period: String!): Payroll
    payrollByPeriod(period: String!): [Payroll!]!
    payrollByEmployee(employeeId: ID!): [Payroll!]!

    # Projects
    projects(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Project!]!
    project(id: ID!): Project
    projectsByStatus(status: ProjectStatus!): [Project!]!
    projectsByManager(managerId: ID!): [Project!]!

    # Tasks
    tasks(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Task!]!
    task(id: ID!): Task
    tasksByProject(projectId: ID!): [Task!]!
    tasksByAssignee(assigneeId: ID!): [Task!]!
    tasksByStatus(status: TaskStatus!): [Task!]!

    # Assets
    assets(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Asset!]!
    asset(id: ID!): Asset
    assetsByType(type: AssetType!): [Asset!]!
    assetsByLocation(location: String!): [Asset!]!
    assetsByEmployee(employeeId: ID!): [Asset!]!

    # Invoices
    invoices(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Invoice!]!
    invoice(id: ID!): Invoice
    invoicesByStatus(status: InvoiceStatus!): [Invoice!]!
    invoicesByCustomer(customerId: ID!): [Invoice!]!
    overdueInvoices: [Invoice!]!

    # Payments
    payments(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Payment!]!
    payment(id: ID!): Payment
    paymentsByInvoice(invoiceId: ID!): [Payment!]!
    paymentsByMethod(method: PaymentMethod!): [Payment!]!

    # Reports
    reports(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [Report!]!
    report(id: ID!): Report
    reportsByType(type: ReportType!): [Report!]!

    # Dashboards
    dashboards: [Dashboard!]!
    dashboard(id: ID!): Dashboard
    defaultDashboard: Dashboard
    publicDashboards: [Dashboard!]!

    # Notifications
    notifications(pagination: PaginationInput): [Notification!]!
    unreadNotifications: [Notification!]!
    notificationsByType(type: NotificationType!): [Notification!]!

    # Audit Logs
    auditLogs(pagination: PaginationInput, filters: [FilterInput!], sort: SortInput): [AuditLog!]!
    auditLogsByUser(userId: ID!): [AuditLog!]!
    auditLogsByEntity(entity: String!, entityId: String!): [AuditLog!]!

    # Backups
    backups: [Backup!]!
    backup(id: ID!): Backup
    backupStats: BackupStats!

    # Analytics
    salesAnalytics(startDate: String!, endDate: String!): SalesAnalytics!
    inventoryAnalytics: InventoryAnalytics!
    employeeAnalytics: EmployeeAnalytics!
    financialAnalytics(startDate: String!, endDate: String!): FinancialAnalytics!
    projectAnalytics: ProjectAnalytics!
    customerAnalytics: CustomerAnalytics!
  }

  # Mutation types
  type Mutation {
    # Auth
    login(input: LoginInput!): AuthResponse!
    logout: Boolean!
    register(input: UserInput!): AuthResponse!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
    resetPassword(email: String!): Boolean!
    refreshToken: AuthResponse!
    updateProfile(input: UserInput!): User!

    # Users
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): Boolean!
    activateUser(id: ID!): User!
    deactivateUser(id: ID!): User!
    updateUserPermissions(id: ID!, permissions: [String!]!): User!

    # Products
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    updateStock(id: ID!, quantity: Int!): Product!
    bulkUpdateProducts(products: [ProductUpdateInput!]!): [Product!]!
    uploadProductImage(productId: ID!, file: Upload!): Product!

    # Orders
    createOrder(input: OrderInput!): Order!
    updateOrder(id: ID!, input: OrderInput!): Order!
    deleteOrder(id: ID!): Boolean!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    cancelOrder(id: ID!, reason: String!): Order!

    # Customers
    createCustomer(input: CustomerInput!): Customer!
    updateCustomer(id: ID!, input: CustomerInput!): Customer!
    deleteCustomer(id: ID!): Boolean!
    updateCustomerPreferences(id: ID!, preferences: CustomerPreferencesInput!): Customer!

    # Employees
    createEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeInput!): Employee!
    deleteEmployee(id: ID!): Boolean!
    updateEmployeeSkills(id: ID!, skills: [String!]!): Employee!

    # Attendance
    checkIn(employeeId: ID!, location: String): Attendance!
    checkOut(employeeId: ID!): Attendance!
    updateAttendance(id: ID!, input: AttendanceInput!): Attendance!
    approveAttendance(id: ID!): Attendance!

    # Leave
    createLeaveRequest(input: LeaveInput!): Leave!
    updateLeaveRequest(id: ID!, input: LeaveInput!): Leave!
    deleteLeaveRequest(id: ID!): Boolean!
    approveLeaveRequest(id: ID!): Leave!
    rejectLeaveRequest(id: ID!, reason: String!): Leave!

    # Payroll
    createPayroll(input: PayrollInput!): Payroll!
    updatePayroll(id: ID!, input: PayrollInput!): Payroll!
    processPayroll(period: String!): [Payroll!]!
    approvePayroll(id: ID!): Payroll!

    # Projects
    createProject(input: ProjectInput!): Project!
    updateProject(id: ID!, input: ProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
    updateProjectStatus(id: ID!, status: ProjectStatus!): Project!
    assignTeamMember(projectId: ID!, employeeId: ID!): Project!

    # Tasks
    createTask(input: TaskInput!): Task!
    updateTask(id: ID!, input: TaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    updateTaskStatus(id: ID!, status: TaskStatus!): Task!
    assignTask(id: ID!, employeeId: ID!): Task!
    addTaskComment(id: ID!, comment: String!): Task!

    # Assets
    createAsset(input: AssetInput!): Asset!
    updateAsset(id: ID!, input: AssetInput!): Asset!
    deleteAsset(id: ID!): Boolean!
    assignAsset(id: ID!, employeeId: ID!): Asset!
    createMaintenanceRecord(assetId: ID!, input: MaintenanceRecordInput!): MaintenanceRecord!

    # Invoices
    createInvoice(input: InvoiceInput!): Invoice!
    updateInvoice(id: ID!, input: InvoiceInput!): Invoice!
    deleteInvoice(id: ID!): Boolean!
    updateInvoiceStatus(id: ID!, status: InvoiceStatus!): Invoice!
    sendInvoice(id: ID!): Invoice!

    # Payments
    createPayment(input: PaymentInput!): Payment!
    updatePayment(id: ID!, input: PaymentInput!): Payment!
    deletePayment(id: ID!): Boolean!
    processPayment(id: ID!): Payment!

    # Reports
    createReport(input: ReportInput!): Report!
    updateReport(id: ID!, input: ReportInput!): Report!
    deleteReport(id: ID!): Boolean!
    generateReport(id: ID!): Report!
    scheduleReport(id: ID!, schedule: String!): Report!

    # Dashboards
    createDashboard(input: DashboardInput!): Dashboard!
    updateDashboard(id: ID!, input: DashboardInput!): Dashboard!
    deleteDashboard(id: ID!): Boolean!
    setDefaultDashboard(id: ID!): Dashboard!
    updateDashboardLayout(id: ID!, layout: JSON!): Dashboard!

    # Notifications
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Boolean!
    deleteNotification(id: ID!): Boolean!
    createNotification(input: NotificationInput!): Notification!

    # Backups
    createBackup: Backup!
    restoreBackup(id: ID!): Boolean!
    deleteBackup(id: ID!): Boolean!
    downloadBackup(id: ID!): String!
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
    taskUpdated: Task!
    projectUpdated: Project!
    notificationCreated: Notification!
    systemAlert: SystemAlert!
  }

  type SystemAlert {
    id: ID!
    type: String!
    message: String!
    severity: String!
    timestamp: String!
  }

  # Response types
  type AuthResponse {
    token: String!
    refreshToken: String!
    user: User!
    expiresIn: Int!
  }

  type SalesAnalytics {
    totalSales: Float!
    totalOrders: Int!
    averageOrderValue: Float!
    topProducts: [ProductSales!]!
    salesByDate: [SalesByDate!]!
    salesByCategory: [CategorySales!]!
    customerRetention: Float!
  }

  type ProductSales {
    product: Product!
    quantity: Int!
    revenue: Float!
    profit: Float!
  }

  type SalesByDate {
    date: String!
    sales: Float!
    orders: Int!
    customers: Int!
  }

  type CategorySales {
    category: String!
    sales: Float!
    orders: Int!
    products: Int!
  }

  type InventoryAnalytics {
    totalProducts: Int!
    totalValue: Float!
    lowStockItems: [Product!]!
    outOfStockItems: [Product!]!
    categoryDistribution: [CategoryDistribution!]!
    stockTurnover: Float!
    averageStockValue: Float!
  }

  type CategoryDistribution {
    category: String!
    count: Int!
    value: Float!
    percentage: Float!
  }

  type EmployeeAnalytics {
    totalEmployees: Int!
    activeEmployees: Int!
    averageSalary: Float!
    departmentDistribution: [DepartmentDistribution!]!
    attendanceRate: Float!
    turnoverRate: Float!
    productivityScore: Float!
  }

  type DepartmentDistribution {
    department: String!
    count: Int!
    averageSalary: Float!
    productivity: Float!
  }

  type FinancialAnalytics {
    totalRevenue: Float!
    totalExpenses: Float!
    netProfit: Float!
    profitMargin: Float!
    cashFlow: Float!
    outstandingInvoices: Float!
    overduePayments: Float!
    monthlyTrends: [MonthlyFinancial!]!
  }

  type MonthlyFinancial {
    month: String!
    revenue: Float!
    expenses: Float!
    profit: Float!
  }

  type ProjectAnalytics {
    totalProjects: Int!
    activeProjects: Int!
    completedProjects: Int!
    averageProjectDuration: Float!
    projectSuccessRate: Float!
    budgetUtilization: Float!
    teamProductivity: Float!
  }

  type CustomerAnalytics {
    totalCustomers: Int!
    activeCustomers: Int!
    newCustomers: Int!
    customerLifetimeValue: Float!
    customerSatisfaction: Float!
    churnRate: Float!
    topCustomerSegments: [CustomerSegment!]!
  }

  type CustomerSegment {
    segment: String!
    count: Int!
    averageValue: Float!
    retentionRate: Float!
  }

  type BackupStats {
    totalBackups: Int!
    totalSize: Float!
    lastBackup: String
    nextScheduledBackup: String
    backupSuccessRate: Float!
  }

  input ProductUpdateInput {
    id: ID!
    stock: Int
    price: Float
    cost: Float
    isActive: Boolean
  }

  input MaintenanceRecordInput {
    type: MaintenanceType!
    description: String!
    cost: Float
    performedBy: String
    nextMaintenance: String
  }

  input NotificationInput {
    title: String!
    message: String!
    type: NotificationType!
    priority: Priority!
    userId: ID!
    actionUrl: String
    expiresAt: String
  }
`;

module.exports = typeDefs; 