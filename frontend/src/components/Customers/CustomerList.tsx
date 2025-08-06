'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Edit, 
  Trash2,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { customerAPI } from '@/lib/api';
import { Customer } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface CustomerListProps {
  onRefresh?: () => void;
}

export default function CustomerList({ onRefresh }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
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
    loadCustomers();
  }, [filters, pagination.page]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getCustomers({
        page: pagination.page,
        limit: 20,
        ...filters
      });
      setCustomers(response.data.customers);
      setPagination({
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await customerAPI.deleteCustomer(customerId);
      onRefresh?.();
      loadCustomers();
    } catch (error) {
      console.error('Müşteri silinirken hata:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, text: 'Aktif' },
      inactive: { variant: 'secondary' as const, text: 'Pasif' },
      prospect: { variant: 'outline' as const, text: 'Potansiyel' },
      lead: { variant: 'outline' as const, text: 'Aday' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      variant: 'secondary' as const, 
      text: status 
    };
    
    return (
      <Badge variant={config.variant}>
        {config.text}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      individual: { variant: 'outline' as const, text: 'Bireysel' },
      corporate: { variant: 'default' as const, text: 'Kurumsal' },
      wholesale: { variant: 'secondary' as const, text: 'Toptan' },
      retail: { variant: 'outline' as const, text: 'Perakende' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { 
      variant: 'secondary' as const, 
      text: type 
    };
    
    return (
      <Badge variant={config.variant}>
        {config.text}
      </Badge>
    );
  };

  const canManageCustomers = user?.role === 'admin' || user?.role === 'manager';

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Müşteri Listesi</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Müşteri ara..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-8 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Müşteri bulunamadı</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Atanan</TableHead>
                  <TableHead>Son İletişim</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.company && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {customer.company}
                          </div>
                        )}
                        {customer.fullAddress && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.fullAddress}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(customer.status)}
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(customer.type)}
                    </TableCell>
                    <TableCell>
                      {customer.assignedTo ? (
                        <div className="text-sm">
                          <div className="font-medium">{customer.assignedTo.name}</div>
                          <div className="text-muted-foreground">{customer.assignedTo.email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Atanmamış</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.lastContact ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {format(new Date(customer.lastContact), 'dd MMM yyyy', { locale: tr })}
                          </div>
                          <div className="text-muted-foreground">
                            {format(new Date(customer.lastContact), 'HH:mm', { locale: tr })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/dashboard/customers/${customer._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManageCustomers && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => router.push(`/dashboard/customers/${customer._id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(customer._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Toplam {pagination.total} müşteri
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