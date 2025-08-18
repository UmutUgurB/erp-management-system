'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { financialAPI } from '@/lib/api';
import { Invoice, InvoiceStats } from '@/types/financial';

export default function FinancialPage() {
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await financialAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading financial stats:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
            Finansal Yönetim
          </h1>
          <p className="text-muted-foreground mt-2">
            Fatura yönetimi, ödeme takibi ve finansal analitik
          </p>
        </div>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Fatura
        </Button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Toplam Fatura</p>
              <p className="text-3xl font-bold">{stats?.overview.totalInvoices || 0}</p>
            </div>
            <div className="p-3 bg-blue-400 rounded-full">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-blue-100 text-sm">
              <span className="text-green-300">↗</span>
              <span className="ml-1">+15%</span>
              <span className="ml-2">geçen aya göre</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Toplam Tutar</p>
              <p className="text-3xl font-bold">
                {formatCurrency(stats?.overview.totalAmount || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-400 rounded-full">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-green-100 text-sm">
              <span className="text-green-300">↗</span>
              <span className="ml-1">+22%</span>
              <span className="ml-2">geçen aya göre</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Ödenen Tutar</p>
              <p className="text-3xl font-bold">
                {formatCurrency(stats?.overview.paidAmount || 0)}
              </p>
            </div>
            <div className="p-3 bg-emerald-400 rounded-full">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-emerald-100 text-sm">
              <span className="text-green-300">↗</span>
              <span className="ml-1">+18%</span>
              <span className="ml-2">geçen aya göre</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Bekleyen Tutar</p>
              <p className="text-3xl font-bold">
                {formatCurrency((stats?.overview.totalAmount || 0) - (stats?.overview.paidAmount || 0))}
              </p>
            </div>
            <div className="p-3 bg-orange-400 rounded-full">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-orange-100 text-sm">
              <span className="text-red-300">↘</span>
              <span className="ml-1">-5%</span>
              <span className="ml-2">geçen aya göre</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Insights */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Durumu Dağılımı</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Ödendi</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.overview.paidInvoices || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Beklemede</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.overview.pendingInvoices || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Gecikmiş</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.overview.overdueInvoices || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Gelir Trendi</h3>
            <div className="h-48 flex items-end justify-between space-x-2">
              {Array.from({ length: 6 }, (_, i) => {
                const month = new Date();
                month.setMonth(month.getMonth() - (5 - i));
                const monthRevenue = Math.floor(Math.random() * 50000) + 20000; // Mock data
                const maxRevenue = 70000;
                const height = (monthRevenue / maxRevenue) * 100;
                return (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg transition-all duration-300 hover:scale-110"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-500">
                      {month.toLocaleDateString('tr-TR', { month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Faturalar</TabsTrigger>
          <TabsTrigger value="payments">Ödemeler</TabsTrigger>
          <TabsTrigger value="overdue">Gecikmiş</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fatura Listesi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Fatura listesi burada görüntülenecek
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Takibi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Ödeme takibi burada görüntülenecek
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gecikmiş Ödemeler</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.overdueInvoices && stats.overdueInvoices.length > 0 ? (
                <div className="space-y-4">
                  {stats.overdueInvoices.map((invoice) => (
                    <div key={invoice._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.customer.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">
                          {formatCurrency(invoice.totalAmount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.daysOverdue} gün gecikmiş
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Gecikmiş ödeme bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fatura Durumu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.statusStats?.map((stat) => (
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
                <CardTitle>Ödeme Durumu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.paymentStatusStats?.map((stat) => (
                    <div key={stat._id} className="flex items-center justify-between">
                      <span className="text-sm">{stat._id}</span>
                      <Badge variant="secondary">{stat.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 