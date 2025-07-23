const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  // Temel Maaş Bilgileri
  baseSalary: {
    type: Number,
    required: true,
    default: 0
  },
  // Çalışma Saatleri
  totalWorkDays: {
    type: Number,
    default: 0
  },
  totalWorkHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  // Maaş Hesaplamaları
  grossSalary: {
    type: Number,
    default: 0
  },
  overtimePay: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  allowance: {
    type: Number,
    default: 0
  },
  // Kesintiler
  deductions: {
    tax: { type: Number, default: 0 },
    socialSecurity: { type: Number, default: 0 },
    healthInsurance: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  totalDeductions: {
    type: Number,
    default: 0
  },
  // Net Maaş
  netSalary: {
    type: Number,
    default: 0
  },
  // Ödeme Bilgileri
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'check'],
    default: 'bank_transfer'
  },
  // İzin ve Devamsızlık
  leaveDays: {
    type: Number,
    default: 0
  },
  absentDays: {
    type: Number,
    default: 0
  },
  lateDays: {
    type: Number,
    default: 0
  },
  // Hesaplama Detayları
  calculationDetails: {
    hourlyRate: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    socialSecurityRate: { type: Number, default: 0 },
    healthInsuranceRate: { type: Number, default: 0 }
  },
  // Notlar ve Açıklamalar
  notes: {
    type: String
  },
  // Onay Bilgileri
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  // Sistem Bilgileri
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for unique employee-month-year combination
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

// Virtual for total gross salary
payrollSchema.virtual('totalGrossSalary').get(function() {
  return this.grossSalary + this.overtimePay + this.bonus + this.allowance;
});

// Virtual for total deductions
payrollSchema.virtual('totalDeductionsCalculated').get(function() {
  return this.deductions.tax + this.deductions.socialSecurity + 
         this.deductions.healthInsurance + this.deductions.other;
});

// Pre-save middleware to calculate totals
payrollSchema.pre('save', function(next) {
  // Calculate total deductions
  this.totalDeductions = this.deductions.tax + this.deductions.socialSecurity + 
                        this.deductions.healthInsurance + this.deductions.other;
  
  // Calculate net salary
  this.netSalary = this.totalGrossSalary - this.totalDeductions;
  
  next();
});

// Static method to calculate payroll for an employee
payrollSchema.statics.calculatePayroll = async function(employeeId, month, year) {
  const employee = await mongoose.model('User').findById(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Get attendance data for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const attendance = await mongoose.model('Attendance').find({
    employee: employeeId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  });

  // Calculate work statistics
  const totalWorkDays = attendance.filter(a => a.status === 'present').length;
  const totalWorkHours = attendance.reduce((sum, a) => sum + (a.totalWorkHours || 0), 0);
  const overtimeHours = attendance.reduce((sum, a) => sum + (a.overtime || 0), 0);
  const leaveDays = attendance.filter(a => a.status === 'on_leave').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;
  const lateDays = attendance.filter(a => a.status === 'late').length;

  // Calculate salary components
  const hourlyRate = employee.baseSalary / 176; // Assuming 176 hours per month
  const overtimeRate = hourlyRate * 1.5; // 1.5x for overtime
  
  const grossSalary = employee.baseSalary;
  const overtimePay = overtimeHours * overtimeRate;
  const bonus = 0; // Can be calculated based on performance
  const allowance = employee.allowance || 0;

  // Calculate deductions (simplified)
  const taxRate = 0.15; // 15% tax
  const socialSecurityRate = 0.14; // 14% social security
  const healthInsuranceRate = 0.05; // 5% health insurance

  const totalGross = grossSalary + overtimePay + bonus + allowance;
  const tax = totalGross * taxRate;
  const socialSecurity = totalGross * socialSecurityRate;
  const healthInsurance = totalGross * healthInsuranceRate;

  return {
    employee: employeeId,
    month,
    year,
    baseSalary: employee.baseSalary,
    totalWorkDays,
    totalWorkHours,
    overtimeHours,
    grossSalary,
    overtimePay,
    bonus,
    allowance,
    deductions: {
      tax,
      socialSecurity,
      healthInsurance,
      other: 0
    },
    totalDeductions: tax + socialSecurity + healthInsurance,
    netSalary: totalGross - (tax + socialSecurity + healthInsurance),
    leaveDays,
    absentDays,
    lateDays,
    calculationDetails: {
      hourlyRate,
      overtimeRate,
      taxRate,
      socialSecurityRate,
      healthInsuranceRate
    }
  };
};

module.exports = mongoose.model('Payroll', payrollSchema); 