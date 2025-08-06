export interface AssetDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit: 'cm' | 'inch' | 'm';
}

export interface AssetWeight {
  value?: number;
  unit: 'kg' | 'lb';
}

export interface AssetSpecifications {
  brand?: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  capacity?: string;
  dimensions?: AssetDimensions;
  weight?: AssetWeight;
}

export interface AssetLocation {
  building?: string;
  floor?: string;
  room?: string;
  department?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface AssetFinancial {
  purchasePrice?: number;
  currentValue?: number;
  depreciationRate?: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  insuranceExpiry?: string;
}

export interface MaintenanceRecord {
  date: string;
  type: 'preventive' | 'corrective' | 'emergency';
  description?: string;
  cost?: number;
  performedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  nextMaintenance?: string;
}

export interface AssetMaintenance {
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceInterval?: number;
  maintenanceIntervalUnit: 'days' | 'weeks' | 'months' | 'years';
  maintenanceHistory: MaintenanceRecord[];
}

export interface AssetDocument {
  name: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
}

export interface Asset {
  _id: string;
  name: string;
  code: string;
  category: 'equipment' | 'vehicle' | 'building' | 'furniture' | 'electronics' | 'software' | 'other';
  type: 'owned' | 'leased' | 'rented';
  status: 'active' | 'inactive' | 'maintenance' | 'retired' | 'lost' | 'stolen';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  location: AssetLocation;
  specifications: AssetSpecifications;
  financial: AssetFinancial;
  maintenance: AssetMaintenance;
  documents: AssetDocument[];
  notes?: string;
  tags: string[];
  age: number;
  daysUntilMaintenance?: number;
  maintenanceOverdue: boolean;
  warrantyStatus: 'no_warranty' | 'active' | 'expired' | 'expiring_soon';
  createdAt: string;
  updatedAt: string;
}

export interface AssetStats {
  overview: {
    totalAssets: number;
    activeAssets: number;
    maintenanceAssets: number;
    retiredAssets: number;
    totalValue: number;
    totalPurchaseValue: number;
  };
  categoryStats: Array<{
    _id: string;
    count: number;
  }>;
  conditionStats: Array<{
    _id: string;
    count: number;
  }>;
  maintenanceDue: Asset[];
  warrantyExpiring: Asset[];
}

export interface AssetFormData {
  name: string;
  category: 'equipment' | 'vehicle' | 'building' | 'furniture' | 'electronics' | 'software' | 'other';
  type: 'owned' | 'leased' | 'rented';
  status: 'active' | 'inactive' | 'maintenance' | 'retired' | 'lost' | 'stolen';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  location: {
    building?: string;
    floor?: string;
    room?: string;
    department?: string;
    assignedTo?: string;
  };
  specifications: {
    brand?: string;
    model?: string;
    serialNumber?: string;
    manufacturer?: string;
    capacity?: string;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit: 'cm' | 'inch' | 'm';
    };
    weight?: {
      value?: number;
      unit: 'kg' | 'lb';
    };
  };
  financial: {
    purchasePrice?: number;
    currentValue?: number;
    depreciationRate?: number;
    purchaseDate?: string;
    warrantyExpiry?: string;
    insuranceExpiry?: string;
  };
  maintenance: {
    maintenanceInterval?: number;
    maintenanceIntervalUnit: 'days' | 'weeks' | 'months' | 'years';
    nextMaintenance?: string;
  };
  tags: string[];
  notes?: string;
}

export interface MaintenanceFormData {
  type: 'preventive' | 'corrective' | 'emergency';
  description?: string;
  cost?: number;
  nextMaintenance?: string;
} 