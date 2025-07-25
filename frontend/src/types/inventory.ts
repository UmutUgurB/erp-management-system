export interface InventoryTransaction {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    price?: number;
    cost?: number;
  };
  type: 'in' | 'out' | 'transfer' | 'count' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reference: string;
  referenceNumber: string;
  location: {
    from?: string;
    to?: string;
  };
  reason: 'purchase' | 'sale' | 'return' | 'damage' | 'expiry' | 'transfer' | 'count' | 'adjustment' | 'theft' | 'other';
  notes?: string;
  unitCost?: number;
  totalCost?: number;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface StockCount {
  _id: string;
  title: string;
  description?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  type: 'full' | 'partial' | 'cycle';
  location?: string;
  category?: string;
  scheduledDate?: string;
  startDate?: string;
  endDate?: string;
  items: StockCountItem[];
  totalItems: number;
  countedItems: number;
  totalVariance: number;
  totalValue: number;
  varianceValue: number;
  progressPercentage: number;
  statusText: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  }[];
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockCountItem {
  product: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
  };
  expectedQuantity: number;
  actualQuantity?: number;
  variance?: number;
  notes?: string;
  countedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  countedAt?: string;
}

export interface InventoryStats {
  stats: {
    _id: string;
    count: number;
    totalQuantity: number;
    totalValue: number;
  }[];
  totalTransactions: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface StockCountStats {
  stats: {
    _id: string;
    count: number;
    totalItems: number;
    totalValue: number;
  }[];
  totalCounts: number;
  activeCounts: number;
  completedCounts: number;
}

export interface StockInFormData {
  productId: string;
  quantity: number;
  reference: string;
  referenceNumber: string;
  reason: string;
  notes?: string;
  unitCost?: number;
  location?: string;
}

export interface StockOutFormData {
  productId: string;
  quantity: number;
  reference: string;
  referenceNumber: string;
  reason: string;
  notes?: string;
  location?: string;
}

export interface StockTransferFormData {
  productId: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  reference: string;
  referenceNumber: string;
  notes?: string;
}

export interface StockAdjustmentFormData {
  productId: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockCountFormData {
  title: string;
  description?: string;
  type: 'full' | 'partial' | 'cycle';
  location?: string;
  category?: string;
  scheduledDate?: string;
  items: {
    product: string;
    expectedQuantity: number;
  }[];
  assignedTo?: string[];
} 