const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'testing', 'completed', 'cancelled'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['feature', 'bug', 'improvement', 'documentation', 'testing', 'other'],
    default: 'feature'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    default: 0,
    min: 0
  },
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked_by', 'related'],
      default: 'blocks'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
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
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeEntries: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number,
      min: 0
    },
    description: String,
    isActive: {
      type: Boolean,
      default: false
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

// Virtual for task duration
taskSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.dueDate) return 0;
  const start = new Date(this.startDate);
  const end = new Date(this.dueDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

// Virtual for days remaining
taskSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return 0;
  if (!this.dueDate) return null;
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return false;
  if (!this.dueDate) return false;
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  return today > dueDate;
});

// Virtual for total time spent
taskSchema.virtual('totalTimeSpent').get(function() {
  return this.timeEntries.reduce((total, entry) => {
    if (entry.duration) return total + entry.duration;
    return total;
  }, 0);
});

// Virtual for current active time entry
taskSchema.virtual('activeTimeEntry').get(function() {
  return this.timeEntries.find(entry => entry.isActive);
});

module.exports = mongoose.model('Task', taskSchema); 