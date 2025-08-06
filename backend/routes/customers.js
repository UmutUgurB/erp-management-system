const express = require('express');
const Customer = require('../models/Customer');
const CustomerInteraction = require('../models/CustomerInteraction');
const { auth, authorize } = require('../middleware/auth');
const socketManager = require('../utils/socket');

const router = express.Router();

// Get all customers
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, type, assignedTo, tags } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const customers = await Customer.find(query)
      .populate('assignedTo', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(query);

    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Get customer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email');
    
    if (!customer) {
      return res.status(404).json({ message: 'Müşteri bulunamadı' });
    }
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Create customer
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const customer = new Customer({
      ...req.body,
      assignedTo: req.body.assignedTo || req.user.id
    });
    
    await customer.save();
    
    // Send real-time notification
    socketManager.sendCustomerUpdate('customer_created', customer);
    
    res.status(201).json({ 
      message: 'Müşteri başarıyla oluşturuldu', 
      customer 
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    } else {
      res.status(400).json({ message: 'Müşteri oluşturulurken hata', error: error.message });
    }
  }
});

// Update customer
router.put('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');
    
    if (!customer) {
      return res.status(404).json({ message: 'Müşteri bulunamadı' });
    }
    
    // Send real-time notification
    socketManager.sendCustomerUpdate('customer_updated', customer);
    
    res.json({ message: 'Müşteri başarıyla güncellendi', customer });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    } else {
      res.status(400).json({ message: 'Müşteri güncellenirken hata', error: error.message });
    }
  }
});

// Delete customer (soft delete)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!customer) {
      return res.status(404).json({ message: 'Müşteri bulunamadı' });
    }
    
    // Send real-time notification
    socketManager.sendCustomerUpdate('customer_deleted', customer);
    
    res.json({ message: 'Müşteri başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Get customer interactions
router.get('/:id/interactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, outcome } = req.query;
    
    let query = { customer: req.params.id };
    
    if (type) {
      query.type = type;
    }
    
    if (outcome) {
      query.outcome = outcome;
    }

    const interactions = await CustomerInteraction.find(query)
      .populate('performedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await CustomerInteraction.countDocuments(query);

    res.json({
      interactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Create customer interaction
router.post('/:id/interactions', auth, async (req, res) => {
  try {
    const interaction = new CustomerInteraction({
      ...req.body,
      customer: req.params.id,
      performedBy: req.user.id
    });
    
    await interaction.save();
    
    // Update customer last contact
    await Customer.findByIdAndUpdate(req.params.id, {
      lastContact: new Date()
    });
    
    // Send real-time notification
    socketManager.sendCustomerUpdate('interaction_created', interaction);
    
    res.status(201).json({ 
      message: 'Etkileşim başarıyla kaydedildi', 
      interaction 
    });
  } catch (error) {
    res.status(400).json({ message: 'Etkileşim kaydedilirken hata', error: error.message });
  }
});

// Update customer interaction
router.put('/:id/interactions/:interactionId', auth, async (req, res) => {
  try {
    const interaction = await CustomerInteraction.findByIdAndUpdate(
      req.params.interactionId,
      req.body,
      { new: true, runValidators: true }
    ).populate('performedBy', 'name email');
    
    if (!interaction) {
      return res.status(404).json({ message: 'Etkileşim bulunamadı' });
    }
    
    // Send real-time notification
    socketManager.sendCustomerUpdate('interaction_updated', interaction);
    
    res.json({ message: 'Etkileşim başarıyla güncellendi', interaction });
  } catch (error) {
    res.status(400).json({ message: 'Etkileşim güncellenirken hata', error: error.message });
  }
});

// Get customer statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const typeStats = await Customer.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalCustomers = await Customer.countDocuments({ isActive: true });
    const activeCustomers = await Customer.countDocuments({ isActive: true, status: 'active' });
    const prospects = await Customer.countDocuments({ isActive: true, status: 'prospect' });
    
    // Recent interactions
    const recentInteractions = await CustomerInteraction.find()
      .populate('customer', 'name email')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      stats,
      typeStats,
      totalCustomers,
      activeCustomers,
      prospects,
      recentInteractions
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Get customers by assigned user
router.get('/assigned/:userId', auth, async (req, res) => {
  try {
    const customers = await Customer.find({ 
      assignedTo: req.params.userId,
      isActive: true 
    }).populate('assignedTo', 'name email');
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Search customers
router.get('/search/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;
    const customers = await Customer.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    }).populate('assignedTo', 'name email');
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router; 