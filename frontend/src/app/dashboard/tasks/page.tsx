'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, CheckSquare, Clock, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { taskAPI } from '@/lib/api';
import { Task, TaskStats } from '@/types/project';

export default function TasksPage() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsResponse, tasksResponse] = await Promise.all([
        taskAPI.getStats(),
        taskAPI.getTasks()
      ]);
      setStats(statsResponse.data);
      setTasks(tasksResponse.data.tasks || []);
    } catch (error) {
      console.error('Error loading task data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'testing': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} dakika`;
    return `${Math.round(hours)} saat`;
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
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
            Görev Yönetimi
          </h1>
          <p className="text-muted-foreground mt-2">
            Görev takibi, zaman yönetimi ve görev analitik
          </p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Görev
        </Button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Toplam Görev</p>
              <p className="text-3xl font-bold">{stats?.overview.totalTasks || 0}</p>
            </div>
            <div className="p-3 bg-indigo-400 rounded-full">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-indigo-100 text-sm">
              <span className="text-green-300">↗</span>
              <span className="ml-1">+15%</span>
              <span className="ml-2">geçen aya göre</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Tamamlanan</p>
              <p className="text-3xl font-bold">{stats?.overview.completedTasks || 0}</p>
            </div>
            <div className="p-3 bg-green-400 rounded-full">
              <CheckSquare className="h-6 w-6 text-white" />
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

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Devam Eden</p>
              <p className="text-3xl font-bold">{stats?.overview.inProgressTasks || 0}</p>
            </div>
            <div className="p-3 bg-blue-400 rounded-full">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-blue-100 text-sm">
              <span className="text-green-300">↗</span>
              <span className="ml-1">+8%</span>
              <span className="ml-2">geçen aya göre</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Gecikmiş</p>
              <p className="text-3xl font-bold">{stats?.overview.overdueTasks || 0}</p>
            </div>
            <div className="p-3 bg-orange-400 rounded-full">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-orange-100 text-sm">
              <span className="text-red-300">↘</span>
              <span className="ml-1">-12%</span>
              <span className="ml-2">geçen aya göre</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Insights */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Görev Durumu Dağılımı</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Tamamlanan</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.overview.completedTasks || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Devam Eden</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.overview.inProgressTasks || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Beklemede</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.overview.pendingTasks || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Günlük Görev Trendi</h3>
            <div className="h-48 flex items-end justify-between space-x-2">
              {Array.from({ length: 7 }, (_, i) => {
                const day = new Date();
                day.setDate(day.getDate() - (6 - i));
                const dayTasks = Math.floor(Math.random() * 15) + 5; // Mock data
                const maxTasks = 20;
                const height = (dayTasks / maxTasks) * 100;
                return (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <div 
                      className="w-8 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all duration-300 hover:scale-110"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-500">
                      {day.toLocaleDateString('tr-TR', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Görevler</TabsTrigger>
          <TabsTrigger value="overdue">Gecikmiş</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Görev Listesi</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{task.title}</h3>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Proje: {task.project.name}</span>
                          {task.assignedTo && (
                            <span>Atanan: {task.assignedTo.name}</span>
                          )}
                          <span>Tip: {task.type}</span>
                          {task.estimatedHours && (
                            <span>Tahmini: {formatTime(task.estimatedHours)}</span>
                          )}
                          {task.actualHours > 0 && (
                            <span>Gerçek: {formatTime(task.actualHours)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          %{task.progress} Tamamlandı
                        </div>
                        <Progress value={task.progress} className="w-24 mt-1" />
                        {task.dueDate && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {task.daysRemaining !== null ? (
                              task.daysRemaining > 0 ? (
                                `${task.daysRemaining} gün kaldı`
                              ) : (
                                `${Math.abs(task.daysRemaining)} gün gecikmiş`
                              )
                            ) : (
                              'Süre belirtilmemiş'
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Görev bulunamadı
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gecikmiş Görevler</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.overdueTasks && stats.overdueTasks.length > 0 ? (
                <div className="space-y-4">
                  {stats.overdueTasks.map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {task.project.name} • {task.assignedTo?.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">
                          {Math.abs(task.daysRemaining || 0)} gün gecikmiş
                        </div>
                        <div className="text-sm text-muted-foreground">
                          %{task.progress} tamamlandı
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Gecikmiş görev bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Görev Durumu</CardTitle>
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
                <CardTitle>Görev Önceliği</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.priorityStats?.map((stat) => (
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
              <CardTitle>Zaman Analizi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium">Toplam Tahmini Süre</div>
                  <div className="text-2xl font-bold">
                    {formatTime(stats?.overview.totalEstimatedHours || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Toplam Gerçek Süre</div>
                  <div className="text-2xl font-bold">
                    {formatTime(stats?.overview.totalActualHours || 0)}
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