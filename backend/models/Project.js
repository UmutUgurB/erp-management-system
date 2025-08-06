const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['internal', 'client', 'maintenance', 'research', 'other'],
    default: 'internal'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  budget: {
    type: Number,
    min: 0
  },
  actualCost: {
    type: Number,
    default: 0,
    min: 0
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['manager', 'developer', 'designer', 'tester', 'analyst', 'other'],
      default: 'other'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  documents: [{
    name: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

// Virtual for actual duration
projectSchema.virtual('actualDuration').get(function() {
  if (!this.actualStartDate || !this.actualEndDate) return 0;
  const start = new Date(this.actualStartDate);
  const end = new Date(this.actualEndDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

// Virtual for days remaining
projectSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return 0;
  const today = new Date();
  const endDate = new Date(this.endDate);
  return Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
});

// Virtual for overdue status
projectSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return false;
  const today = new Date();
  const endDate = new Date(this.endDate);
  return today > endDate;
});

// Pre-save middleware to generate project code
projectSchema.pre('save', async function(next) {
  if (this.isNew && !this.code) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Project').countDocuments({
      createdAt: { $gte: new Date(year, 0, 1) }
    });
    this.code = `PRJ-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema); 