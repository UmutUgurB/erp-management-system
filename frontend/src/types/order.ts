import { z } from 'zod';

// Order item interface
export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  availableStock: number;
}

// Customer interface
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxNumber?: string;
  isActive: boolean;
}

// Order interface
export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Order status enum
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

// Payment status enum
export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'partial' 
  | 'refunded';

// Payment method enum
export type PaymentMethod = 
  | 'cash' 
  | 'credit_card' 
  | 'bank_transfer' 
  | 'check' 
  | 'online';

// Order form data (for create/update)
export interface OrderFormData {
  customerId: string;
  customerName: string;
  items: OrderItem[];
  taxRate: number;
  discountRate: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// Order status options
export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Beklemede', color: 'yellow' },
  { value: 'confirmed', label: 'Onaylandı', color: 'blue' },
  { value: 'processing', label: 'İşleniyor', color: 'purple' },
  { value: 'shipped', label: 'Kargoda', color: 'indigo' },
  { value: 'delivered', label: 'Teslim Edildi', color: 'green' },
  { value: 'cancelled', label: 'İptal Edildi', color: 'red' }
] as const;

// Payment status options
export const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Beklemede', color: 'yellow' },
  { value: 'paid', label: 'Ödendi', color: 'green' },
  { value: 'partial', label: 'Kısmi Ödeme', color: 'orange' },
  { value: 'refunded', label: 'İade Edildi', color: 'red' }
] as const;

// Payment method options
export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Nakit' },
  { value: 'credit_card', label: 'Kredi Kartı' },
  { value: 'bank_transfer', label: 'Banka Transferi' },
  { value: 'check', label: 'Çek' },
  { value: 'online', label: 'Online Ödeme' }
] as const;

// Validation schema for order items
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Ürün seçilmelidir'),
  productName: z.string().min(1, 'Ürün adı gereklidir'),
  sku: z.string().min(1, 'SKU gereklidir'),
  quantity: z
    .number()
    .min(1, 'Miktar en az 1 olmalıdır')
    .max(999999, 'Miktar çok yüksek'),
  unitPrice: z
    .number()
    .min(0, 'Birim fiyat negatif olamaz')
    .max(999999, 'Birim fiyat çok yüksek'),
  totalPrice: z
    .number()
    .min(0, 'Toplam fiyat negatif olamaz'),
  availableStock: z.number().min(0, 'Stok miktarı negatif olamaz')
});

// Validation schema for order form
export const orderFormSchema = z.object({
  customerId: z.string().min(1, 'Müşteri seçilmelidir'),
  customerName: z.string().min(2, 'Müşteri adı en az 2 karakter olmalıdır'),
  items: z
    .array(orderItemSchema)
    .min(1, 'En az bir ürün eklenmelidir')
    .max(50, 'En fazla 50 ürün eklenebilir'),
  taxRate: z
    .number()
    .min(0, 'Vergi oranı negatif olamaz')
    .max(100, 'Vergi oranı %100\'den fazla olamaz'),
  discountRate: z
    .number()
    .min(0, 'İndirim oranı negatif olamaz')
    .max(100, 'İndirim oranı %100\'den fazla olamaz'),
  paymentMethod: z.enum(['cash', 'credit_card', 'bank_transfer', 'check', 'online'], {
    errorMap: () => ({ message: 'Geçerli bir ödeme yöntemi seçiniz' })
  }),
  notes: z.string().max(500, 'Notlar en fazla 500 karakter olabilir').optional()
}).refine((data) => {
  // Check if discount rate is not greater than 100%
  return data.discountRate <= 100;
}, {
  message: 'İndirim oranı %100\'den fazla olamaz',
  path: ['discountRate']
});

export type OrderFormSchema = z.infer<typeof orderFormSchema>;

// Helper functions for order calculations
export const calculateOrderTotals = (items: OrderItem[], taxRate: number, discountRate: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const discountAmount = (subtotal * discountRate) / 100;
  const totalAmount = subtotal + taxAmount - discountAmount;

  return {
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount
  };
};

// Helper function to generate order number
export const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `ORD-${year}${month}${day}-${random}`;
}; 