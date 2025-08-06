'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Webhook, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

const availableEvents = [
  { value: 'user.created', label: 'Kullanıcı Oluşturuldu' },
  { value: 'user.updated', label: 'Kullanıcı Güncellendi' },
  { value: 'order.created', label: 'Sipariş Oluşturuldu' },
  { value: 'order.updated', label: 'Sipariş Güncellendi' },
  { value: 'order.completed', label: 'Sipariş Tamamlandı' },
  { value: 'product.low_stock', label: 'Düşük Stok Uyarısı' },
  { value: 'payment.received', label: 'Ödeme Alındı' },
  { value: 'invoice.sent', label: 'Fatura Gönderildi' },
  { value: 'customer.created', label: 'Müşteri Oluşturuldu' },
  { value: 'inventory.updated', label: 'Envanter Güncellendi' },
];

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    // Mock data - in real app, this would come from your API
    const mockWebhooks: WebhookConfig[] = [
      {
        id: '1',
        name: 'CRM Entegrasyonu',
        url: 'https://crm.example.com/webhook',
        events: ['customer.created', 'order.completed'],
        isActive: true,
        secret: 'whsec_abc123',
        lastTriggered: '2024-01-15T10:30:00Z',
        successCount: 45,
        failureCount: 2,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Slack Bildirimleri',
        url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
        events: ['product.low_stock', 'payment.received'],
        isActive: true,
        secret: 'whsec_def456',
        lastTriggered: '2024-01-15T09:15:00Z',
        successCount: 23,
        failureCount: 0,
        createdAt: '2024-01-05T00:00:00Z',
      },
    ];
    setWebhooks(mockWebhooks);
  };

  const handleCreateWebhook = () => {
    setEditingWebhook(null);
    setFormData({ name: '', url: '', events: [] });
    setShowForm(true);
  };

  const handleEditWebhook = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
    });
    setShowForm(true);
  };

  const handleSaveWebhook = async () => {
    if (!formData.name || !formData.url || formData.events.length === 0) {
      addNotification('error', 'Hata!', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingWebhook) {
        // Update existing webhook
        setWebhooks(prev => prev.map(wh => 
          wh.id === editingWebhook.id 
            ? { ...wh, ...formData }
            : wh
        ));
        addNotification('success', 'Başarılı!', 'Webhook başarıyla güncellendi.');
      } else {
        // Create new webhook
        const newWebhook: WebhookConfig = {
          id: Date.now().toString(),
          name: formData.name,
          url: formData.url,
          events: formData.events,
          isActive: true,
          secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
          successCount: 0,
          failureCount: 0,
          createdAt: new Date().toISOString(),
        };
        setWebhooks(prev => [...prev, newWebhook]);
        addNotification('success', 'Başarılı!', 'Webhook başarıyla oluşturuldu.');
      }

      setShowForm(false);
      setEditingWebhook(null);
      setFormData({ name: '', url: '', events: [] });
    } catch (error) {
      addNotification('error', 'Hata!', 'Webhook kaydedilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Bu webhook\'u silmek istediğinizden emin misiniz?')) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setWebhooks(prev => prev.filter(wh => wh.id !== id));
      addNotification('success', 'Başarılı!', 'Webhook başarıyla silindi.');
    } catch (error) {
      addNotification('error', 'Hata!', 'Webhook silinirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWebhook = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setWebhooks(prev => prev.map(wh => 
        wh.id === id ? { ...wh, isActive: !wh.isActive } : wh
      ));
      
      const webhook = webhooks.find(wh => wh.id === id);
      addNotification(
        'success', 
        'Başarılı!', 
        `Webhook ${webhook?.isActive ? 'devre dışı' : 'etkinleştirildi'}.`
      );
    } catch (error) {
      addNotification('error', 'Hata!', 'Webhook durumu değiştirilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    addNotification('success', 'Kopyalandı!', 'Webhook URL\'si panoya kopyalandı.');
  };

  const getEventLabel = (eventValue: string) => {
    const event = availableEvents.find(e => e.value === eventValue);
    return event?.label || eventValue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Webhook Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Harici sistemlerle entegrasyon için webhook'ları yönetin
          </p>
        </div>
        <Button onClick={handleCreateWebhook}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Webhook
        </Button>
      </div>

      {/* Webhook Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {editingWebhook ? 'Webhook Düzenle' : 'Yeni Webhook'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Webhook Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder="Örn: CRM Entegrasyonu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder="https://example.com/webhook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Olaylar
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableEvents.map((event) => (
                    <label key={event.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.events.includes(event.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, events: [...formData.events, event.value] });
                          } else {
                            setFormData({ ...formData, events: formData.events.filter(ev => ev !== event.value) });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  İptal
                </Button>
                <Button onClick={handleSaveWebhook} disabled={isLoading}>
                  {isLoading ? 'Kaydediliyor...' : (editingWebhook ? 'Güncelle' : 'Oluştur')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Webhook List */}
      <div className="grid gap-4">
        {webhooks.map((webhook) => (
          <motion.div
            key={webhook.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {webhook.name}
                  </h3>
                  <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                    {webhook.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2 mb-3">
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {webhook.url}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => copyWebhookUrl(webhook.url)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {webhook.events.map((event) => (
                    <Badge key={event} variant="outline" className="text-xs">
                      {getEventLabel(event)}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{webhook.successCount} başarılı</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>{webhook.failureCount} başarısız</span>
                  </div>
                  {webhook.lastTriggered && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Son: {new Date(webhook.lastTriggered).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleWebhook(webhook.id)}
                  disabled={isLoading}
                >
                  <Zap className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditWebhook(webhook)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteWebhook(webhook.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {webhooks.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Henüz webhook yok
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Harici sistemlerle entegrasyon için webhook oluşturun
          </p>
          <Button onClick={handleCreateWebhook}>
            <Plus className="h-4 w-4 mr-2" />
            İlk Webhook'u Oluştur
          </Button>
        </div>
      )}
    </div>
  );
} 