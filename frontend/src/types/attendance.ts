export interface Attendance {
  _id: string;
  employee: Employee;
  date: string;
  checkIn?: CheckInOut;
  checkOut?: CheckInOut;
  breakTime: BreakTime[];
  totalWorkHours: number;
  totalBreakHours: number;
  status: AttendanceStatus;
  overtime: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workFromHome: boolean;
  location?: Location;
  ipAddress?: string;
  deviceInfo?: DeviceInfo;
  approvedBy?: Employee;
  approvalStatus: ApprovalStatus;
  approvalNotes?: string;
  notes?: string;
  createdBy?: User;
  updatedBy?: User;
  createdAt: string;
  updatedAt: string;
  formattedDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalBreakTime?: number;
  netWorkHours?: number;
}

export interface CheckInOut {
  time: string;
  location: Location;
  method: CheckMethod;
  notes?: string;
}

export interface BreakTime {
  startTime: string;
  endTime?: string;
  duration: number;
  type: BreakType;
}

export interface Location {
  type: 'Point';
  coordinates: number[];
}

export interface DeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
}

export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  department: string;
  position: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export type AttendanceStatus = 
  | 'present' 
  | 'absent' 
  | 'late' 
  | 'early_leave' 
  | 'half_day' 
  | 'work_from_home' 
  | 'on_leave';

export type CheckMethod = 
  | 'manual' 
  | 'qr_code' 
  | 'fingerprint' 
  | 'face_recognition' 
  | 'mobile_app';

export type BreakType = 
  | 'lunch' 
  | 'coffee' 
  | 'personal' 
  | 'meeting';

export type ApprovalStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected';

export interface AttendanceFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  department?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AttendanceStats {
  overview: {
    totalRecords: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    workFromHomeDays: number;
    totalWorkHours: number;
    totalOvertime: number;
    totalLateMinutes: number;
    averageWorkHours: number;
  };
  statusDistribution: Array<{
    _id: AttendanceStatus;
    count: number;
  }>;
  dailyStats: Array<{
    _id: string;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    totalWorkHours: number;
  }>;
}

export interface EmployeeAttendanceStats {
  overview: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalWorkHours: number;
    totalOvertime: number;
    totalLateMinutes: number;
  };
  monthlyStats: Array<{
    _id: string;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalWorkHours: number;
    totalOvertime: number;
  }>;
}

export interface CheckInData {
  employeeId: string;
  location?: Location;
  method?: CheckMethod;
  notes?: string;
}

export interface CheckOutData {
  employeeId: string;
  location?: Location;
  method?: CheckMethod;
  notes?: string;
}

export interface BreakData {
  employeeId: string;
  breakType?: BreakType;
}

export interface AttendanceFormData {
  employee: string;
  date: string;
  checkIn?: CheckInOut;
  checkOut?: CheckInOut;
  breakTime: BreakTime[];
  status: AttendanceStatus;
  overtime: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workFromHome: boolean;
  notes?: string;
  approvalStatus: ApprovalStatus;
  approvalNotes?: string;
} 