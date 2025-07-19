import { z } from 'zod';

// Product interface
export interface Product {
  _id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  supplier: string;
  profitMargin?: number;
  stockStatus?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Product form data (for create/update)
export interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  supplier: string;
  isActive: boolean;
}

// Categories (you can move this to a config file later)
export const PRODUCT_CATEGORIES = [
  'Elektronik',
  'Gıda',
  'Giyim',
  'Ev & Bahçe',
  'Sağlık & Güzellik',
  'Spor & Outdoor',
  'Otomotiv',
  'Kitap & Müzik',
  'Oyuncak',
  'Diğer'
] as const;

export const PRODUCT_UNITS = [
  'adet',
  'kg',
  'lt',
  'm',
  'm2',
  'm3',
  'kutu',
  'paket',
  'gr',
  'ml'
] as const;

// Validation schema using Zod
export const productFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Ürün adı en az 2 karakter olmalıdır')
    .max(100, 'Ürün adı en fazla 100 karakter olabilir'),
  
  description: z
    .string()
    .min(10, 'Açıklama en az 10 karakter olmalıdır')
    .max(500, 'Açıklama en fazla 500 karakter olabilir'),
  
  sku: z
    .string()
    .min(3, 'SKU en az 3 karakter olmalıdır')
    .max(20, 'SKU en fazla 20 karakter olabilir')
    .regex(/^[A-Z0-9-_]+$/, 'SKU sadece büyük harf, rakam, tire ve alt çizgi içerebilir'),
  
  category: z
    .enum(PRODUCT_CATEGORIES, {
      errorMap: () => ({ message: 'Geçerli bir kategori seçiniz' })
    }),
  
  price: z
    .number({
      required_error: 'Satış fiyatı gereklidir',
      invalid_type_error: 'Satış fiyatı geçerli bir sayı olmalıdır'
    })
    .positive('Satış fiyatı pozitif bir değer olmalıdır')
    .max(999999, 'Satış fiyatı çok yüksek'),
  
  cost: z
    .number({
      required_error: 'Maliyet fiyatı gereklidir',
      invalid_type_error: 'Maliyet fiyatı geçerli bir sayı olmalıdır'
    })
    .positive('Maliyet fiyatı pozitif bir değer olmalıdır')
    .max(999999, 'Maliyet fiyatı çok yüksek'),
  
  stock: z
    .number({
      required_error: 'Stok miktarı gereklidir',
      invalid_type_error: 'Stok miktarı geçerli bir sayı olmalıdır'
    })
    .min(0, 'Stok miktarı negatif olamaz')
    .max(999999, 'Stok miktarı çok yüksek'),
  
  minStock: z
    .number({
      required_error: 'Minimum stok gereklidir',
      invalid_type_error: 'Minimum stok geçerli bir sayı olmalıdır'
    })
    .min(0, 'Minimum stok negatif olamaz')
    .max(999999, 'Minimum stok çok yüksek'),
  
  unit: z
    .enum(PRODUCT_UNITS, {
      errorMap: () => ({ message: 'Geçerli bir birim seçiniz' })
    }),
  
  supplier: z
    .string()
    .min(2, 'Tedarikçi adı en az 2 karakter olmalıdır')
    .max(100, 'Tedarikçi adı en fazla 100 karakter olabilir'),
  
  isActive: z.boolean()
}).refine((data) => data.cost < data.price, {
  message: 'Satış fiyatı maliyet fiyatından yüksek olmalıdır',
  path: ['price']
});

export type ProductFormSchema = z.infer<typeof productFormSchema>; 