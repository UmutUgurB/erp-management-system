export interface Leave {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
  };
  leaveType: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid' | 'other';
  startDate: string;
  endDate: string;
  totalDays: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  category: 'paid' | 'unpaid' | 'half_paid';
  hours?: number;
  startTime?: string;
  endTime?: string;
  location?: 'office' | 'home' | 'travel' | 'other';
  contactInfo?: {
    phone?: string;
    email?: string;
    emergencyContact?: string;
  };
  medicalCertificate?: {
    hasCertificate: boolean;
    certificateDate?: string;
    certificateNumber?: string;
    hospital?: string;
    doctor?: string;
  };
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  approvalNotes?: string;
  leaveBalance?: {
    annual: number;
    sick: number;
    personal: number;
    maternity: number;
    paternity: number;
  };
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
  returnReport?: {
    submitted: boolean;
    submittedAt?: string;
    report?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LeaveStats {
  totalLeaves: number;
  totalDays: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  cancelledLeaves: number;
  annualLeaves: number;
  sickLeaves: number;
  personalLeaves: number;
}

export interface LeaveFilters {
  employee?: string;
  department?: string;
  status?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
}

export interface LeaveBalance {
  used: {
    annual: number;
    sick: number;
    personal: number;
    maternity: number;
    paternity: number;
  };
  available: {
    annual: number;
    sick: number;
    personal: number;
    maternity: number;
    paternity: number;
  };
  total: {
    annual: number;
    sick: number;
    personal: number;
    maternity: number;
    paternity: number;
  };
}

export interface LeaveFormData {
  employee: string;
  leaveType: Leave['leaveType'];
  startDate: string;
  endDate: string;
  reason: string;
  urgency: Leave['urgency'];
  category: Leave['category'];
  hours?: number;
  startTime?: string;
  endTime?: string;
  location?: Leave['location'];
  contactInfo?: Leave['contactInfo'];
  medicalCertificate?: Leave['medicalCertificate'];
}

export const LEAVE_TYPES = {
  annual: 'Yıllık İzin',
  sick: 'Hastalık İzni',
  personal: 'Mazeret İzni',
  maternity: 'Doğum İzni',
  paternity: 'Babalar İzni',
  unpaid: 'Ücretsiz İzin',
  other: 'Diğer'
} as const;

export const LEAVE_STATUSES = {
  pending: 'Bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  cancelled: 'İptal Edildi'
} as const;

export const LEAVE_URGENCIES = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  urgent: 'Acil'
} as const;

export const LEAVE_CATEGORIES = {
  paid: 'Ücretli',
  unpaid: 'Ücretsiz',
  half_paid: 'Yarı Ücretli'
} as const;

export const LEAVE_LOCATIONS = {
  office: 'Ofis',
  home: 'Ev',
  travel: 'Seyahat',
  other: 'Diğer'
} as const; 