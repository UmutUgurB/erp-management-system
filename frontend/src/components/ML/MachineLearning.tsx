'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  Target,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  Cpu,
  Database,
  Network,
  FileText,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Calendar,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

interface MLData {
  models: Array<{
    id: string;
    name: string;
    type: 'prediction' | 'classification' | 'clustering' | 'recommendation';
    status: 'training' | 'active' | 'inactive' | 'error';
    accuracy: number;
    lastTraining: string;
    predictions: number;
    performance: {
      precision: number;
      recall: number;
      f1Score: number;
    };
  }>;
  predictions: Array<{
    id: string;
    model: string;
    type: 'sales' | 'inventory' | 'customer' | 'risk';
    input: any;
    output: any;
    confidence: number;
    timestamp: string;
    status: 'processing' | 'completed' | 'failed';
  }>;
  insights: Array<{
    id: string;
    type: 'trend' | 'anomaly' | 'pattern' | 'recommendation';
    title: string;
    description: string;
    confidence: number;
    impact: 'high' | 'medium' | 'low';
    timestamp: string;
    actions: string[];
  }>;
  performance: {
    totalPredictions: number;
    accuracyRate: number;
    activeModels: number;
    trainingJobs: number;
    averageResponseTime: number;
  };
  datasets: Array<{
    id: string;
    name: string;
    size: number;
    records: number;
    lastUpdated: string;
    status: 'ready' | 'processing' | 'error';
  }>;
}

export default function MachineLearning() {
  const [data, setData] = useState<MLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [isTraining, setIsTraining] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadMLData();
  }, []);

  const loadMLData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData: MLData = {
        models: [
          {
            id: '1',
            name: 'Satış Tahmin Modeli',
            type: 'prediction',
            status: 'active',
            accuracy: 94.2,
            lastTraining: '2 gün önce',
            predictions: 1250,
            performance: {
              precision: 0.92,
              recall: 0.89,
              f1Score: 0.90
            }
          },
          {
            id: '2',
            name: 'Müşteri Segmentasyonu',
            type: 'clustering',
            status: 'active',
            accuracy: 87.5,
            lastTraining: '1 hafta önce',
            predictions: 890,
            performance: {
              precision: 0.85,
              recall: 0.88,
              f1Score: 0.86
            }
          },
          {
            id: '3',
            name: 'Stok Optimizasyonu',
            type: 'recommendation',
            status: 'training',
            accuracy: 91.8,
            lastTraining: 'Şimdi',
            predictions: 650,
            performance: {
              precision: 0.89,
              recall: 0.93,
              f1Score: 0.91
            }
          }
        ],
        predictions: [
          {
            id: '1',
            model: 'Satış Tahmin Modeli',
            type: 'sales',
            input: { product: 'Laptop Pro', month: 'Ocak', region: 'İstanbul' },
            output: { predictedSales: 125, confidence: 0.94 },
            confidence: 0.94,
            timestamp: '5 dakika önce',
            status: 'completed'
          },
          {
            id: '2',
            model: 'Müşteri Segmentasyonu',
            type: 'customer',
            input: { customerId: 'CUST-001', purchaseHistory: [1500, 2300, 800] },
            output: { segment: 'Premium', lifetimeValue: 8500 },
            confidence: 0.87,
            timestamp: '15 dakika önce',
            status: 'completed'
          }
        ],
        insights: [
          {
            id: '1',
            type: 'trend',
            title: 'Yükselen Satış Trendi',
            description: 'Laptop kategorisinde %25 artış bekleniyor',
            confidence: 0.92,
            impact: 'high',
            timestamp: '1 saat önce',
            actions: ['Stok artır', 'Pazarlama kampanyası başlat']
          },
          {
            id: '2',
            type: 'anomaly',
            title: 'Anormal Stok Hareketi',
            description: 'Wireless Mouse stokunda beklenmeyen düşüş',
            confidence: 0.89,
            impact: 'medium',
            timestamp: '2 saat önce',
            actions: ['Stok kontrolü yap', 'Tedarikçi ile iletişime geç']
          },
          {
            id: '3',
            type: 'pattern',
            title: 'Müşteri Davranış Paterni',
            description: 'Premium müşteriler hafta sonu daha fazla alışveriş yapıyor',
            confidence: 0.85,
            impact: 'medium',
            timestamp: '3 saat önce',
            actions: ['Hafta sonu kampanyaları planla']
          }
        ],
        performance: {
          totalPredictions: 2790,
          accuracyRate: 91.2,
          activeModels: 3,
          trainingJobs: 1,
          averageResponseTime: 0.8
        },
        datasets: [
          {
            id: '1',
            name: 'Satış Verileri',
            size: 2.5,
            records: 50000,
            lastUpdated: '1 saat önce',
            status: 'ready'
          },
          {
            id: '2',
            name: 'Müşteri Profilleri',
            size: 1.8,
            records: 15000,
            lastUpdated: '3 saat önce',
            status: 'ready'
          },
          {
            id: '3',
            name: 'Stok Hareketleri',
            size: 3.2,
            records: 75000,
            lastUpdated: 'Şimdi',
            status: 'processing'
          }
        ]
      };
      
      setData(mockData);
    } catch (error) {
      addNotification('error', 'Hata!', 'ML verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="w-4 h-4" />;
      case 'classification': return <Target className="w-4 h-4" />;
      case 'clustering': return <Users className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'training': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      case 'pattern': return <BarChart3 className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const handleTrainModel = async (modelId: string) => {
    setIsTraining(true);
    try {
      addNotification('info', 'Eğitim Başlatıldı', 'Model eğitimi başlatıldı...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      addNotification('success', 'Eğitim Tamamlandı', 'Model başarıyla eğitildi.');
      loadMLData();
    } catch (error) {
      addNotification('error', 'Hata!', 'Model eğitimi başarısız oldu.');
    } finally {
      setIsTraining(false);
    }
  };

  const handlePrediction = async () => {
    try {
      addNotification('info', 'Tahmin', 'Yeni tahmin oluşturuluyor...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      addNotification('success', 'Başarılı!', 'Tahmin tamamlandı.');
      loadMLData();
    } catch (error) {
      addNotification('error', 'Hata!', 'Tahmin başarısız oldu.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">ML verileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Machine Learning</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Yapay zeka ve tahmin modelleri
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handlePrediction} variant="outline">
            <Brain className="w-4 h-4 mr-2" />
            Yeni Tahmin
          </Button>
          <Button onClick={loadMLData} variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cpu className="w-5 h-5 mr-2" />
            Performans Genel Bakış
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.performance.totalPredictions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Tahmin</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                %{data.performance.accuracyRate}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Doğruluk Oranı</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.performance.activeModels}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Aktif Model</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {data.performance.trainingJobs}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Eğitim İşi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.performance.averageResponseTime}s
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ort. Yanıt Süresi</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
          { id: 'models', label: 'Modeller', icon: Brain },
          { id: 'predictions', label: 'Tahminler', icon: Target },
          { id: 'insights', label: 'Öngörüler', icon: Lightbulb },
          { id: 'datasets', label: 'Veri Setleri', icon: Database }
        ].map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === view.id
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{view.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Aktif Modeller
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.models.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Toplam {data.models.length} model
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Son Tahminler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.predictions.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Son 24 saat
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                AI Öngörüleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.insights.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Yeni öngörüler
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Models */}
      {selectedView === 'models' && (
        <div className="space-y-4">
          {data.models.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getModelTypeIcon(model.type)}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {model.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Doğruluk: %{model.accuracy} • {model.predictions} tahmin
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getModelStatusColor(model.status)}>
                        {model.status === 'active' ? 'Aktif' :
                         model.status === 'training' ? 'Eğitimde' :
                         model.status === 'inactive' ? 'Pasif' : 'Hata'}
                      </Badge>
                      <Button
                        onClick={() => handleTrainModel(model.id)}
                        disabled={isTraining || model.status === 'training'}
                        variant="outline"
                        size="sm"
                      >
                        {model.status === 'training' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>Precision: {(model.performance.precision * 100).toFixed(1)}%</div>
                    <div>Recall: {(model.performance.recall * 100).toFixed(1)}%</div>
                    <div>F1-Score: {(model.performance.f1Score * 100).toFixed(1)}%</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Predictions */}
      {selectedView === 'predictions' && (
        <div className="space-y-4">
          {data.predictions.map((prediction, index) => (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Target className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {prediction.model}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {prediction.type === 'sales' ? 'Satış Tahmini' :
                           prediction.type === 'inventory' ? 'Stok Tahmini' :
                           prediction.type === 'customer' ? 'Müşteri Analizi' : 'Risk Değerlendirmesi'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        prediction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        prediction.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {prediction.status === 'completed' ? 'Tamamlandı' :
                         prediction.status === 'processing' ? 'İşleniyor' : 'Başarısız'}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          %{(prediction.confidence * 100).toFixed(1)} güven
                        </div>
                        <div className="text-xs text-gray-500">
                          {prediction.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Insights */}
      {selectedView === 'insights' && (
        <div className="space-y-4">
          {data.insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center">
                      {getInsightTypeIcon(insight.type)}
                      <span className="ml-2">{insight.title}</span>
                    </CardTitle>
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact === 'high' ? 'Yüksek' :
                       insight.impact === 'medium' ? 'Orta' : 'Düşük'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {insight.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Güven: %{(insight.confidence * 100).toFixed(1)}</span>
                    <span>{insight.timestamp}</span>
                  </div>
                  {insight.actions.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Önerilen Aksiyonlar:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {insight.actions.map((action, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Datasets */}
      {selectedView === 'datasets' && (
        <div className="space-y-4">
          {data.datasets.map((dataset, index) => (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Database className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {dataset.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {dataset.size} GB • {dataset.records.toLocaleString()} kayıt
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        dataset.status === 'ready' ? 'bg-green-100 text-green-800' :
                        dataset.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {dataset.status === 'ready' ? 'Hazır' :
                         dataset.status === 'processing' ? 'İşleniyor' : 'Hata'}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {dataset.lastUpdated}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 