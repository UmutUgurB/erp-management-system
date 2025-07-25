'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  ArrowUpDown,
  Package,
  ArrowUp,
  ArrowDown,
  Move,
  Settings
} from 'lucide-react';
import { inventoryAPI } from '@/lib/api';
import { InventoryTransaction } from '@/types/inventory';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function InventoryTransactions() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    reason: '',
    search: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    loadTransactions();
  }, [filters, pagination.page]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: 20
      };
      
      const response = await inventoryAPI.getTransactions(params);
      setTransactions(response.data.transactions);
      setPagination({
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('İşlemler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'out':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <Move className="h-4 w-4 text-blue-600" />;
      case 'adjustment':
        return <Settings className="h-4 w-4 text-orange-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'in':
        return 'Giriş';
      case 'out':
        return 'Çıkış';
      case 'transfer':
        return 'Transfer';
      case 'adjustment':
        return 'Düzeltme';
      case 'count':
        return 'Sayım';
      default:
        return type;
    }
  };

  const getReasonText = (reason: string) => {
    const reasonMap: Record<string, string> = {
      purchase: 'Satın Alma',
      sale: 'Satış',
      return: 'İade',
      damage: 'Hasar',
      expiry: 'Son Kullanma',
      transfer: 'Transfer',
      count: 'Sayım',
      adjustment: 'Düzeltme',
      theft: 'Hırsızlık',
      other: 'Diğer'
    };
    return reasonMap[reason] || reason;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Bekliyor' },
      approved: { variant: 'default' as const, text: 'Onaylandı' },
      rejected: { variant: 'destructive' as const, text: 'Reddedildi' },
      completed: { variant: 'default' as const, text: 'Tamamlandı' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, text: status };
    
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Envanter İşlemleri
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ara..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="İşlem Türü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              <SelectItem value="in">Giriş</SelectItem>
              <SelectItem value="out">Çıkış</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="adjustment">Düzeltme</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.reason} onValueChange={(value) => setFilters({ ...filters, reason: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Sebep" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              <SelectItem value="purchase">Satın Alma</SelectItem>
              <SelectItem value="sale">Satış</SelectItem>
              <SelectItem value="return">İade</SelectItem>
              <SelectItem value="damage">Hasar</SelectItem>
              <SelectItem value="expiry">Son Kullanma</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="adjustment">Düzeltme</SelectItem>
              <SelectItem value="theft">Hırsızlık</SelectItem>
              <SelectItem value="other">Diğer</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            placeholder="Başlangıç"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />

          <Input
            type="date"
            placeholder="Bitiş"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />

          <Button 
            variant="outline" 
            onClick={() => setFilters({ type: '', reason: '', search: '', startDate: '', endDate: '' })}
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
                <TableHead>İşlem</TableHead>
                <TableHead>Ürün</TableHead>
                <TableHead>Miktar</TableHead>
                <TableHead>Sebep</TableHead>
                <TableHead>Referans</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemi Yapan</TableHead>
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
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    İşlem bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className="font-medium">{getTypeText(transaction.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.product.name}</div>
                        <div className="text-sm text-muted-foreground">{transaction.product.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{transaction.quantity}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.previousStock} → {transaction.newStock}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getReasonText(transaction.reason)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.reference}</div>
                        <div className="text-sm text-muted-foreground">{transaction.referenceNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{transaction.performedBy.name}</div>
                        <div className="text-muted-foreground">{transaction.performedBy.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(transaction.createdAt), 'dd MMM yyyy', { locale: tr })}
                        <div className="text-muted-foreground">
                          {format(new Date(transaction.createdAt), 'HH:mm')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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
              Toplam {pagination.total} işlem
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