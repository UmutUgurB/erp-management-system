'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  AlertTriangle,
  Package,
  Eye,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
}

export default function StockAlerts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadLowStockProducts();
  }, []);

  const loadLowStockProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts({ stockStatus: 'low', limit: 50 });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Düşük stok ürünleri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) {
      return { status: 'out', text: 'Stok Dışı', variant: 'destructive' as const };
    } else if (stock <= minStock) {
      return { status: 'low', text: 'Düşük Stok', variant: 'default' as const };
    } else {
      return { status: 'ok', text: 'Normal', variant: 'secondary' as const };
    }
  };

  const getStockPercentage = (stock: number, minStock: number) => {
    if (minStock === 0) return 100;
    return Math.min((stock / minStock) * 100, 100);
  };

  const getStockValue = (stock: number, cost: number) => {
    return stock * cost;
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

  const outOfStockProducts = products.filter(p => p.stock === 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Uyarı</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Düşük stok ürünleri
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Dışı</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Stokta olmayan ürünler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Düşük Stok</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Minimum stok altında
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Stok Uyarıları
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Düşük stok uyarısı bulunmuyor</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead>Stok Durumu</TableHead>
                    <TableHead>Mevcut Stok</TableHead>
                    <TableHead>Minimum Stok</TableHead>
                    <TableHead>Stok Oranı</TableHead>
                    <TableHead>Stok Değeri</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.stock, product.minStock);
                    const stockPercentage = getStockPercentage(product.stock, product.minStock);
                    const stockValue = getStockValue(product.stock, product.cost);

                    return (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.sku} - {product.category}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{product.stock}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">{product.minStock}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  stockPercentage < 25 ? 'bg-red-500' :
                                  stockPercentage < 50 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${stockPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {stockPercentage.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">₺{stockValue.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => router.push(`/dashboard/products/${product._id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push('/dashboard/inventory')}
                            >
                              Stok Girişi
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Öneriler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {outOfStockProducts.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <h4 className="font-medium text-red-800 dark:text-red-200">Acil Stok Girişi Gerekli</h4>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">
                {outOfStockProducts.length} ürün stokta bulunmuyor. Bu ürünler için acil stok girişi yapılmalıdır.
              </p>
            </div>
          )}

          {lowStockProducts.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Stok Takibi Gerekli</h4>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {lowStockProducts.length} ürün minimum stok seviyesinin altında. Bu ürünlerin stok durumu yakından takip edilmelidir.
              </p>
            </div>
          )}

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Genel Öneriler</h4>
            </div>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Düzenli stok sayımı yaparak envanter doğruluğunu sağlayın</li>
              <li>• Minimum stok seviyelerini ürün satış hızına göre ayarlayın</li>
              <li>• Tedarikçilerle iletişimi güçlü tutarak stok kesintilerini önleyin</li>
              <li>• Stok maliyetlerini optimize etmek için ABC analizi yapın</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 