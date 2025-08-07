'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Database,
  Network,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Info,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

interface SecurityData {
  overallScore: number;
  lastScan: string;
  threats: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  devices: Array<{
    id: string;
    name: string;
    type: 'desktop' | 'mobile' | 'tablet' | 'server';
    status: 'online' | 'offline' | 'suspicious';
    lastSeen: string;
    location: string;
    ip: string;
  }>;
  activities: Array<{
    id: string;
    type: 'login' | 'logout' | 'data_access' | 'file_change' | 'admin_action';
    user: string;
    description: string;
    timestamp: string;
    ip: string;
    location: string;
    risk: 'low' | 'medium' | 'high' | 'critical';
  }>;
  vulnerabilities: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved';
    discovered: string;
    affected: string[];
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
    effort: string;
  }>;
}

export default function SecurityCenter() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData: SecurityData = {
        overallScore: 87,
        lastScan: '2 saat önce',
        threats: {
          total: 3,
          critical: 0,
          high: 1,
          medium: 1,
          low: 1
        },
        devices: [
          {
            id: '1',
            name: 'Ahmet Yılmaz - Laptop',
            type: 'desktop',
            status: 'online',
            lastSeen: 'Şimdi',
            location: 'İstanbul, Türkiye',
            ip: '192.168.1.100'
          },
          {
            id: '2',
            name: 'Ayşe Kaya - iPhone',
            type: 'mobile',
            status: 'online',
            lastSeen: '5 dakika önce',
            location: 'Ankara, Türkiye',
            ip: '192.168.1.101'
          },
          {
            id: '3',
            name: 'Mehmet Demir - Tablet',
            type: 'tablet',
            status: 'offline',
            lastSeen: '2 saat önce',
            location: 'İzmir, Türkiye',
            ip: '192.168.1.102'
          },
          {
            id: '4',
            name: 'ERP Server',
            type: 'server',
            status: 'online',
            lastSeen: 'Şimdi',
            location: 'Data Center',
            ip: '10.0.0.1'
          }
        ],
        activities: [
          {
            id: '1',
            type: 'login',
            user: 'ahmet.yilmaz@company.com',
            description: 'Başarılı giriş',
            timestamp: '2 dakika önce',
            ip: '192.168.1.100',
            location: 'İstanbul, Türkiye',
            risk: 'low'
          },
          {
            id: '2',
            type: 'data_access',
            user: 'ayse.kaya@company.com',
            description: 'Müşteri verilerine erişim',
            timestamp: '15 dakika önce',
            ip: '192.168.1.101',
            location: 'Ankara, Türkiye',
            risk: 'medium'
          },
          {
            id: '3',
            type: 'admin_action',
            user: 'admin@company.com',
            description: 'Sistem ayarları değiştirildi',
            timestamp: '1 saat önce',
            ip: '10.0.0.1',
            location: 'Data Center',
            risk: 'high'
          }
        ],
        vulnerabilities: [
          {
            id: '1',
            title: 'Eski SSL Sertifikası',
            description: 'Web sunucusunda eski SSL sertifikası kullanılıyor',
            severity: 'high',
            status: 'open',
            discovered: '3 gün önce',
            affected: ['Web Server', 'API Gateway']
          },
          {
            id: '2',
            title: 'Zayıf Şifre Politikası',
            description: 'Kullanıcı şifreleri yeterince güçlü değil',
            severity: 'medium',
            status: 'in_progress',
            discovered: '1 hafta önce',
            affected: ['User Management System']
          }
        ],
        recommendations: [
          {
            id: '1',
            title: 'SSL Sertifikasını Güncelleyin',
            description: 'Web sunucusu için yeni SSL sertifikası alın',
            priority: 'high',
            impact: 'Güvenlik skorunu %15 artırır',
            effort: '30 dakika'
          },
          {
            id: '2',
            title: 'İki Faktörlü Kimlik Doğrulama',
            description: 'Tüm kullanıcılar için 2FA zorunlu hale getirin',
            priority: 'critical',
            impact: 'Güvenlik skorunu %25 artırır',
            effort: '2 saat'
          },
          {
            id: '3',
            title: 'Güvenlik Duvarı Kuralları',
            description: 'Güvenlik duvarı kurallarını gözden geçirin',
            priority: 'medium',
            impact: 'Güvenlik skorunu %10 artırır',
            effort: '1 saat'
          }
        ]
      };
      
      setData(mockData);
    } catch (error) {
      addNotification('error', 'Hata!', 'Güvenlik verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop': return <Laptop className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'server': return <Server className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCheck className="w-4 h-4" />;
      case 'logout': return <UserCheck className="w-4 h-4" />;
      case 'data_access': return <Database className="w-4 h-4" />;
      case 'file_change': return <FileText className="w-4 h-4" />;
      case 'admin_action': return <Settings className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const handleSecurityScan = async () => {
    try {
      addNotification('info', 'Tarama Başlatıldı', 'Güvenlik taraması başlatıldı...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      addNotification('success', 'Tarama Tamamlandı', 'Güvenlik taraması başarıyla tamamlandı.');
      loadSecurityData();
    } catch (error) {
      addNotification('error', 'Hata!', 'Güvenlik taraması başarısız oldu.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">Güvenlik verileri yükleniyor...</span>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Güvenlik Merkezi</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistem güvenliği ve tehdit yönetimi
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleSecurityScan} variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Güvenlik Taraması
          </Button>
          <Button onClick={loadSecurityData} variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Güvenlik Skoru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray={`${data.overallScore}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{data.overallScore}</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.overallScore}/100
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Son tarama: {data.lastScan}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Tehditler</div>
              <div className="text-2xl font-bold text-red-600">{data.threats.total}</div>
              <div className="text-xs text-gray-500">
                {data.threats.critical} kritik, {data.threats.high} yüksek
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
          { id: 'devices', label: 'Cihazlar', icon: Monitor },
          { id: 'activities', label: 'Aktiviteler', icon: Activity },
          { id: 'vulnerabilities', label: 'Açıklar', icon: AlertTriangle },
          { id: 'recommendations', label: 'Öneriler', icon: CheckCircle }
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
          {/* Active Devices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                Aktif Cihazlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.devices.filter(d => d.status === 'online').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Toplam {data.devices.length} cihaz
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Son Aktiviteler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.activities.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Son 24 saat
              </div>
            </CardContent>
          </Card>

          {/* Open Vulnerabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Açık Açıklar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {data.vulnerabilities.filter(v => v.status === 'open').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Dikkat gerektiren
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Devices */}
      {selectedView === 'devices' && (
        <div className="space-y-4">
          {data.devices.map((device, index) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.type)}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {device.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {device.ip} • {device.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        device.status === 'online' ? 'bg-green-100 text-green-800' :
                        device.status === 'offline' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {device.status === 'online' ? 'Çevrimiçi' :
                         device.status === 'offline' ? 'Çevrimdışı' : 'Şüpheli'}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {device.lastSeen}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Activities */}
      {selectedView === 'activities' && (
        <div className="space-y-4">
          {data.activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {activity.description}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.user} • {activity.ip}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRiskColor(activity.risk)}>
                        {activity.risk === 'critical' ? 'Kritik' :
                         activity.risk === 'high' ? 'Yüksek' :
                         activity.risk === 'medium' ? 'Orta' : 'Düşük'}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Vulnerabilities */}
      {selectedView === 'vulnerabilities' && (
        <div className="space-y-4">
          {data.vulnerabilities.map((vuln, index) => (
            <motion.div
              key={vuln.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{vuln.title}</CardTitle>
                    <Badge className={getRiskColor(vuln.severity)}>
                      {vuln.severity === 'critical' ? 'Kritik' :
                       vuln.severity === 'high' ? 'Yüksek' :
                       vuln.severity === 'medium' ? 'Orta' : 'Düşük'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {vuln.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Keşfedildi: {vuln.discovered}</span>
                    <span>Etkilenen: {vuln.affected.length} sistem</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {selectedView === 'recommendations' && (
        <div className="space-y-4">
          {data.recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{rec.title}</CardTitle>
                    <Badge className={getRiskColor(rec.priority)}>
                      {rec.priority === 'critical' ? 'Kritik' :
                       rec.priority === 'high' ? 'Yüksek' :
                       rec.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {rec.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Etki: {rec.impact}</span>
                    <span>Çaba: {rec.effort}</span>
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