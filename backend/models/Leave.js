const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // İzin Türü
  leaveType: {
    type: String,
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid', 'other'],
    required: true
  },
  // İzin Detayları
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true,
    min: 0.5,
    max: 365
  },
  // İzin Durumu
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  // İzin Açıklaması
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  // Doktor Raporu (Hastalık izni için)
  medicalCertificate: {
    hasCertificate: { type: Boolean, default: false },
    certificateDate: Date,
    certificateNumber: String,
    hospital: String,
    doctor: String
  },
  // Onay Bilgileri
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  approvalNotes: {
    type: String,
    maxlength: 500
  },
  // İzin Bakiye Bilgileri
  leaveBalance: {
    annual: { type: Number, default: 0 },
    sick: { type: Number, default: 0 },
    personal: { type: Number, default: 0 },
    maternity: { type: Number, default: 0 },
    paternity: { type: Number, default: 0 }
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
  },
  // İzin Kategorisi
  category: {
    type: String,
    enum: ['paid', 'unpaid', 'half_paid'],
    default: 'paid'
  },
  // Aciliyet Seviyesi
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // İzin Süresi (Saat cinsinden)
  hours: {
    type: Number,
    default: 0
  },
  // İzin Saatleri (Yarım gün izinler için)
  startTime: {
    type: String,
    default: '09:00'
  },
  endTime: {
    type: String,
    default: '17:00'
  },
  // İzin Yerleşimi
  location: {
    type: String,
    enum: ['office', 'home', 'travel', 'other'],
    default: 'office'
  },
  // İletişim Bilgileri
  contactInfo: {
    phone: String,
    email: String,
    emergencyContact: String
  },
  // İzin Sonrası Rapor
  returnReport: {
    submitted: { type: Boolean, default: false },
    submittedAt: Date,
    report: String
  }
}, {
  timestamps: true
});

// Compound index for employee and date range
leaveSchema.index({ employee: 1, startDate: 1, endDate: 1 });

// Virtual for leave duration in days
leaveSchema.virtual('durationInDays').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
});

// Virtual for leave type label
leaveSchema.virtual('leaveTypeLabel').get(function() {
  const labels = {
    annual: 'Yıllık İzin',
    sick: 'Hastalık İzni',
    personal: 'Mazeret İzni',
    maternity: 'Doğum İzni',
    paternity: 'Babalar İzni',
    unpaid: 'Ücretsiz İzin',
    other: 'Diğer'
  };
  return labels[this.leaveType] || this.leaveType;
});

// Virtual for status label
leaveSchema.virtual('statusLabel').get(function() {
  const labels = {
    pending: 'Bekliyor',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    cancelled: 'İptal Edildi'
  };
  return labels[this.status] || this.status;
});

// Pre-save middleware to calculate total days
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.totalDays = diffDays + 1; // Include both start and end dates
  }
  next();
});

// Static method to check leave conflicts
leaveSchema.statics.checkConflicts = async function(employeeId, startDate, endDate, excludeId = null) {
  const query = {
    employee: employeeId,
    status: { $in: ['pending', 'approved'] },
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const conflicts = await this.find(query);
  return conflicts;
};

// Static method to calculate leave balance
leaveSchema.statics.calculateLeaveBalance = async function(employeeId, year) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);

  const leaves = await this.find({
    employee: employeeId,
    startDate: { $gte: startOfYear },
    endDate: { $lte: endOfYear },
    status: 'approved'
  });

  const balance = {
    annual: 0,
    sick: 0,
    personal: 0,
    maternity: 0,
    paternity: 0
  };

  leaves.forEach(leave => {
    if (balance.hasOwnProperty(leave.leaveType)) {
      balance[leave.leaveType] += leave.totalDays;
    }
  });

  return balance;
};

// Static method to get leave statistics
leaveSchema.statics.getLeaveStats = async function(filters = {}) {
  const matchStage = {};
  
  if (filters.year) {
    const startOfYear = new Date(filters.year, 0, 1);
    const endOfYear = new Date(filters.year, 11, 31);
    matchStage.startDate = { $gte: startOfYear, $lte: endOfYear };
  }
  
  if (filters.department) {
    matchStage['employee.department'] = filters.department;
  }
  
  if (filters.status) {
    matchStage.status = filters.status;
  }

  const stats = await this.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'employee',
        foreignField: '_id',
        as: 'employee'
      }
    },
    { $unwind: '$employee' },
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalLeaves: { $sum: 1 },
        totalDays: { $sum: '$totalDays' },
        pendingLeaves: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approvedLeaves: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        rejectedLeaves: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        cancelledLeaves: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        annualLeaves: {
          $sum: { $cond: [{ $eq: ['$leaveType', 'annual'] }, '$totalDays', 0] }
        },
        sickLeaves: {
          $sum: { $cond: [{ $eq: ['$leaveType', 'sick'] }, '$totalDays', 0] }
        },
        personalLeaves: {
          $sum: { $cond: [{ $eq: ['$leaveType', 'personal'] }, '$totalDays', 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalLeaves: 0,
    totalDays: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    cancelledLeaves: 0,
    annualLeaves: 0,
    sickLeaves: 0,
    personalLeaves: 0
  };
};

module.exports = mongoose.model('Leave', leaveSchema); 