export interface ProjectTeamMember {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  role: 'manager' | 'developer' | 'designer' | 'tester' | 'analyst' | 'other';
  assignedDate: string;
  isActive: boolean;
}

export interface ProjectDocument {
  name: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  code: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'internal' | 'client' | 'maintenance' | 'research' | 'other';
  customer?: {
    _id: string;
    name: string;
    email: string;
    company?: string;
  };
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  budget?: number;
  actualCost: number;
  progress: number;
  manager: {
    _id: string;
    name: string;
    email: string;
  };
  team: ProjectTeamMember[];
  tags: string[];
  documents: ProjectDocument[];
  notes?: string;
  duration: number;
  actualDuration: number;
  daysRemaining: number;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDependency {
  task: {
    _id: string;
    title: string;
    status: string;
  };
  type: 'blocks' | 'blocked_by' | 'related';
}

export interface TaskComment {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  createdAt: string;
}

export interface TimeEntry {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  startTime: string;
  endTime?: string;
  duration?: number;
  description?: string;
  isActive: boolean;
}

export interface TaskAttachment {
  name: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: {
    _id: string;
    name: string;
    code: string;
    status: string;
  };
  status: 'todo' | 'in_progress' | 'review' | 'testing' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'feature' | 'bug' | 'improvement' | 'documentation' | 'testing' | 'other';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  estimatedHours?: number;
  actualHours: number;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  progress: number;
  dependencies: TaskDependency[];
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  timeEntries: TimeEntry[];
  notes?: string;
  duration: number;
  daysRemaining?: number;
  isOverdue: boolean;
  totalTimeSpent: number;
  activeTimeEntry?: TimeEntry;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    overdueProjects: number;
    totalBudget: number;
    totalActualCost: number;
  };
  statusStats: Array<{
    _id: string;
    count: number;
  }>;
  priorityStats: Array<{
    _id: string;
    count: number;
  }>;
  overdueProjects: Project[];
}

export interface TaskStats {
  overview: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    totalEstimatedHours: number;
    totalActualHours: number;
  };
  statusStats: Array<{
    _id: string;
    count: number;
  }>;
  priorityStats: Array<{
    _id: string;
    count: number;
  }>;
  overdueTasks: Task[];
}

export interface ProjectFormData {
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'internal' | 'client' | 'maintenance' | 'research' | 'other';
  customer?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  manager: string;
  team: Array<{
    user: string;
    role: 'manager' | 'developer' | 'designer' | 'tester' | 'analyst' | 'other';
  }>;
  tags: string[];
  notes?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  project: string;
  status: 'todo' | 'in_progress' | 'review' | 'testing' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'feature' | 'bug' | 'improvement' | 'documentation' | 'testing' | 'other';
  assignedTo?: string;
  estimatedHours?: number;
  startDate?: string;
  dueDate?: string;
  progress: number;
  tags: string[];
  notes?: string;
} 