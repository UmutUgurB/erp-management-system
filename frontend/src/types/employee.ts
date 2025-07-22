export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  hireDate: string;
  department: Department;
  position: string;
  salary: number;
  status: EmployeeStatus;
  address?: Address;
  emergencyContact?: EmergencyContact;
  skills?: Skill[];
  education?: Education[];
  workExperience?: WorkExperience[];
  documents?: Document[];
  manager?: Employee;
  subordinates?: Employee[];
  permissions?: Permission[];
  notes?: string;
  fullName?: string;
  age?: number;
  yearsOfService?: number;
  createdBy?: User;
  updatedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
}

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface Education {
  degree: string;
  institution: string;
  graduationYear: number;
  field: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Document {
  name: string;
  type: string;
  url: string;
  uploadDate: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export type Department = 
  | 'IT' 
  | 'HR' 
  | 'Finance' 
  | 'Marketing' 
  | 'Sales' 
  | 'Operations' 
  | 'Management';

export type EmployeeStatus = 
  | 'active' 
  | 'inactive' 
  | 'terminated' 
  | 'on_leave';

export type SkillLevel = 
  | 'beginner' 
  | 'intermediate' 
  | 'advanced' 
  | 'expert';

export type Permission = 
  | 'read' 
  | 'write' 
  | 'delete' 
  | 'admin';

export interface EmployeeFilters {
  search?: string;
  department?: Department;
  status?: EmployeeStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeStats {
  overview: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    terminatedEmployees: number;
    onLeaveEmployees: number;
    averageSalary: number;
    totalSalary: number;
  };
  departmentStats: Array<{
    _id: Department;
    count: number;
    averageSalary: number;
  }>;
  recentHires: Employee[];
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  hireDate: string;
  department: Department;
  position: string;
  salary: number;
  address?: Address;
  emergencyContact?: EmergencyContact;
  skills?: Skill[];
  education?: Education[];
  workExperience?: WorkExperience[];
  manager?: string;
  notes?: string;
} 