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
          <h1 className="text-3xl font-bold tracking-tight">Görev Yönetimi</h1>
          <p className="text-muted-foreground">
            Görev takibi, zaman yönetimi ve görev analitik
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Görev
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görev</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.totalTasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Toplam görev sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.overview.completedTasks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tamamlanan görevler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devam Eden</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.overview.inProgressTasks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Devam eden görevler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gecikmiş</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.overview.overdueTasks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Gecikmiş görevler
            </p>
          </CardContent>
        </Card>
      </div>

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