export interface InvoiceItem {
  product: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  order?: {
    _id: string;
    orderNumber: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'GBP';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  notes?: string;
  terms?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  remainingAmount: number;
  daysOverdue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  paymentNumber: string;
  invoice?: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'GBP';
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  paymentDate: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  type: 'payment' | 'refund' | 'adjustment';
  notes?: string;
  processedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceStats {
  overview: {
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    overdueAmount: number;
  };
  statusStats: Array<{
    _id: string;
    count: number;
  }>;
  paymentStatusStats: Array<{
    _id: string;
    count: number;
  }>;
  overdueInvoices: Invoice[];
}

export interface InvoiceFormData {
  customer: string;
  order?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'GBP';
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  dueDate: string;
  notes?: string;
  terms?: string;
}

export interface PaymentFormData {
  invoice: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  paymentDate: string;
  reference?: string;
  notes?: string;
} 