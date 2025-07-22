const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    time: {
      type: Date,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    method: {
      type: String,
      enum: ['manual', 'qr_code', 'fingerprint', 'face_recognition', 'mobile_app'],
      default: 'manual'
    },
    notes: String
  },
  checkOut: {
    time: {
      type: Date
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number]
      }
    },
    method: {
      type: String,
      enum: ['manual', 'qr_code', 'fingerprint', 'face_recognition', 'mobile_app'],
      default: 'manual'
    },
    notes: String
  },
  breakTime: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number, // in minutes
      default: 0
    },
    type: {
      type: String,
      enum: ['lunch', 'coffee', 'personal', 'meeting'],
      default: 'lunch'
    }
  }],
  totalWorkHours: {
    type: Number, // in hours
    default: 0
  },
  totalBreakHours: {
    type: Number, // in hours
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'early_leave', 'half_day', 'work_from_home', 'on_leave'],
    default: 'present'
  },
  overtime: {
    type: Number, // in hours
    default: 0
  },
  lateMinutes: {
    type: Number,
    default: 0
  },
  earlyLeaveMinutes: {
    type: Number,
    default: 0
  },
  workFromHome: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number]
    }
  },
  ipAddress: String,
  deviceInfo: {
    browser: String,
    os: String,
    device: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalNotes: String,
  notes: String,
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('tr-TR');
});

// Virtual for check-in time
attendanceSchema.virtual('checkInTime').get(function() {
  return this.checkIn?.time?.toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
});

// Virtual for check-out time
attendanceSchema.virtual('checkOutTime').get(function() {
  return this.checkOut?.time?.toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
});

// Virtual for total break time
attendanceSchema.virtual('totalBreakTime').get(function() {
  if (!this.breakTime || this.breakTime.length === 0) return 0;
  return this.breakTime.reduce((total, break_) => {
    if (break_.endTime && break_.startTime) {
      return total + (break_.endTime - break_.startTime) / (1000 * 60); // Convert to minutes
    }
    return total;
  }, 0);
});

// Virtual for net work hours
attendanceSchema.virtual('netWorkHours').get(function() {
  return this.totalWorkHours - (this.totalBreakTime / 60);
});

// Indexes
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ 'checkIn.time': 1 });
attendanceSchema.index({ 'checkOut.time': 1 });

// Pre-save middleware to calculate work hours
attendanceSchema.pre('save', function(next) {
  if (this.checkIn?.time && this.checkOut?.time) {
    const checkInTime = new Date(this.checkIn.time);
    const checkOutTime = new Date(this.checkOut.time);
    
    // Calculate total work hours
    const workTimeMs = checkOutTime - checkInTime;
    this.totalWorkHours = workTimeMs / (1000 * 60 * 60); // Convert to hours
    
    // Calculate break time
    if (this.breakTime && this.breakTime.length > 0) {
      this.totalBreakHours = this.totalBreakTime / 60; // Convert to hours
    }
  }
  next();
});

// Static method to get attendance statistics
attendanceSchema.statics.getStats = async function(employeeId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        employee: mongoose.Types.ObjectId(employeeId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
          }
        },
        absentDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
          }
        },
        lateDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'late'] }, 1, 0]
          }
        },
        totalWorkHours: { $sum: '$totalWorkHours' },
        totalOvertime: { $sum: '$overtime' },
        totalLateMinutes: { $sum: '$lateMinutes' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    totalWorkHours: 0,
    totalOvertime: 0,
    totalLateMinutes: 0
  };
};

module.exports = mongoose.model('Attendance', attendanceSchema); 