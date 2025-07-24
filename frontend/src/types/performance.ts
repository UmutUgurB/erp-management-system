export interface Performance {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
  };
  period: {
    year: number;
    quarter: 1 | 2 | 3 | 4;
    month?: number;
  };
  evaluationType: 'quarterly' | 'annual' | 'monthly' | 'project' | 'custom';
  status: 'draft' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  kpis: KPI[];
  goals: Goal[];
  feedback360: Feedback360[];
  overallScore?: number;
  performanceLevel: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  evaluator: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  evaluationDate: string;
  dueDate: string;
  completedDate?: string;
  managerComments?: string;
  employeeComments?: string;
  hrComments?: string;
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  rewards: Reward[];
  developmentPlan: DevelopmentPlan;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface KPI {
  category: 'productivity' | 'quality' | 'leadership' | 'teamwork' | 'innovation' | 'customer_service' | 'technical_skills' | 'communication';
  name: string;
  description?: string;
  target: number;
  actual: number;
  weight: number;
  score?: number;
  unit?: string;
}

export interface Goal {
  title: string;
  description?: string;
  targetDate?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'personal' | 'team' | 'department' | 'company';
}

export interface Feedback360 {
  evaluator: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  evaluatorType: 'manager' | 'peer' | 'subordinate' | 'self' | 'customer';
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  overallRating?: number;
  submittedAt: string;
}

export interface Reward {
  type: 'bonus' | 'promotion' | 'recognition' | 'training' | 'other';
  description?: string;
  amount?: number;
  currency?: string;
  grantedAt?: string;
  grantedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export interface DevelopmentPlan {
  areas: DevelopmentArea[];
  trainingNeeds: TrainingNeed[];
}

export interface DevelopmentArea {
  area: string;
  currentLevel: number;
  targetLevel: number;
  actionPlan: string;
  timeline: string;
  resources: string[];
}

export interface TrainingNeed {
  course: string;
  priority: 'low' | 'medium' | 'high';
  estimatedCost?: number;
  timeline: string;
}

export interface PerformanceStats {
  totalEvaluations: number;
  averageScore: number;
  excellentCount: number;
  goodCount: number;
  averageCount: number;
  belowAverageCount: number;
  poorCount: number;
  completedCount: number;
  pendingCount: number;
}

export interface PerformanceFilters {
  employee?: string;
  department?: string;
  status?: string;
  evaluationType?: string;
  year?: number;
  quarter?: number;
}

export interface TopPerformer {
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    department: string;
    position: string;
  };
  averageScore: number;
  evaluationCount: number;
  lastEvaluation: string;
}

export const EVALUATION_TYPES = {
  quarterly: 'Üç Aylık',
  annual: 'Yıllık',
  monthly: 'Aylık',
  project: 'Proje Bazlı',
  custom: 'Özel'
} as const;

export const PERFORMANCE_STATUSES = {
  draft: 'Taslak',
  in_progress: 'Devam Ediyor',
  completed: 'Tamamlandı',
  approved: 'Onaylandı',
  rejected: 'Reddedildi'
} as const;

export const PERFORMANCE_LEVELS = {
  excellent: 'Mükemmel',
  good: 'İyi',
  average: 'Orta',
  below_average: 'Ortanın Altında',
  poor: 'Zayıf'
} as const;

export const KPI_CATEGORIES = {
  productivity: 'Verimlilik',
  quality: 'Kalite',
  leadership: 'Liderlik',
  teamwork: 'Takım Çalışması',
  innovation: 'İnovasyon',
  customer_service: 'Müşteri Hizmetleri',
  technical_skills: 'Teknik Beceriler',
  communication: 'İletişim'
} as const;

export const GOAL_PRIORITIES = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik'
} as const;

export const GOAL_CATEGORIES = {
  personal: 'Kişisel',
  team: 'Takım',
  department: 'Departman',
  company: 'Şirket'
} as const;

export const EVALUATOR_TYPES = {
  manager: 'Yönetici',
  peer: 'Meslektaş',
  subordinate: 'Ast',
  self: 'Kendisi',
  customer: 'Müşteri'
} as const;

export const REWARD_TYPES = {
  bonus: 'Prim',
  promotion: 'Terfi',
  recognition: 'Tanıma',
  training: 'Eğitim',
  other: 'Diğer'
} as const; 