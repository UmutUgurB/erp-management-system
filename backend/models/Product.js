const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStock: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  unit: {
    type: String,
    required: true,
    enum: ['adet', 'kg', 'lt', 'm', 'm2', 'm3'],
    default: 'adet'
  },
  supplier: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  return ((this.price - this.cost) / this.cost * 100).toFixed(2);
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.minStock) return 'low_stock';
  return 'in_stock';
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema); 