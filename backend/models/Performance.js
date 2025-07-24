const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Değerlendirme Dönemi
  period: {
    year: {
      type: Number,
      required: true
    },
    quarter: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true
    },
    month: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    }
  },
  // Değerlendirme Türü
  evaluationType: {
    type: String,
    enum: ['quarterly', 'annual', 'monthly', 'project', 'custom'],
    required: true
  },
  // Değerlendirme Durumu
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'approved', 'rejected'],
    default: 'draft'
  },
  // KPI'lar
  kpis: [{
    category: {
      type: String,
      required: true,
      enum: ['productivity', 'quality', 'leadership', 'teamwork', 'innovation', 'customer_service', 'technical_skills', 'communication']
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    target: {
      type: Number,
      required: true
    },
    actual: {
      type: Number,
      required: true
    },
    weight: {
      type: Number,
      min: 0,
      max: 100,
      default: 10
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    unit: {
      type: String,
      default: 'percentage'
    }
  }],
  // Hedefler
  goals: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    targetDate: Date,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'overdue'],
      default: 'not_started'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['personal', 'team', 'department', 'company'],
      default: 'personal'
    }
  }],
  // 360 Derece Değerlendirme
  feedback360: [{
    evaluator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    evaluatorType: {
      type: String,
      enum: ['manager', 'peer', 'subordinate', 'self', 'customer'],
      required: true
    },
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Performans Puanı
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  // Performans Seviyesi
  performanceLevel: {
    type: String,
    enum: ['excellent', 'good', 'average', 'below_average', 'poor'],
    default: 'average'
  },
  // Değerlendirici
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Değerlendirme Tarihleri
  evaluationDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedDate: Date,
  // Yorumlar ve Notlar
  managerComments: String,
  employeeComments: String,
  hrComments: String,
  // Onay Bilgileri
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  // Ödül ve Tanıma
  rewards: [{
    type: {
      type: String,
      enum: ['bonus', 'promotion', 'recognition', 'training', 'other']
    },
    description: String,
    amount: Number,
    currency: {
      type: String,
      default: 'TRY'
    },
    grantedAt: Date,
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Gelişim Planı
  developmentPlan: {
    areas: [{
      area: String,
      currentLevel: Number,
      targetLevel: Number,
      actionPlan: String,
      timeline: String,
      resources: [String]
    }],
    trainingNeeds: [{
      course: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      estimatedCost: Number,
      timeline: String
    }]
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

// Compound index for employee and period
performanceSchema.index({ employee: 1, 'period.year': 1, 'period.quarter': 1 });

// Virtual for performance level calculation
performanceSchema.virtual('calculatedLevel').get(function() {
  if (!this.overallScore) return 'average';
  
  if (this.overallScore >= 90) return 'excellent';
  if (this.overallScore >= 80) return 'good';
  if (this.overallScore >= 70) return 'average';
  if (this.overallScore >= 60) return 'below_average';
  return 'poor';
});

// Virtual for KPI completion percentage
performanceSchema.virtual('kpiCompletion').get(function() {
  if (!this.kpis || this.kpis.length === 0) return 0;
  
  const completed = this.kpis.filter(kpi => kpi.score !== undefined && kpi.score !== null).length;
  return Math.round((completed / this.kpis.length) * 100);
});

// Virtual for goal completion percentage
performanceSchema.virtual('goalCompletion').get(function() {
  if (!this.goals || this.goals.length === 0) return 0;
  
  const totalProgress = this.goals.reduce((sum, goal) => sum + goal.progress, 0);
  return Math.round(totalProgress / this.goals.length);
});

// Pre-save middleware to calculate overall score
performanceSchema.pre('save', function(next) {
  if (this.kpis && this.kpis.length > 0) {
    let totalScore = 0;
    let totalWeight = 0;
    
    this.kpis.forEach(kpi => {
      if (kpi.score !== undefined && kpi.score !== null) {
        totalScore += (kpi.score * kpi.weight);
        totalWeight += kpi.weight;
      }
    });
    
    if (totalWeight > 0) {
      this.overallScore = Math.round(totalScore / totalWeight);
      this.performanceLevel = this.calculatedLevel;
    }
  }
  
  if (this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  
  next();
});

// Static method to get performance statistics
performanceSchema.statics.getPerformanceStats = async function(filters = {}) {
  const matchStage = {};
  
  if (filters.year) matchStage['period.year'] = filters.year;
  if (filters.quarter) matchStage['period.quarter'] = filters.quarter;
  if (filters.department) matchStage['employee.department'] = filters.department;
  if (filters.status) matchStage.status = filters.status;

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
        totalEvaluations: { $sum: 1 },
        averageScore: { $avg: '$overallScore' },
        excellentCount: {
          $sum: { $cond: [{ $eq: ['$performanceLevel', 'excellent'] }, 1, 0] }
        },
        goodCount: {
          $sum: { $cond: [{ $eq: ['$performanceLevel', 'good'] }, 1, 0] }
        },
        averageCount: {
          $sum: { $cond: [{ $eq: ['$performanceLevel', 'average'] }, 1, 0] }
        },
        belowAverageCount: {
          $sum: { $cond: [{ $eq: ['$performanceLevel', 'below_average'] }, 1, 0] }
        },
        poorCount: {
          $sum: { $cond: [{ $eq: ['$performanceLevel', 'poor'] }, 1, 0] }
        },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalEvaluations: 0,
    averageScore: 0,
    excellentCount: 0,
    goodCount: 0,
    averageCount: 0,
    belowAverageCount: 0,
    poorCount: 0,
    completedCount: 0,
    pendingCount: 0
  };
};

// Static method to get employee performance history
performanceSchema.statics.getEmployeeHistory = async function(employeeId, years = 3) {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - years;
  
  return await this.find({
    employee: employeeId,
    'period.year': { $gte: startYear }
  }).sort({ 'period.year': -1, 'period.quarter': -1 });
};

// Static method to get top performers
performanceSchema.statics.getTopPerformers = async function(filters = {}, limit = 10) {
  const matchStage = { status: 'completed' };
  
  if (filters.year) matchStage['period.year'] = filters.year;
  if (filters.quarter) matchStage['period.quarter'] = filters.quarter;
  if (filters.department) matchStage['employee.department'] = filters.department;

  return await this.aggregate([
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
        _id: '$employee._id',
        employee: { $first: '$employee' },
        averageScore: { $avg: '$overallScore' },
        evaluationCount: { $sum: 1 },
        lastEvaluation: { $max: '$evaluationDate' }
      }
    },
    { $sort: { averageScore: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Performance', performanceSchema); 