const mongoose = require('mongoose');

const customerInteractionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'visit', 'quote', 'order', 'complaint', 'follow_up', 'other'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  outcome: {
    type: String,
    enum: ['positive', 'negative', 'neutral', 'pending'],
    default: 'neutral'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  duration: {
    type: Number, // in minutes
    required: false
  },
  scheduledDate: {
    type: Date,
    required: false
  },
  completedDate: {
    type: Date,
    required: false
  },
  nextAction: {
    type: String,
    required: false
  },
  nextActionDate: {
    type: Date,
    required: false
  },
  attachments: [{
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
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for interaction status
customerInteractionSchema.virtual('status').get(function() {
  if (this.isCompleted) return 'completed';
  if (this.scheduledDate && this.scheduledDate > new Date()) return 'scheduled';
  return 'pending';
});

// Virtual for interaction status text
customerInteractionSchema.virtual('statusText').get(function() {
  const statusMap = {
    completed: 'Tamamlandı',
    scheduled: 'Planlandı',
    pending: 'Bekliyor'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for type text
customerInteractionSchema.virtual('typeText').get(function() {
  const typeMap = {
    call: 'Telefon Görüşmesi',
    email: 'E-posta',
    meeting: 'Toplantı',
    visit: 'Ziyaret',
    quote: 'Teklif',
    order: 'Sipariş',
    complaint: 'Şikayet',
    follow_up: 'Takip',
    other: 'Diğer'
  };
  return typeMap[this.type] || this.type;
});

// Virtual for outcome text
customerInteractionSchema.virtual('outcomeText').get(function() {
  const outcomeMap = {
    positive: 'Pozitif',
    negative: 'Negatif',
    neutral: 'Nötr',
    pending: 'Bekliyor'
  };
  return outcomeMap[this.outcome] || this.outcome;
});

// Virtual for priority text
customerInteractionSchema.virtual('priorityText').get(function() {
  const priorityMap = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
    urgent: 'Acil'
  };
  return priorityMap[this.priority] || this.priority;
});

customerInteractionSchema.set('toJSON', { virtuals: true });

// Index for better performance
customerInteractionSchema.index({ customer: 1, createdAt: -1 });
customerInteractionSchema.index({ type: 1 });
customerInteractionSchema.index({ performedBy: 1 });
customerInteractionSchema.index({ scheduledDate: 1 });
customerInteractionSchema.index({ isCompleted: 1 });

module.exports = mongoose.model('CustomerInteraction', customerInteractionSchema); 