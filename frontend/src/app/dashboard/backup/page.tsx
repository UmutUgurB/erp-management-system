'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Download, Upload, Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface Backup {
  filename: string;
  size: number;
  created: string;
  sizeFormatted: string;
}

interface BackupStats {
  totalBackups: number;
  totalSize: string;
  oldestBackup: string | null;
  newestBackup: string | null;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
    fetchStats();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/backup/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBackups(data.data.backups);
      }
    } catch (error) {
      console.error('Backup listesi alınamadı:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/backup/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Backup istatistikleri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('Backup başarıyla oluşturuldu');
        fetchBackups();
        fetchStats();
      } else {
        alert('Backup oluşturulamadı: ' + data.message);
      }
    } catch (error) {
      console.error('Backup oluşturma hatası:', error);
      alert('Backup oluşturulurken hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  const restoreBackup = async (filename: string) => {
    if (!confirm('Bu backup\'ı geri yüklemek istediğinizden emin misiniz? Mevcut veriler silinecektir.')) {
      return;
    }

    setRestoring(filename);
    try {
      const response = await fetch(`/api/backup/restore/${filename}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('Backup başarıyla geri yüklendi');
        fetchBackups();
        fetchStats();
      } else {
        alert('Backup geri yüklenemedi: ' + data.message);
      }
    } catch (error) {
      console.error('Backup geri yükleme hatası:', error);
      alert('Backup geri yüklenirken hata oluştu');
    } finally {
      setRestoring(null);
    }
  };

  const deleteBackup = async (filename: string) => {
    if (!confirm('Bu backup\'ı silmek istediğinizden emin misiniz?')) {
      return;
    }

    setDeleting(filename);
    try {
      const response = await fetch(`/api/backup/delete/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('Backup başarıyla silindi');
        fetchBackups();
        fetchStats();
      } else {
        alert('Backup silinemedi: ' + data.message);
      }
    } catch (error) {
      console.error('Backup silme hatası:', error);
      alert('Backup silinirken hata oluştu');
    } finally {
      setDeleting(null);
    }
  };

  const downloadBackup = (filename: string) => {
    const token = localStorage.getItem('token');
    const url = `/api/backup/download/${filename}`;
    
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Backup indirme hatası:', error);
      alert('Backup indirilemedi');
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
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
            <h1 className="text-2xl font-semibold text-gray-900">Backup Yönetimi</h1>
            <p className="mt-2 text-sm text-gray-700">
              Veritabanı yedekleme ve geri yükleme işlemleri
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={createBackup}
              disabled={creating}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Yeni Backup Oluştur
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Toplam Backup
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalBackups}
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
                    <Download className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Toplam Boyut
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalSize}
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
                        En Eski Backup
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {stats.oldestBackup ? formatDate(stats.oldestBackup) : 'Yok'}
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
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        En Yeni Backup
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {stats.newestBackup ? formatDate(stats.newestBackup) : 'Yok'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backup List */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {backups.length === 0 ? (
                <li className="px-6 py-4 text-center text-gray-500">
                  Henüz backup bulunmuyor
                </li>
              ) : (
                backups.map((backup) => (
                  <li key={backup.filename} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {backup.filename}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(backup.created)} • {backup.sizeFormatted}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => downloadBackup(backup.filename)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          İndir
                        </button>
                        <button
                          onClick={() => restoreBackup(backup.filename)}
                          disabled={restoring === backup.filename}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {restoring === backup.filename ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              Geri Yükleniyor...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-1" />
                              Geri Yükle
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => deleteBackup(backup.filename)}
                          disabled={deleting === backup.filename}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {deleting === backup.filename ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              Siliniyor...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Sil
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 