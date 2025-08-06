const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: false,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: false
    },
    city: {
      type: String,
      required: false
    },
    state: {
      type: String,
      required: false
    },
    zipCode: {
      type: String,
      required: false
    },
    country: {
      type: String,
      required: false,
      default: 'Türkiye'
    }
  },
  type: {
    type: String,
    enum: ['individual', 'corporate', 'wholesale', 'retail'],
    default: 'individual'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'lead'],
    default: 'active'
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    required: false
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  paymentTerms: {
    type: String,
    enum: ['immediate', 'net_15', 'net_30', 'net_60', 'net_90'],
    default: 'net_30'
  },
  taxNumber: {
    type: String,
    required: false
  },
  contactPerson: {
    name: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    position: {
      type: String,
      required: false
    }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  lastContact: {
    type: Date,
    required: false
  },
  nextFollowUp: {
    type: Date,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  if (!addr) return '';
  
  const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country];
  return parts.filter(part => part).join(', ');
});

// Virtual for customer status text
customerSchema.virtual('statusText').get(function() {
  const statusMap = {
    active: 'Aktif',
    inactive: 'Pasif',
    prospect: 'Potansiyel',
    lead: 'Aday'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for customer type text
customerSchema.virtual('typeText').get(function() {
  const typeMap = {
    individual: 'Bireysel',
    corporate: 'Kurumsal',
    wholesale: 'Toptan',
    retail: 'Perakende'
  };
  return typeMap[this.type] || this.type;
});

customerSchema.set('toJSON', { virtuals: true });

// Index for better performance
customerSchema.index({ email: 1 });
customerSchema.index({ name: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ type: 1 });
customerSchema.index({ assignedTo: 1 });
customerSchema.index({ tags: 1 });

module.exports = mongoose.model('Customer', customerSchema); 