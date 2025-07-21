'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  Clock,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

interface PerformanceMetrics {
  requests: {
    total: number;
    success: number;
    error: number;
    averageResponseTime: number;
  };
  database: {
    queries: number;
    slowQueries: number;
    averageQueryTime: number;
  };
  memory: {
    usage: number;
    peak: number;
  };
  uptime: {
    startTime: number;
    current: number;
  };
  timestamp: string;
}

interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  memory: {
    total: string;
    free: string;
    used: string;
  };
  cpu: {
    cores: number;
    model: string;
  };
  uptime: {
    system: string;
    process: string;
  };
  environment: string;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
    fetchSystemInfo();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/metrics/system', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSystemInfo(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    }
  };

  const resetMetrics = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/metrics/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchMetrics();
      }
    } catch (error) {
      console.error('Failed to reset metrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatUptime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}g ${hours % 24}s`;
    if (hours > 0) return `${hours}s ${minutes % 60}d`;
    if (minutes > 0) return `${minutes}d ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getSuccessRate = () => {
    if (!metrics || metrics.requests.total === 0) return 0;
    return (metrics.requests.success / metrics.requests.total) * 100;
  };

  const getMemoryUsagePercentage = () => {
    if (!metrics) return 0;
    return (metrics.memory.usage / metrics.memory.peak) * 100;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Sistem Metrikleri</h1>
            <p className="mt-2 text-sm text-gray-700">
              Performans izleme ve sistem durumu
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={resetMetrics}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sıfırlanıyor...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Metrikleri Sıfırla
                </>
              )}
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        {metrics && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Performans Metrikleri
            </h2>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Request Metrics */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Toplam İstek
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {metrics.requests.total.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Rate */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-6 w-6 rounded-full ${getSuccessRate() > 95 ? 'bg-green-400' : getSuccessRate() > 80 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Başarı Oranı
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {getSuccessRate().toFixed(1)}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Average Response Time */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Ort. Yanıt Süresi
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {metrics.requests.averageResponseTime.toFixed(2)}ms
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Memory Usage */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <HardDrive className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Bellek Kullanımı
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {metrics.memory.usage.toFixed(2)}MB
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Database Metrics */}
            <div className="mt-8">
              <h3 className="text-md font-medium text-gray-900 mb-4">Veritabanı Metrikleri</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Server className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Toplam Sorgu
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {metrics.database.queries.toLocaleString()}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Yavaş Sorgu
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {metrics.database.slowQueries}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Clock className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Ort. Sorgu Süresi
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {metrics.database.averageQueryTime.toFixed(2)}ms
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Information */}
        {systemInfo && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Sistem Bilgileri
            </h2>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Sunucu Bilgileri
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Sistem donanım ve yazılım bilgileri
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Platform</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {systemInfo.platform} ({systemInfo.arch})
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Node.js Versiyonu</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {systemInfo.nodeVersion}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">CPU</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {systemInfo.cpu.cores} çekirdek - {systemInfo.cpu.model}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Bellek</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      Toplam: {systemInfo.memory.total} | 
                      Kullanılan: {systemInfo.memory.used} | 
                      Boş: {systemInfo.memory.free}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Çalışma Süresi</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      Sistem: {systemInfo.uptime.system} | 
                      Uygulama: {systemInfo.uptime.process}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Ortam</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {systemInfo.environment}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {metrics && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Son güncelleme: {new Date(metrics.timestamp).toLocaleString('tr-TR')}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 