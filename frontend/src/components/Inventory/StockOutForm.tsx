'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { inventoryAPI, productsAPI } from '@/lib/api';
import { StockOutFormData } from '@/types/inventory';
import { useNotification } from '@/context/NotificationContext';
import { X, Package, AlertTriangle } from 'lucide-react';

const stockOutSchema = z.object({
  productId: z.string().min(1, 'Ürün seçiniz'),
  quantity: z.number().min(1, 'Miktar 1\'den büyük olmalıdır'),
  reference: z.string().min(1, 'Referans giriniz'),
  referenceNumber: z.string().min(1, 'Referans numarası giriniz'),
  reason: z.string().min(1, 'Sebep seçiniz'),
  notes: z.string().optional(),
  location: z.string().min(1, 'Konum giriniz'),
});

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  cost: number;
}

interface StockOutFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StockOutForm({ onSuccess, onCancel }: StockOutFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<StockOutFormData>({
    resolver: zodResolver(stockOutSchema)
  });

  const watchedQuantity = watch('quantity') || 0;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getProducts({ limit: 100 });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      showNotification({
        type: 'error',
        title: 'Hata',
        message: 'Ürünler yüklenirken hata oluştu'
      });
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p._id === productId);
    setSelectedProduct(product || null);
    setValue('productId', productId);
  };

  const generateReferenceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `STK-OUT-${timestamp}-${random}`;
  };

  const onSubmit = async (data: StockOutFormData) => {
    try {
      setLoading(true);
      await inventoryAPI.stockOut(data);
      
      showNotification({
        type: 'success',
        title: 'Başarılı',
        message: 'Stok çıkışı başarıyla kaydedildi'
      });
      
      reset();
      setSelectedProduct(null);
      onSuccess?.();
    } catch (error: any) {
      console.error('Stok çıkışı hatası:', error);
      showNotification({
        type: 'error',
        title: 'Hata',
        message: error.response?.data?.message || 'Stok çıkışı kaydedilirken hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const isInsufficientStock = selectedProduct && watchedQuantity > selectedProduct.stock;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stok Çıkışı
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Ürün Seçimi */}
          <div className="space-y-2">
            <Label htmlFor="productId">Ürün *</Label>
            <Select onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="Ürün seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {product.sku} - Stok: {product.stock}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productId && (
              <p className="text-sm text-red-600">{errors.productId.message}</p>
            )}
          </div>

          {/* Seçili Ürün Bilgileri */}
          {selectedProduct && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">Ürün Bilgileri</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Mevcut Stok:</span>
                  <span className="ml-2 font-medium">{selectedProduct.stock}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Kategori:</span>
                  <span className="ml-2 font-medium">{selectedProduct.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Satış Fiyatı:</span>
                  <span className="ml-2 font-medium">₺{selectedProduct.price}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Maliyet:</span>
                  <span className="ml-2 font-medium">₺{selectedProduct.cost}</span>
                </div>
              </div>
            </div>
          )}

          {/* Miktar */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Miktar *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedProduct?.stock || undefined}
              {...register('quantity', { valueAsNumber: true })}
              placeholder="Çıkış miktarı"
            />
            {errors.quantity && (
              <p className="text-sm text-red-600">{errors.quantity.message}</p>
            )}
            {isInsufficientStock && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Yetersiz stok! Mevcut stok: {selectedProduct.stock}
              </div>
            )}
          </div>

          {/* Konum */}
          <div className="space-y-2">
            <Label htmlFor="location">Konum *</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Depo konumu"
            />
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Referans */}
          <div className="space-y-2">
            <Label htmlFor="reference">Referans *</Label>
            <Input
              id="reference"
              {...register('reference')}
              placeholder="Sipariş, satış vb."
            />
            {errors.reference && (
              <p className="text-sm text-red-600">{errors.reference.message}</p>
            )}
          </div>

          {/* Referans Numarası */}
          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Referans Numarası *</Label>
            <div className="flex gap-2">
              <Input
                id="referenceNumber"
                {...register('referenceNumber')}
                placeholder="Referans numarası"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setValue('referenceNumber', generateReferenceNumber())}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {errors.referenceNumber && (
              <p className="text-sm text-red-600">{errors.referenceNumber.message}</p>
            )}
          </div>

          {/* Sebep */}
          <div className="space-y-2">
            <Label htmlFor="reason">Sebep *</Label>
            <Select onValueChange={(value) => setValue('reason', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sebep seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">Satış</SelectItem>
                <SelectItem value="damage">Hasar</SelectItem>
                <SelectItem value="expiry">Son Kullanma</SelectItem>
                <SelectItem value="theft">Hırsızlık</SelectItem>
                <SelectItem value="adjustment">Düzeltme</SelectItem>
                <SelectItem value="other">Diğer</SelectItem>
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          {/* Notlar */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Ek notlar..."
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Butonlar */}
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                İptal
              </Button>
            )}
            <Button type="submit" disabled={loading || isInsufficientStock}>
              {loading ? 'Kaydediliyor...' : 'Stok Çıkışı Yap'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 