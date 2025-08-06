'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { customerAPI } from '@/lib/api';
import { CustomerStats } from '@/types/customer';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function CustomerStatsOverview() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">İstatistik bulunamadı</p>
        </CardContent>
      </Card>
    );
  }

  const statusData = stats.stats.map(item => ({
    name: item._id === 'active' ? 'Aktif' : 
          item._id === 'inactive' ? 'Pasif' : 
          item._id === 'prospect' ? 'Potansiyel' : 
          item._id === 'lead' ? 'Aday' : item._id,
    value: item.count
  }));

  const typeData = stats.typeStats.map(item => ({
    name: item._id === 'individual' ? 'Bireysel' : 
          item._id === 'corporate' ? 'Kurumsal' : 
          item._id === 'wholesale' ? 'Toptan' : 
          item._id === 'retail' ? 'Perakende' : item._id,
    value: item.count
  }));

  return (
    <div className="space-y-6">
      {/* Özet Kartları */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Müşteri Durumu Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Müşteri Türü Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Genel İstatistikler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Toplam Müşteri:</span>
              <span className="font-bold">{stats.totalCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span>Aktif Müşteri:</span>
              <span className="font-bold text-green-600">{stats.activeCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span>Potansiyel:</span>
              <span className="font-bold text-blue-600">{stats.prospects}</span>
            </div>
            <div className="flex justify-between">
              <span>Aktiflik Oranı:</span>
              <span className="font-bold">
                {stats.totalCustomers > 0 ? ((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Son Etkileşimler */}
      <Card>
        <CardHeader>
          <CardTitle>Son Etkileşimler</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentInteractions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Henüz etkileşim bulunmuyor</p>
          ) : (
            <div className="space-y-4">
              {stats.recentInteractions.map((interaction) => (
                <div key={interaction._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {typeof interaction.customer === 'string' ? interaction.customer : interaction.customer.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {interaction.subject} - {interaction.typeText}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {interaction.performedBy.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(interaction.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 