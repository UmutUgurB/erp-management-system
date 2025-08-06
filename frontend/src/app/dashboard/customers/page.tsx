'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  Building, 
  MapPin,
  TrendingUp,
  Calendar,
  Plus
} from 'lucide-react';
import { customerAPI } from '@/lib/api';
import { CustomerStats } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';
import CustomerList from '@/components/Customers/CustomerList';
import CustomerStatsOverview from '@/components/Customers/CustomerStatsOverview';
import CustomerForm from '@/components/Customers/CustomerForm';

export default function CustomersPage() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Müşteri istatistikleri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowCustomerForm(false);
    loadStats();
  };

  const canManageCustomers = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Müşteri Yönetimi</h1>
          <p className="text-muted-foreground">
            Müşteri bilgilerini ve etkileşimlerini yönetin
          </p>
        </div>
        {canManageCustomers && (
          <Button onClick={() => setShowCustomerForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Müşteri
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {!loading && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Aktif müşteriler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Müşteri</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Aktif durumda
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potansiyel</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.prospects}</div>
              <p className="text-xs text-muted-foreground">
                Potansiyel müşteriler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Son Etkileşim</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentInteractions.length}</div>
              <p className="text-xs text-muted-foreground">
                Son 10 etkileşim
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">
            <Users className="mr-2 h-4 w-4" />
            Müşteriler
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analitik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <CustomerList onRefresh={loadStats} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <CustomerStatsOverview />
        </TabsContent>
      </Tabs>

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <CustomerForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowCustomerForm(false)}
          />
        </div>
      )}
    </div>
  );
} 