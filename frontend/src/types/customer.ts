export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  fullAddress?: string;
  type: 'individual' | 'corporate' | 'wholesale' | 'retail';
  typeText?: string;
  status: 'active' | 'inactive' | 'prospect' | 'lead';
  statusText?: string;
  source: 'website' | 'referral' | 'social_media' | 'advertisement' | 'cold_call' | 'other';
  tags: string[];
  notes?: string;
  creditLimit: number;
  currentBalance: number;
  paymentTerms: 'immediate' | 'net_15' | 'net_30' | 'net_60' | 'net_90';
  taxNumber?: string;
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  lastContact?: string;
  nextFollowUp?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInteraction {
  _id: string;
  customer: string | Customer;
  type: 'call' | 'email' | 'meeting' | 'visit' | 'quote' | 'order' | 'complaint' | 'follow_up' | 'other';
  typeText?: string;
  subject: string;
  description?: string;
  outcome: 'positive' | 'negative' | 'neutral' | 'pending';
  outcomeText?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priorityText?: string;
  duration?: number;
  scheduledDate?: string;
  completedDate?: string;
  nextAction?: string;
  nextActionDate?: string;
  attachments: {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimeType: string;
  }[];
  tags: string[];
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  isCompleted: boolean;
  status?: string;
  statusText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  stats: {
    _id: string;
    count: number;
  }[];
  typeStats: {
    _id: string;
    count: number;
  }[];
  totalCustomers: number;
  activeCustomers: number;
  prospects: number;
  recentInteractions: CustomerInteraction[];
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  type: 'individual' | 'corporate' | 'wholesale' | 'retail';
  status: 'active' | 'inactive' | 'prospect' | 'lead';
  source: 'website' | 'referral' | 'social_media' | 'advertisement' | 'cold_call' | 'other';
  tags: string[];
  notes?: string;
  creditLimit: number;
  paymentTerms: 'immediate' | 'net_15' | 'net_30' | 'net_60' | 'net_90';
  taxNumber?: string;
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
  };
  assignedTo?: string;
  nextFollowUp?: string;
}

export interface CustomerInteractionFormData {
  type: 'call' | 'email' | 'meeting' | 'visit' | 'quote' | 'order' | 'complaint' | 'follow_up' | 'other';
  subject: string;
  description?: string;
  outcome: 'positive' | 'negative' | 'neutral' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  duration?: number;
  scheduledDate?: string;
  nextAction?: string;
  nextActionDate?: string;
  tags: string[];
} 