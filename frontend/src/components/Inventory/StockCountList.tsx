'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Search, 
  Filter, 
  Eye, 
  Play,
  CheckCircle,
  XCircle,
  ClipboardList,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { stockCountAPI } from '@/lib/api';
import { StockCount } from '@/types/inventory';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

export default function StockCountList() {
  const [stockCounts, setStockCounts] = useState<StockCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadStockCounts();
  }, [filters, pagination.page]);

  const loadStockCounts = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: 10
      };
      
      const response = await stockCountAPI.getStockCounts(params);
      setStockCounts(response.data.stockCounts);
      setPagination({
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Stok sayımları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
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

  const getTypeText = (type: string) => {
    switch (type) {
      case 'full':
        return 'Tam Sayım';
      case 'partial':
        return 'Kısmi Sayım';
      case 'cycle':
        return 'Döngüsel Sayım';
      default:
        return type;
    }
  };

  const canManageStockCounts = user?.role === 'admin' || user?.role === 'manager';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Stok Sayımları
          </CardTitle>
          {canManageStockCounts && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Sayım
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ara..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              <SelectItem value="draft">Taslak</SelectItem>
              <SelectItem value="in_progress">Devam Ediyor</SelectItem>
              <SelectItem value="completed">Tamamlandı</SelectItem>
              <SelectItem value="cancelled">İptal Edildi</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              <SelectItem value="full">Tam Sayım</SelectItem>
              <SelectItem value="partial">Kısmi Sayım</SelectItem>
              <SelectItem value="cycle">Döngüsel Sayım</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setFilters({ status: '', type: '', search: '' })}
          >
            <Filter className="h-4 w-4 mr-2" />
            Temizle
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İlerleme</TableHead>
                <TableHead>Ürün Sayısı</TableHead>
                <TableHead>Toplam Değer</TableHead>
                <TableHead>Oluşturan</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : stockCounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Stok sayımı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                stockCounts.map((stockCount) => (
                  <TableRow key={stockCount._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{stockCount.title}</div>
                        {stockCount.description && (
                          <div className="text-sm text-muted-foreground">{stockCount.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeText(stockCount.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(stockCount.status)}
                    </TableCell>
                    <TableCell>
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{stockCount.progressPercentage}%</span>
                          <span className="text-sm text-muted-foreground">
                            {stockCount.countedItems}/{stockCount.totalItems}
                          </span>
                        </div>
                        <Progress value={stockCount.progressPercentage} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{stockCount.totalItems}</div>
                      <div className="text-sm text-muted-foreground">
                        Sayılan: {stockCount.countedItems}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₺{stockCount.totalValue.toLocaleString()}</div>
                      {stockCount.varianceValue > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Fark: ₺{stockCount.varianceValue.toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{stockCount.createdBy.name}</div>
                        <div className="text-muted-foreground">{stockCount.createdBy.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(stockCount.createdAt), 'dd MMM yyyy', { locale: tr })}
                        <div className="text-muted-foreground">
                          {format(new Date(stockCount.createdAt), 'HH:mm')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/dashboard/inventory/stockcount/${stockCount._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManageStockCounts && stockCount.status === 'draft' && (
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Toplam {pagination.total} sayım
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              >
                Önceki
              </Button>
              <span className="flex items-center px-3 text-sm">
                Sayfa {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              >
                Sonraki
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 