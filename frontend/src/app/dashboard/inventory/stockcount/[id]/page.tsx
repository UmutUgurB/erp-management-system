'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Save,
  ClipboardList,
  AlertTriangle
} from 'lucide-react';
import { stockCountAPI } from '@/lib/api';
import { StockCount } from '@/types/inventory';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function StockCountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  
  const [stockCount, setStockCount] = useState<StockCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ actualQuantity: number; notes: string }>({
    actualQuantity: 0,
    notes: ''
  });

  const stockCountId = params.id as string;

  useEffect(() => {
    if (stockCountId) {
      loadStockCount();
    }
  }, [stockCountId]);

  const loadStockCount = async () => {
    try {
      setLoading(true);
      const response = await stockCountAPI.getStockCount(stockCountId);
      setStockCount(response.data);
    } catch (error) {
      console.error('Stok sayımı yüklenirken hata:', error);
      showNotification({
        type: 'error',
        title: 'Hata',
        message: 'Stok sayımı yüklenirken hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartCount = async () => {
    try {
      await stockCountAPI.startStockCount(stockCountId);
      showNotification({
        type: 'success',
        title: 'Başarılı',
        message: 'Stok sayımı başlatıldı'
      });
      loadStockCount();
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Hata',
        message: error.response?.data?.message || 'Stok sayımı başlatılırken hata oluştu'
      });
    }
  };

  const handleCompleteCount = async () => {
    try {
      await stockCountAPI.completeStockCount(stockCountId);
      showNotification({
        type: 'success',
        title: 'Başarılı',
        message: 'Stok sayımı tamamlandı'
      });
      loadStockCount();
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Hata',
        message: error.response?.data?.message || 'Stok sayımı tamamlanırken hata oluştu'
      });
    }
  };

  const handleCancelCount = async () => {
    try {
      await stockCountAPI.cancelStockCount(stockCountId);
      showNotification({
        type: 'success',
        title: 'Başarılı',
        message: 'Stok sayımı iptal edildi'
      });
      loadStockCount();
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Hata',
        message: error.response?.data?.message || 'Stok sayımı iptal edilirken hata oluştu'
      });
    }
  };

  const handleEditItem = (index: number) => {
    const item = stockCount?.items[index];
    if (item) {
      setEditingItem(index);
      setEditValues({
        actualQuantity: item.actualQuantity || 0,
        notes: item.notes || ''
      });
    }
  };

  const handleSaveItem = async () => {
    if (editingItem === null) return;

    try {
      setUpdating(true);
      await stockCountAPI.updateItemCount(stockCountId, editingItem, editValues);
      showNotification({
        type: 'success',
        title: 'Başarılı',
        message: 'Ürün sayımı güncellendi'
      });
      setEditingItem(null);
      loadStockCount();
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Hata',
        message: error.response?.data?.message || 'Ürün sayımı güncellenirken hata oluştu'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditValues({ actualQuantity: 0, notes: '' });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, text: 'Taslak', icon: ClipboardList },
      in_progress: { variant: 'default' as const, text: 'Devam Ediyor', icon: Play },
      completed: { variant: 'default' as const, text: 'Tamamlandı', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, text: 'İptal Edildi', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      variant: 'secondary' as const, 
      text: status, 
      icon: ClipboardList 
    };
    
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const canManageStockCount = user?.role === 'admin' || user?.role === 'manager';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!stockCount) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Stok sayımı bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{stockCount.title}</h1>
            <p className="text-muted-foreground">
              {stockCount.description || 'Stok sayım detayları'}
            </p>
          </div>
        </div>
        
        {canManageStockCount && (
          <div className="flex gap-2">
            {stockCount.status === 'draft' && (
              <Button onClick={handleStartCount}>
                <Play className="mr-2 h-4 w-4" />
                Başlat
              </Button>
            )}
            {stockCount.status === 'in_progress' && (
              <Button onClick={handleCompleteCount}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Tamamla
              </Button>
            )}
            {(stockCount.status === 'draft' || stockCount.status === 'in_progress') && (
              <Button variant="outline" onClick={handleCancelCount}>
                <XCircle className="mr-2 h-4 w-4" />
                İptal Et
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durum</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {getStatusBadge(stockCount.status)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İlerleme</CardTitle>
            <Progress className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockCount.progressPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {stockCount.countedItems} / {stockCount.totalItems} ürün
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Değer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stockCount.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Beklenen değer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fark Değeri</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stockCount.varianceValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Toplam fark
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>İlerleme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sayım İlerlemesi</span>
              <span>{stockCount.progressPercentage}%</span>
            </div>
            <Progress value={stockCount.progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sayılan: {stockCount.countedItems}</span>
              <span>Toplam: {stockCount.totalItems}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ürün Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Beklenen</TableHead>
                  <TableHead>Gerçek</TableHead>
                  <TableHead>Fark</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Notlar</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockCount.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.product.sku} - Stok: {item.product.stock}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.expectedQuantity}</div>
                    </TableCell>
                    <TableCell>
                      {editingItem === index ? (
                        <Input
                          type="number"
                          min="0"
                          value={editValues.actualQuantity}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            actualQuantity: parseInt(e.target.value) || 0
                          })}
                          className="w-20"
                        />
                      ) : (
                        <div className="font-medium">
                          {item.actualQuantity !== undefined ? item.actualQuantity : '-'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.variance !== undefined ? (
                        <Badge variant={item.variance === 0 ? 'default' : item.variance > 0 ? 'default' : 'destructive'}>
                          {item.variance > 0 ? '+' : ''}{item.variance}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {item.actualQuantity !== undefined ? (
                        <Badge variant={item.variance === 0 ? 'default' : 'destructive'}>
                          {item.variance === 0 ? 'Tamam' : 'Fark Var'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Bekliyor</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingItem === index ? (
                        <Input
                          value={editValues.notes}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            notes: e.target.value
                          })}
                          placeholder="Notlar..."
                          className="w-32"
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground max-w-32 truncate">
                          {item.notes || '-'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingItem === index ? (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={handleSaveItem} disabled={updating}>
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        stockCount.status === 'in_progress' && (
                          <Button size="sm" variant="outline" onClick={() => handleEditItem(index)}>
                            Düzenle
                          </Button>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sayım Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Tür</Label>
              <p className="text-sm text-muted-foreground">
                {stockCount.type === 'full' ? 'Tam Sayım' : 
                 stockCount.type === 'partial' ? 'Kısmi Sayım' : 'Döngüsel Sayım'}
              </p>
            </div>
            {stockCount.location && (
              <div>
                <Label className="text-sm font-medium">Konum</Label>
                <p className="text-sm text-muted-foreground">{stockCount.location}</p>
              </div>
            )}
            {stockCount.category && (
              <div>
                <Label className="text-sm font-medium">Kategori</Label>
                <p className="text-sm text-muted-foreground">{stockCount.category}</p>
              </div>
            )}
            {stockCount.scheduledDate && (
              <div>
                <Label className="text-sm font-medium">Planlanan Tarih</Label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(stockCount.scheduledDate), 'dd MMM yyyy', { locale: tr })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zaman Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Oluşturulma</Label>
              <p className="text-sm text-muted-foreground">
                {format(new Date(stockCount.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
              </p>
            </div>
            {stockCount.startDate && (
              <div>
                <Label className="text-sm font-medium">Başlangıç</Label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(stockCount.startDate), 'dd MMM yyyy HH:mm', { locale: tr })}
                </p>
              </div>
            )}
            {stockCount.endDate && (
              <div>
                <Label className="text-sm font-medium">Bitiş</Label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(stockCount.endDate), 'dd MMM yyyy HH:mm', { locale: tr })}
                </p>
              </div>
            )}
            {stockCount.notes && (
              <div>
                <Label className="text-sm font-medium">Notlar</Label>
                <p className="text-sm text-muted-foreground">{stockCount.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 