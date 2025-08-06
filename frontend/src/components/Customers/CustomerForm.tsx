'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customerAPI } from '@/lib/api';
import { CustomerFormData } from '@/types/customer';
import { useNotification } from '@/context/NotificationContext';
import { X, User, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const customerSchema = z.object({
  name: z.string().min(1, 'Müşteri adı gerekli'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  phone: z.string().min(1, 'Telefon numarası gerekli'),
  company: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  type: z.enum(['individual', 'corporate', 'wholesale', 'retail']),
  status: z.enum(['active', 'inactive', 'prospect', 'lead']),
  source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'other']),
  tags: z.array(z.string()),
  notes: z.string().optional(),
  creditLimit: z.number().min(0, 'Kredi limiti 0\'dan büyük olmalıdır'),
  paymentTerms: z.enum(['immediate', 'net_15', 'net_30', 'net_60', 'net_90']),
  taxNumber: z.string().optional(),
  contactPerson: z.object({
    name: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    position: z.string().optional(),
  }).optional(),
  assignedTo: z.string().optional(),
  nextFollowUp: z.string().optional(),
});

interface CustomerFormProps {
  customer?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer || {
      type: 'individual',
      status: 'active',
      source: 'other',
      tags: [],
      creditLimit: 0,
      paymentTerms: 'net_30',
      address: {},
      contactPerson: {}
    }
  });

  const watchedTags = watch('tags') || [];

  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      setValue('tags', [...watchedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setLoading(true);
      
      if (customer) {
        await customerAPI.updateCustomer(customer._id, data);
        showNotification({
          type: 'success',
          title: 'Başarılı',
          message: 'Müşteri başarıyla güncellendi'
        });
      } else {
        await customerAPI.createCustomer(data);
        showNotification({
          type: 'success',
          title: 'Başarılı',
          message: 'Müşteri başarıyla oluşturuldu'
        });
      }
      
      reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Müşteri kaydedilirken hata:', error);
      showNotification({
        type: 'error',
        title: 'Hata',
        message: error.response?.data?.message || 'Müşteri kaydedilirken hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {customer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
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
          {/* Temel Bilgiler */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Müşteri Adı *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Müşteri adı"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="E-posta adresi"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Telefon numarası"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Şirket</Label>
              <Input
                id="company"
                {...register('company')}
                placeholder="Şirket adı"
              />
              {errors.company && (
                <p className="text-sm text-red-600">{errors.company.message}</p>
              )}
            </div>
          </div>

          {/* Adres Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Adres Bilgileri</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="street">Sokak</Label>
                <Input
                  id="street"
                  {...register('address.street')}
                  placeholder="Sokak adresi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Şehir</Label>
                <Input
                  id="city"
                  {...register('address.city')}
                  placeholder="Şehir"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">İl/İlçe</Label>
                <Input
                  id="state"
                  {...register('address.state')}
                  placeholder="İl/İlçe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">Posta Kodu</Label>
                <Input
                  id="zipCode"
                  {...register('address.zipCode')}
                  placeholder="Posta kodu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Ülke</Label>
                <Input
                  id="country"
                  {...register('address.country')}
                  placeholder="Ülke"
                  defaultValue="Türkiye"
                />
              </div>
            </div>
          </div>

          {/* Müşteri Özellikleri */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="type">Müşteri Türü *</Label>
              <Select onValueChange={(value) => setValue('type', value as any)} defaultValue={watch('type')}>
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri türü seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Bireysel</SelectItem>
                  <SelectItem value="corporate">Kurumsal</SelectItem>
                  <SelectItem value="wholesale">Toptan</SelectItem>
                  <SelectItem value="retail">Perakende</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Durum *</Label>
              <Select onValueChange={(value) => setValue('status', value as any)} defaultValue={watch('status')}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                  <SelectItem value="prospect">Potansiyel</SelectItem>
                  <SelectItem value="lead">Aday</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Kaynak *</Label>
              <Select onValueChange={(value) => setValue('source', value as any)} defaultValue={watch('source')}>
                <SelectTrigger>
                  <SelectValue placeholder="Kaynak seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Web Sitesi</SelectItem>
                  <SelectItem value="referral">Referans</SelectItem>
                  <SelectItem value="social_media">Sosyal Medya</SelectItem>
                  <SelectItem value="advertisement">Reklam</SelectItem>
                  <SelectItem value="cold_call">Soğuk Arama</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
              {errors.source && (
                <p className="text-sm text-red-600">{errors.source.message}</p>
              )}
            </div>
          </div>

          {/* Finansal Bilgiler */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="creditLimit">Kredi Limiti</Label>
              <Input
                id="creditLimit"
                type="number"
                step="0.01"
                min="0"
                {...register('creditLimit', { valueAsNumber: true })}
                placeholder="Kredi limiti"
              />
              {errors.creditLimit && (
                <p className="text-sm text-red-600">{errors.creditLimit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Ödeme Koşulları *</Label>
              <Select onValueChange={(value) => setValue('paymentTerms', value as any)} defaultValue={watch('paymentTerms')}>
                <SelectTrigger>
                  <SelectValue placeholder="Ödeme koşulları seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Peşin</SelectItem>
                  <SelectItem value="net_15">15 Gün</SelectItem>
                  <SelectItem value="net_30">30 Gün</SelectItem>
                  <SelectItem value="net_60">60 Gün</SelectItem>
                  <SelectItem value="net_90">90 Gün</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentTerms && (
                <p className="text-sm text-red-600">{errors.paymentTerms.message}</p>
              )}
            </div>
          </div>

          {/* Etiketler */}
          <div className="space-y-2">
            <Label>Etiketler</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Yeni etiket ekle"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedTags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notlar */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Müşteri hakkında notlar..."
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : (customer ? 'Güncelle' : 'Oluştur')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 