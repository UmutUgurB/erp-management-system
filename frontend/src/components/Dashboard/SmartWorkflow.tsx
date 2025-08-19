'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Workflow, 
  Zap, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Stop,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Filter,
  Search,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Brain,
  Target,
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  Calendar,
  Bell,
  Mail,
  MessageSquare,
  FileText,
  Database,
  Server,
  Shield,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'event' | 'schedule' | 'condition' | 'manual';
    event?: string;
    schedule?: string;
    condition?: string;
  };
  actions: Array<{
    type: 'notification' | 'email' | 'database' | 'api' | 'workflow';
    config: any;
  }>;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
    value: any;
  }>;
  status: 'active' | 'inactive' | 'draft' | 'error';
  priority: number;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  result?: any;
  error?: string;
  triggeredBy: string;
}

interface SmartWorkflowProps {
  className?: string;
}

const SmartWorkflow: React.FC<SmartWorkflowProps> = ({ className = '' }) => {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRule | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'workflows' | 'executions' | 'templates'>('workflows');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data generation
  useEffect(() => {
    const mockWorkflows: WorkflowRule[] = [
      {
        id: '1',
        name: 'Stok Düşük Uyarısı',
        description: 'Stok seviyesi belirlenen eşiğin altına düştüğünde otomatik uyarı gönder',
        trigger: {
          type: 'condition',
          condition: 'stock_level < threshold'
        },
        actions: [
          {
            type: 'notification',
            config: { message: 'Stok seviyesi düşük: {product_name}', priority: 'high' }
          },
          {
            type: 'email',
            config: { to: 'inventory@company.com', subject: 'Stok Uyarısı', template: 'stock_alert' }
          }
        ],
        conditions: [
          { field: 'stock_level', operator: 'less_than', value: 10 },
          { field: 'category', operator: 'equals', value: 'critical' }
        ],
        status: 'active',
        priority: 1,
        lastExecuted: new Date(Date.now() - 1000 * 60 * 30),
        executionCount: 15,
        successRate: 100,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      },
      {
        id: '2',
        name: 'Müşteri Memnuniyet Takibi',
        description: 'Sipariş tamamlandıktan 24 saat sonra müşteri memnuniyet anketi gönder',
        trigger: {
          type: 'event',
          event: 'order_completed'
        },
        actions: [
          {
            type: 'email',
            config: { to: '{customer_email}', subject: 'Memnuniyet Anketi', template: 'satisfaction_survey' }
          },
          {
            type: 'workflow',
            config: { workflowId: 'follow_up_reminder', delay: '3d' }
          }
        ],
        conditions: [
          { field: 'order_value', operator: 'greater_than', value: 100 },
          { field: 'customer_type', operator: 'equals', value: 'premium' }
        ],
        status: 'active',
        priority: 2,
        lastExecuted: new Date(Date.now() - 1000 * 60 * 60 * 2),
        executionCount: 89,
        successRate: 95,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
      },
      {
        id: '3',
        name: 'Haftalık Rapor Gönderimi',
        description: 'Her Pazartesi sabah 9:00\'da haftalık performans raporu gönder',
        trigger: {
          type: 'schedule',
          schedule: '0 9 * * 1'
        },
        actions: [
          {
            type: 'email',
            config: { to: 'managers@company.com', subject: 'Haftalık Rapor', template: 'weekly_report' }
          },
          {
            type: 'notification',
            config: { message: 'Haftalık rapor gönderildi', priority: 'medium' }
          }
        ],
        conditions: [],
        status: 'active',
        priority: 3,
        lastExecuted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        executionCount: 52,
        successRate: 100,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
      },
      {
        id: '4',
        name: 'Performans Uyarısı',
        description: 'Çalışan performans skoru belirlenen eşiğin altına düştüğünde yöneticiye bildir',
        trigger: {
          type: 'condition',
          condition: 'performance_score < threshold'
        },
        actions: [
          {
            type: 'notification',
            config: { message: 'Performans uyarısı: {employee_name}', priority: 'high' }
          },
          {
            type: 'email',
            config: { to: '{manager_email}', subject: 'Performans Uyarısı', template: 'performance_alert' }
          }
        ],
        conditions: [
          { field: 'performance_score', operator: 'less_than', value: 70 },
          { field: 'department', operator: 'equals', value: 'sales' }
        ],
        status: 'draft',
        priority: 4,
        executionCount: 0,
        successRate: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
      }
    ];

    const mockExecutions: WorkflowExecution[] = [
      {
        id: '1',
        workflowId: '1',
        workflowName: 'Stok Düşük Uyarısı',
        status: 'completed',
        startedAt: new Date(Date.now() - 1000 * 60 * 30),
        completedAt: new Date(Date.now() - 1000 * 60 * 29),
        duration: 60000,
        result: { notifications_sent: 2, emails_sent: 1 },
        triggeredBy: 'system'
      },
      {
        id: '2',
        workflowId: '2',
        workflowName: 'Müşteri Memnuniyet Takibi',
        status: 'running',
        startedAt: new Date(Date.now() - 1000 * 60 * 5),
        triggeredBy: 'order_completion'
      },
      {
        id: '3',
        workflowId: '3',
        workflowName: 'Haftalık Rapor Gönderimi',
        status: 'completed',
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 5000),
        duration: 5000,
        result: { emails_sent: 5, notifications_sent: 1 },
        triggeredBy: 'schedule'
      }
    ];

    setWorkflows(mockWorkflows);
    setExecutions(mockExecutions);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'draft': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return Pause;
      case 'draft': return Edit;
      case 'error': return AlertCircle;
      default: return Clock;
    }
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'cancelled': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getExecutionStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return Activity;
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'cancelled': return Stop;
      default: return Clock;
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'event': return Zap;
      case 'schedule': return Clock;
      case 'condition': return Target;
      case 'manual': return Users;
      default: return Workflow;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'notification': return Bell;
      case 'email': return Mail;
      case 'database': return Database;
      case 'api': return Server;
      case 'workflow': return Workflow;
      default: return Activity;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
  };

  const toggleWorkflowStatus = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' }
        : w
    ));
  };

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
  };

  const duplicateWorkflow = (workflow: WorkflowRule) => {
    const newWorkflow = {
      ...workflow,
      id: Date.now().toString(),
      name: `${workflow.name} (Kopya)`,
      status: 'draft' as const,
      executionCount: 0,
      successRate: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setWorkflows(prev => [...prev, newWorkflow]);
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesSearch = !searchQuery || 
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Workflow className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Akıllı İş Akışı Otomasyonu
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kural tabanlı otomasyon ve iş akışı yönetimi
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İş Akışı</span>
          </button>
          
          <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setViewMode('workflows')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            viewMode === 'workflows'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          İş Akışları
        </button>
        <button
          onClick={() => setViewMode('executions')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            viewMode === 'executions'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Çalıştırma Geçmişi
        </button>
        <button
          onClick={() => setViewMode('templates')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            viewMode === 'templates'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Şablonlar
        </button>
      </div>

      {viewMode === 'workflows' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="draft">Taslak</option>
                <option value="error">Hata</option>
              </select>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="İş akışı ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredWorkflows.length} iş akışı bulundu
            </div>
          </div>

          {/* Workflows List */}
          <div className="space-y-4">
            {filteredWorkflows.map((workflow, index) => {
              const StatusIcon = getStatusIcon(workflow.status);
              const TriggerIcon = getTriggerIcon(workflow.trigger.type);
              return (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(workflow.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {workflow.name}
                        </h3>
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full">
                          Öncelik: {workflow.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {workflow.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <TriggerIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Tetikleyici: {workflow.trigger.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {workflow.executionCount} kez çalıştı
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            %{workflow.successRate} başarı oranı
                          </span>
                        </div>
                      </div>
                      
                      {workflow.lastExecuted && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Son çalıştırma: {getTimeAgo(workflow.lastExecuted)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleWorkflowStatus(workflow.id)}
                        className={`p-2 rounded-md transition-colors ${
                          workflow.status === 'active'
                            ? 'text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20'
                            : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                        }`}
                        title={workflow.status === 'active' ? 'Duraklat' : 'Etkinleştir'}
                      >
                        {workflow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => duplicateWorkflow(workflow)}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900/20 rounded-md transition-colors"
                        title="Kopyala"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteWorkflow(workflow.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
              {/* Actions Preview */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Eylemler:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {workflow.actions.map((action, actionIndex) => {
                    const ActionIcon = getActionIcon(action.type);
                    return (
                      <div
                        key={actionIndex}
                        className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md"
                      >
                        <ActionIcon className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {action.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  )}

  {viewMode === 'executions' && (
    <div className="space-y-6">
      {/* Executions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Çalıştırma Geçmişi
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {executions.map((execution, index) => {
              const StatusIcon = getExecutionStatusIcon(execution.status);
              return (
                <motion.div
                  key={execution.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getExecutionStatusColor(execution.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {execution.workflowName}
                      </h4>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Başlangıç: {getTimeAgo(execution.startedAt)}</span>
                        {execution.duration && (
                          <span>Süre: {formatDuration(execution.duration)}</span>
                        )}
                        <span>Tetiklendi: {execution.triggeredBy}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {execution.status === 'running' && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Activity className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Çalışıyor</span>
                      </div>
                    )}
                    
                    {execution.status === 'completed' && execution.result && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {execution.result.notifications_sent && `${execution.result.notifications_sent} bildirim`}
                        {execution.result.emails_sent && `${execution.result.emails_sent} email`}
                      </div>
                    )}
                    
                    {execution.status === 'failed' && execution.error && (
                      <div className="text-xs text-red-600">
                        Hata: {execution.error}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )}

  {viewMode === 'templates' && (
    <div className="space-y-6">
      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: 'Stok Yönetimi',
            description: 'Stok seviyesi takibi ve otomatik sipariş',
            icon: Package,
            color: 'blue'
          },
          {
            name: 'Müşteri İletişimi',
            description: 'Otomatik müşteri takibi ve anketler',
            icon: Users,
            color: 'green'
          },
          {
            name: 'Performans Takibi',
            description: 'Çalışan performans metrikleri ve uyarılar',
            icon: Target,
            color: 'purple'
          },
          {
            name: 'Finansal Raporlama',
            description: 'Otomatik finansal raporlar ve analizler',
            icon: DollarSign,
            color: 'yellow'
          },
          {
            name: 'Sistem Bakımı',
            description: 'Otomatik sistem kontrolleri ve yedekleme',
            icon: Server,
            color: 'red'
          },
          {
            name: 'Güvenlik Uyarıları',
            description: 'Güvenlik olayları ve otomatik müdahale',
            icon: Shield,
            color: 'indigo'
          }
        ].map((template, index) => {
          const Icon = template.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
            green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
            purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
            yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
            red: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
            indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
          };
          
          return (
            <motion.div
              key={template.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[template.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {template.name}
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {template.description}
              </p>
              
              <button className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Şablonu Kullan
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  )}

  {/* Create/Edit Modal */}
  <AnimatePresence>
    {(showCreateModal || showEditModal) && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {showCreateModal ? 'Yeni İş Akışı Oluştur' : 'İş Akışını Düzenle'}
            </h3>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedWorkflow(null);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İş Akışı Adı
              </label>
              <input
                type="text"
                defaultValue={selectedWorkflow?.name || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="İş akışı adını girin"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Açıklama
              </label>
              <textarea
                defaultValue={selectedWorkflow?.description || ''}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="İş akışı açıklamasını girin"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tetikleyici Türü
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="event">Olay</option>
                  <option value="schedule">Zamanlanmış</option>
                  <option value="condition">Koşul</option>
                  <option value="manual">Manuel</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Öncelik
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="1">1 - En Yüksek</option>
                  <option value="2">2 - Yüksek</option>
                  <option value="3">3 - Orta</option>
                  <option value="4">4 - Düşük</option>
                  <option value="5">5 - En Düşük</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedWorkflow(null);
              }}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              İptal
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              {showCreateModal ? 'Oluştur' : 'Güncelle'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
);
};

export default SmartWorkflow;
