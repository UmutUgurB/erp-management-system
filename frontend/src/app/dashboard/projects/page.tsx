'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, FolderOpen, Users, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { projectAPI } from '@/lib/api';
import { Project, ProjectStats } from '@/types/project';

export default function ProjectsPage() {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsResponse, projectsResponse] = await Promise.all([
        projectAPI.getStats(),
        projectAPI.getProjects()
      ]);
      setStats(statsResponse.data);
      setProjects(projectsResponse.data.projects || []);
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold tracking-tight">Proje Yönetimi</h1>
          <p className="text-muted-foreground">
            Proje takibi, ekip yönetimi ve proje analitik
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Proje
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Proje</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              Toplam proje sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Projeler</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.overview.activeProjects || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Devam eden projeler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.overview.completedProjects || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tamamlanan projeler
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
              {stats?.overview.overdueProjects || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Gecikmiş projeler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projeler</TabsTrigger>
          <TabsTrigger value="overdue">Gecikmiş</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proje Listesi</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{project.name}</h3>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <Badge className={getPriorityColor(project.priority)}>
                            {project.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Kod: {project.code}</span>
                          <span>Yönetici: {project.manager.name}</span>
                          <span>Ekip: {project.team.length} kişi</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          %{project.progress} Tamamlandı
                        </div>
                        <Progress value={project.progress} className="w-24 mt-1" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {project.daysRemaining} gün kaldı
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Proje bulunamadı
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gecikmiş Projeler</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.overdueProjects && stats.overdueProjects.length > 0 ? (
                <div className="space-y-4">
                  {stats.overdueProjects.map((project) => (
                    <div key={project._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.manager.name} • {project.customer?.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">
                          {Math.abs(project.daysRemaining)} gün gecikmiş
                        </div>
                        <div className="text-sm text-muted-foreground">
                          %{project.progress} tamamlandı
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Gecikmiş proje bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Proje Durumu</CardTitle>
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
                <CardTitle>Proje Önceliği</CardTitle>
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
              <CardTitle>Bütçe Analizi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium">Toplam Bütçe</div>
                  <div className="text-2xl font-bold">
                    ₺{stats?.overview.totalBudget?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Gerçek Maliyet</div>
                  <div className="text-2xl font-bold">
                    ₺{stats?.overview.totalActualCost?.toLocaleString() || 0}
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