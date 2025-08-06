const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Get all assets with pagination and filtering
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, condition, assignedTo, search } = req.query;
    
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (condition) query.condition = condition;
    if (assignedTo) query['location.assignedTo'] = assignedTo;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'specifications.brand': { $regex: search, $options: 'i' } },
        { 'specifications.model': { $regex: search, $options: 'i' } }
      ];
    }

    const assets = await Asset.find(query)
      .populate('location.assignedTo', 'name email')
      .populate('documents.uploadedBy', 'name email')
      .populate('maintenance.maintenanceHistory.performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Asset.countDocuments(query);

    res.json({
      assets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single asset
router.get('/:id', auth, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('location.assignedTo', 'name email phone')
      .populate('documents.uploadedBy', 'name email')
      .populate('maintenance.maintenanceHistory.performedBy', 'name email');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new asset
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const asset = new Asset(req.body);
    await asset.save();

    // Populate references
    await asset.populate('location.assignedTo', 'name email');
    await asset.populate('documents.uploadedBy', 'name email');

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update asset
router.put('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('location.assignedTo', 'name email')
    .populate('documents.uploadedBy', 'name email');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete asset (soft delete)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add maintenance record
router.post('/:id/maintenance', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { type, description, cost, nextMaintenance } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    asset.maintenance.maintenanceHistory.push({
      date: new Date(),
      type,
      description,
      cost: cost || 0,
      performedBy: req.user.id,
      nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null
    });

    // Update last maintenance date
    asset.maintenance.lastMaintenance = new Date();

    // Update next maintenance date if provided
    if (nextMaintenance) {
      asset.maintenance.nextMaintenance = new Date(nextMaintenance);
    }

    await asset.save();
    await asset.populate('maintenance.maintenanceHistory.performedBy', 'name email');

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update asset status
router.patch('/:id/status', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { status, condition } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (condition) updateData.condition = condition;

    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('location.assignedTo', 'name email')
    .populate('documents.uploadedBy', 'name email');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign asset to user
router.patch('/:id/assign', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { 'location.assignedTo': assignedTo },
      { new: true }
    )
    .populate('location.assignedTo', 'name email')
    .populate('documents.uploadedBy', 'name email');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get asset statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await Asset.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalAssets: { $sum: 1 },
          activeAssets: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          maintenanceAssets: {
            $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
          },
          retiredAssets: {
            $sum: { $cond: [{ $eq: ['$status', 'retired'] }, 1, 0] }
          },
          totalValue: { $sum: '$financial.currentValue' },
          totalPurchaseValue: { $sum: '$financial.purchasePrice' }
        }
      }
    ]);

    const categoryStats = await Asset.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const conditionStats = await Asset.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$condition', count: { $sum: 1 } } }
    ]);

    const maintenanceDue = await Asset.find({
      isActive: true,
      'maintenance.nextMaintenance': { $lte: new Date() }
    })
    .populate('location.assignedTo', 'name email')
    .sort({ 'maintenance.nextMaintenance': 1 })
    .limit(10);

    const warrantyExpiring = await Asset.find({
      isActive: true,
      'financial.warrantyExpiry': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    })
    .populate('location.assignedTo', 'name email')
    .sort({ 'financial.warrantyExpiry': 1 })
    .limit(10);

    res.json({
      overview: stats[0] || {
        totalAssets: 0,
        activeAssets: 0,
        maintenanceAssets: 0,
        retiredAssets: 0,
        totalValue: 0,
        totalPurchaseValue: 0
      },
      categoryStats,
      conditionStats,
      maintenanceDue,
      warrantyExpiring
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my assigned assets
router.get('/my/assets', auth, async (req, res) => {
  try {
    const assets = await Asset.find({
      isActive: true,
      'location.assignedTo': req.user.id
    })
    .populate('location.assignedTo', 'name email')
    .populate('documents.uploadedBy', 'name email')
    .sort({ createdAt: -1 });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search assets
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    
    const assets = await Asset.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
        { 'specifications.brand': { $regex: query, $options: 'i' } },
        { 'specifications.model': { $regex: query, $options: 'i' } },
        { 'specifications.serialNumber': { $regex: query, $options: 'i' } }
      ]
    })
    .populate('location.assignedTo', 'name email')
    .limit(20);

    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 