const mongoose = require('mongoose');

const stockCountSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['full', 'partial', 'cycle'],
    default: 'full'
  },
  location: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: false
  },
  scheduledDate: {
    type: Date,
    required: false
  },
  startDate: {
    type: Date,
    required: false
  },
  endDate: {
    type: Date,
    required: false
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    expectedQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    actualQuantity: {
      type: Number,
      required: false,
      min: 0
    },
    variance: {
      type: Number,
      required: false
    },
    notes: {
      type: String,
      required: false
    },
    countedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    countedAt: {
      type: Date,
      required: false
    }
  }],
  totalItems: {
    type: Number,
    default: 0
  },
  countedItems: {
    type: Number,
    default: 0
  },
  totalVariance: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  varianceValue: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Virtual for progress percentage
stockCountSchema.virtual('progressPercentage').get(function() {
  if (this.totalItems === 0) return 0;
  return Math.round((this.countedItems / this.totalItems) * 100);
});

// Virtual for status text
stockCountSchema.virtual('statusText').get(function() {
  const statusMap = {
    draft: 'Taslak',
    in_progress: 'Devam Ediyor',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi'
  };
  return statusMap[this.status] || this.status;
});

stockCountSchema.set('toJSON', { virtuals: true });

// Index for better performance
stockCountSchema.index({ status: 1, createdAt: -1 });
stockCountSchema.index({ scheduledDate: 1 });
stockCountSchema.index({ createdBy: 1 });

module.exports = mongoose.model('StockCount', stockCountSchema); 