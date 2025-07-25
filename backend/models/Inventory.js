const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['in', 'out', 'transfer', 'count', 'adjustment'],
    default: 'in'
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  reference: {
    type: String,
    required: true
  },
  referenceNumber: {
    type: String,
    required: true
  },
  location: {
    from: {
      type: String,
      required: false
    },
    to: {
      type: String,
      required: false
    }
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'purchase', 'sale', 'return', 'damage', 'expiry', 
      'transfer', 'count', 'adjustment', 'theft', 'other'
    ]
  },
  notes: {
    type: String,
    required: false
  },
  unitCost: {
    type: Number,
    required: false
  },
  totalCost: {
    type: Number,
    required: false
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Index for better performance
inventorySchema.index({ product: 1, createdAt: -1 });
inventorySchema.index({ type: 1, createdAt: -1 });
inventorySchema.index({ referenceNumber: 1 });

module.exports = mongoose.model('Inventory', inventorySchema); 