export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: WidgetConfig;
  isVisible: boolean;
  isResizable: boolean;
  isDraggable: boolean;
}

export type WidgetType = 
  | 'stat-card'
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'area-chart'
  | 'table'
  | 'progress'
  | 'gauge'
  | 'calendar'
  | 'activity-feed'
  | 'quick-actions'
  | 'weather'
  | 'clock'
  | 'custom';

export interface WidgetConfig {
  // Stat Card
  statCard?: {
    value: string | number;
    label: string;
    icon: string;
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
    trend?: {
      value: number;
      isPositive: boolean;
    };
  };

  // Chart Widgets
  chart?: {
    data: any[];
    dataKey: string;
    xAxisKey?: string;
    color?: string;
    title?: string;
    showLegend?: boolean;
    showGrid?: boolean;
  };

  // Table Widget
  table?: {
    columns: Array<{
      key: string;
      label: string;
      sortable?: boolean;
    }>;
    data: any[];
    pagination?: {
      pageSize: number;
      currentPage: number;
    };
    searchable?: boolean;
  };

  // Progress Widget
  progress?: {
    value: number;
    max: number;
    label: string;
    color: 'blue' | 'green' | 'yellow' | 'red';
    showPercentage?: boolean;
  };

  // Gauge Widget
  gauge?: {
    value: number;
    min: number;
    max: number;
    label: string;
    color: 'blue' | 'green' | 'yellow' | 'red';
  };

  // Activity Feed
  activityFeed?: {
    activities: Array<{
      id: string;
      type: 'info' | 'success' | 'warning' | 'error';
      message: string;
      timestamp: string;
      user?: string;
    }>;
    maxItems?: number;
  };

  // Quick Actions
  quickActions?: {
    actions: Array<{
      id: string;
      label: string;
      icon: string;
      action: string;
      color?: string;
    }>;
  };

  // Custom Widget
  custom?: {
    component: string;
    props: Record<string, any>;
  };
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardPreset {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'inventory' | 'finance' | 'operations' | 'custom';
  widgets: Omit<DashboardWidget, 'id'>[];
  thumbnail?: string;
}

export interface WidgetTemplate {
  type: WidgetType;
  name: string;
  description: string;
  defaultConfig: WidgetConfig;
  defaultSize: {
    w: number;
    h: number;
  };
  category: 'basic' | 'charts' | 'tables' | 'custom';
  icon: string;
} 