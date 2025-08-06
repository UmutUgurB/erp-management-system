'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Building, Wrench, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { assetAPI } from '@/lib/api';
import { Asset, AssetStats } from '@/types/asset';

export default function AssetsPage() {
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsResponse, assetsResponse] = await Promise.all([
        assetAPI.getStats(),
        assetAPI.getAssets()
      ]);
      setStats(statsResponse.data);
      setAssets(assetsResponse.data.assets || []);
    } catch (error) {
      console.error('Error loading asset data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'stolen': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Varlık Yönetimi</h1>
          <p className="text-muted-foreground">
            Varlık takibi, bakım planlaması ve varlık analitik
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Varlık
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Varlık</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.totalAssets || 0}</div>
            <p className="text-xs text-muted-foreground">
              Toplam varlık sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Varlıklar</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.overview.activeAssets || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktif varlıklar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bakımda</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.overview.maintenanceAssets || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Bakımda olan varlıklar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Değer</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats?.overview.totalValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Toplam varlık değeri
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Varlıklar</TabsTrigger>
          <TabsTrigger value="maintenance">Bakım</TabsTrigger>
          <TabsTrigger value="warranty">Garanti</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Varlık Listesi</CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length > 0 ? (
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{asset.name}</h3>
                          <Badge className={getStatusColor(asset.status)}>
                            {asset.status}
                          </Badge>
                          <Badge className={getConditionColor(asset.condition)}>
                            {asset.condition}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {asset.specifications.brand} {asset.specifications.model}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Kod: {asset.code}</span>
                          <span>Kategori: {asset.category}</span>
                          <span>Yaş: {asset.age} yıl</span>
                          {asset.location.assignedTo && (
                            <span>Atanan: {asset.location.assignedTo.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(asset.financial.currentValue || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {asset.daysUntilMaintenance !== null ? (
                            `${asset.daysUntilMaintenance} gün bakım`
                          ) : (
                            'Bakım planı yok'
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Varlık bulunamadı
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bakım Gerektiren Varlıklar</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.maintenanceDue && stats.maintenanceDue.length > 0 ? (
                <div className="space-y-4">
                  {stats.maintenanceDue.map((asset) => (
                    <div key={asset._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.specifications.brand} {asset.specifications.model}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">
                          {asset.maintenanceOverdue ? 'Gecikmiş' : 'Yaklaşıyor'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {asset.daysUntilMaintenance} gün
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Bakım gerektiren varlık bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warranty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Garanti Süresi Dolan Varlıklar</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.warrantyExpiring && stats.warrantyExpiring.length > 0 ? (
                <div className="space-y-4">
                  {stats.warrantyExpiring.map((asset) => (
                    <div key={asset._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.specifications.brand} {asset.specifications.model}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-orange-600">
                          {asset.warrantyStatus === 'expired' ? 'Süresi Dolmuş' : 'Yakında Dolacak'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {asset.financial.warrantyExpiry}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Garanti süresi dolan varlık bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Varlık Kategorileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.categoryStats?.map((stat) => (
                    <div key={stat._id} className="flex items-center justify-between">
                      <span className="text-sm">{stat._id}</span>
                      <Badge variant="secondary">{stat.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Varlık Durumu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.conditionStats?.map((stat) => (
                    <div key={stat._id} className="flex items-center justify-between">
                      <span className="text-sm">{stat._id}</span>
                      <Badge variant="secondary">{stat.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Değer Analizi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium">Toplam Satın Alma Değeri</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats?.overview.totalPurchaseValue || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Mevcut Toplam Değer</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats?.overview.totalValue || 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 