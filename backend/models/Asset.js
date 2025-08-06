const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['equipment', 'vehicle', 'building', 'furniture', 'electronics', 'software', 'other'],
    required: true
  },
  type: {
    type: String,
    enum: ['owned', 'leased', 'rented'],
    default: 'owned'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'retired', 'lost', 'stolen'],
    default: 'active'
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    default: 'good'
  },
  location: {
    building: String,
    floor: String,
    room: String,
    department: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  specifications: {
    brand: String,
    model: String,
    serialNumber: String,
    manufacturer: String,
    capacity: String,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inch', 'm'],
        default: 'cm'
      }
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lb'],
        default: 'kg'
      }
    }
  },
  financial: {
    purchasePrice: {
      type: Number,
      min: 0
    },
    currentValue: {
      type: Number,
      min: 0
    },
    depreciationRate: {
      type: Number,
      min: 0,
      max: 100
    },
    purchaseDate: Date,
    warrantyExpiry: Date,
    insuranceExpiry: Date
  },
  maintenance: {
    lastMaintenance: Date,
    nextMaintenance: Date,
    maintenanceInterval: {
      type: Number,
      min: 0
    },
    maintenanceIntervalUnit: {
      type: String,
      enum: ['days', 'weeks', 'months', 'years'],
      default: 'months'
    },
    maintenanceHistory: [{
      date: {
        type: Date,
        required: true
      },
      type: {
        type: String,
        enum: ['preventive', 'corrective', 'emergency'],
        required: true
      },
      description: String,
      cost: {
        type: Number,
        min: 0
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      nextMaintenance: Date
    }]
  },
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
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for asset age
assetSchema.virtual('age').get(function() {
  if (!this.financial.purchaseDate) return 0;
  const purchaseDate = new Date(this.financial.purchaseDate);
  const today = new Date();
  return Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24 * 365));
});

// Virtual for days until next maintenance
assetSchema.virtual('daysUntilMaintenance').get(function() {
  if (!this.maintenance.nextMaintenance) return null;
  const today = new Date();
  const nextMaintenance = new Date(this.maintenance.nextMaintenance);
  return Math.ceil((nextMaintenance - today) / (1000 * 60 * 60 * 24));
});

// Virtual for maintenance overdue
assetSchema.virtual('maintenanceOverdue').get(function() {
  if (!this.maintenance.nextMaintenance) return false;
  const today = new Date();
  const nextMaintenance = new Date(this.maintenance.nextMaintenance);
  return today > nextMaintenance;
});

// Virtual for warranty status
assetSchema.virtual('warrantyStatus').get(function() {
  if (!this.financial.warrantyExpiry) return 'no_warranty';
  const today = new Date();
  const warrantyExpiry = new Date(this.financial.warrantyExpiry);
  if (today > warrantyExpiry) return 'expired';
  if (today > new Date(warrantyExpiry.getTime() - 30 * 24 * 60 * 60 * 1000)) return 'expiring_soon';
  return 'active';
});

// Pre-save middleware to generate asset code
assetSchema.pre('save', async function(next) {
  if (this.isNew && !this.code) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Asset').countDocuments({
      createdAt: { $gte: new Date(year, 0, 1) }
    });
    this.code = `AST-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Asset', assetSchema); 