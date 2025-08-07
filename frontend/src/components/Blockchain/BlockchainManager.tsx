'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Link, 
  Shield, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Database,
  Network,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  Zap,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Info,
  HelpCircle,
  Wallet,
  Coins,
  Hash,
  Fingerprint
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

interface BlockchainData {
  networkStatus: 'online' | 'offline' | 'syncing';
  totalTransactions: number;
  pendingTransactions: number;
  confirmedTransactions: number;
  blockchainHeight: number;
  lastBlockTime: string;
  walletBalance: number;
  smartContracts: Array<{
    id: string;
    name: string;
    address: string;
    type: 'payment' | 'inventory' | 'identity' | 'audit';
    status: 'active' | 'inactive' | 'pending';
    balance: number;
    transactions: number;
  }>;
  transactions: Array<{
    id: string;
    hash: string;
    type: 'payment' | 'inventory' | 'identity' | 'audit';
    from: string;
    to: string;
    amount: number;
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: string;
    gasUsed: number;
    blockNumber: number;
  }>;
  securityMetrics: {
    totalBlocks: number;
    averageBlockTime: number;
    networkHashRate: number;
    activeNodes: number;
    consensus: string;
  };
}

export default function BlockchainManager() {
  const [data, setData] = useState<BlockchainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [showWallet, setShowWallet] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData: BlockchainData = {
        networkStatus: 'online',
        totalTransactions: 15420,
        pendingTransactions: 23,
        confirmedTransactions: 15397,
        blockchainHeight: 1245789,
        lastBlockTime: '2 dakika önce',
        walletBalance: 1250.75,
        smartContracts: [
          {
            id: '1',
            name: 'ERP Payment Contract',
            address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            type: 'payment',
            status: 'active',
            balance: 5000.00,
            transactions: 1250
          },
          {
            id: '2',
            name: 'Inventory Tracking',
            address: '0x8ba1f109551bD432803012645Hac136c772c3c7',
            type: 'inventory',
            status: 'active',
            balance: 0.00,
            transactions: 3420
          },
          {
            id: '3',
            name: 'Identity Verification',
            address: '0x1234567890abcdef1234567890abcdef12345678',
            type: 'identity',
            status: 'active',
            balance: 100.00,
            transactions: 890
          }
        ],
        transactions: [
          {
            id: '1',
            hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            type: 'payment',
            from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            to: '0x8ba1f109551bD432803012645Hac136c772c3c7',
            amount: 250.00,
            status: 'confirmed',
            timestamp: '5 dakika önce',
            gasUsed: 21000,
            blockNumber: 1245789
          },
          {
            id: '2',
            hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            type: 'inventory',
            from: '0x8ba1f109551bD432803012645Hac136c772c3c7',
            to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            amount: 0.00,
            status: 'pending',
            timestamp: '2 dakika önce',
            gasUsed: 45000,
            blockNumber: 1245790
          }
        ],
        securityMetrics: {
          totalBlocks: 1245789,
          averageBlockTime: 12.5,
          networkHashRate: 45.2,
          activeNodes: 1250,
          consensus: 'Proof of Stake'
        }
      };
      
      setData(mockData);
    } catch (error) {
      addNotification('error', 'Hata!', 'Blockchain verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'offline': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'syncing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getContractTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <Coins className="w-4 h-4" />;
      case 'inventory': return <Database className="w-4 h-4" />;
      case 'identity': return <Fingerprint className="w-4 h-4" />;
      case 'audit': return <FileText className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  const handleSyncBlockchain = async () => {
    try {
      addNotification('info', 'Senkronizasyon', 'Blockchain senkronizasyonu başlatıldı...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      addNotification('success', 'Başarılı!', 'Blockchain başarıyla senkronize edildi.');
      loadBlockchainData();
    } catch (error) {
      addNotification('error', 'Hata!', 'Senkronizasyon başarısız oldu.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addNotification('success', 'Kopyalandı!', 'Adres panoya kopyalandı.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">Blockchain verileri yükleniyor...</span>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Blockchain Yöneticisi</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Güvenli işlemler ve akıllı kontratlar
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowWallet(!showWallet)} variant="outline">
            <Wallet className="w-4 h-4 mr-2" />
            Cüzdan
          </Button>
          <Button onClick={handleSyncBlockchain} variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="w-5 h-5 mr-2" />
            Ağ Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge className={getStatusColor(data.networkStatus)}>
                {data.networkStatus === 'online' ? 'Çevrimiçi' :
                 data.networkStatus === 'offline' ? 'Çevrimdışı' : 'Senkronize Ediliyor'}
              </Badge>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Blok Yüksekliği</div>
                <div className="text-lg font-bold">{data.blockchainHeight.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Son Blok</div>
              <div className="text-sm">{data.lastBlockTime}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Balance */}
      {showWallet && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Cüzdan Bakiyesi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {data.walletBalance.toFixed(2)} ETH
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                ≈ ${(data.walletBalance * 2500).toFixed(2)} USD
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* View Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
          { id: 'contracts', label: 'Akıllı Kontratlar', icon: FileText },
          { id: 'transactions', label: 'İşlemler', icon: Activity },
          { id: 'security', label: 'Güvenlik', icon: Shield }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Toplam İşlem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.totalTransactions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tüm zamanlar
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Bekleyen İşlem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {data.pendingTransactions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Onay bekliyor
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Onaylanan İşlem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data.confirmedTransactions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Başarılı
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="w-5 h-5 mr-2" />
                Aktif Node
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.securityMetrics.activeNodes.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Ağda aktif
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Smart Contracts */}
      {selectedView === 'contracts' && (
        <div className="space-y-4">
          {data.smartContracts.map((contract, index) => (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getContractTypeIcon(contract.type)}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {contract.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        contract.status === 'active' ? 'bg-green-100 text-green-800' :
                        contract.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {contract.status === 'active' ? 'Aktif' :
                         contract.status === 'inactive' ? 'Pasif' : 'Beklemede'}
                      </Badge>
                      <Button
                        onClick={() => copyToClipboard(contract.address)}
                        variant="ghost"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Bakiye: {contract.balance.toFixed(2)} ETH</span>
                    <span>{contract.transactions} işlem</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Transactions */}
      {selectedView === 'transactions' && (
        <div className="space-y-4">
          {data.transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getContractTypeIcon(tx.type)}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {tx.type === 'payment' ? 'Ödeme' :
                           tx.type === 'inventory' ? 'Envanter' :
                           tx.type === 'identity' ? 'Kimlik' : 'Denetim'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTransactionStatusColor(tx.status)}>
                        {tx.status === 'confirmed' ? 'Onaylandı' :
                         tx.status === 'pending' ? 'Beklemede' : 'Başarısız'}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {tx.amount > 0 ? `${tx.amount.toFixed(2)} ETH` : '0 ETH'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tx.timestamp}
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

      {/* Security */}
      {selectedView === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Ağ Güvenliği
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Toplam Blok</span>
                  <span className="font-medium">{data.securityMetrics.totalBlocks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ortalama Blok Süresi</span>
                  <span className="font-medium">{data.securityMetrics.averageBlockTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Hash Rate</span>
                  <span className="font-medium">{data.securityMetrics.networkHashRate} TH/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Konsensüs</span>
                  <span className="font-medium">{data.securityMetrics.consensus}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Güvenlik Özellikleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Şifreli İşlemler</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Akıllı Kontrat Doğrulama</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Çoklu İmza Desteği</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">İşlem İzleme</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 