const express = require('express');
const StockCount = require('../models/StockCount');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const { auth, authorize } = require('../middleware/auth');
const socketManager = require('../utils/socket');

const router = express.Router();

// Get all stock counts
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, search } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const stockCounts = await StockCount.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('approvedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await StockCount.countDocuments(query);

    res.json({
      stockCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Get stock count by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const stockCount = await StockCount.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('approvedBy', 'name email')
      .populate('items.product', 'name sku category price cost stock');
    
    if (!stockCount) {
      return res.status(404).json({ message: 'Stok sayımı bulunamadı' });
    }
    
    res.json(stockCount);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Create new stock count
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { title, description, type, location, category, scheduledDate, items } = req.body;
    
    // Calculate totals
    let totalItems = 0;
    let totalValue = 0;
    
    if (items && items.length > 0) {
      totalItems = items.length;
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (product) {
          totalValue += product.cost * item.expectedQuantity;
        }
      }
    }
    
    const stockCount = new StockCount({
      title,
      description,
      type,
      location,
      category,
      scheduledDate,
      items,
      totalItems,
      totalValue,
      createdBy: req.user.id
    });
    
    await stockCount.save();
    
    res.status(201).json({ 
      message: 'Stok sayımı başarıyla oluşturuldu', 
      stockCount 
    });
  } catch (error) {
    res.status(400).json({ message: 'Stok sayımı oluşturulurken hata', error: error.message });
  }
});

// Update stock count
router.put('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { title, description, type, location, category, scheduledDate, items, assignedTo } = req.body;
    
    // Calculate totals
    let totalItems = 0;
    let totalValue = 0;
    
    if (items && items.length > 0) {
      totalItems = items.length;
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (product) {
          totalValue += product.cost * item.expectedQuantity;
        }
      }
    }
    
    const stockCount = await StockCount.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        type,
        location,
        category,
        scheduledDate,
        items,
        assignedTo,
        totalItems,
        totalValue
      },
      { new: true, runValidators: true }
    );
    
    if (!stockCount) {
      return res.status(404).json({ message: 'Stok sayımı bulunamadı' });
    }
    
    res.json({ message: 'Stok sayımı başarıyla güncellendi', stockCount });
  } catch (error) {
    res.status(400).json({ message: 'Stok sayımı güncellenirken hata', error: error.message });
  }
});

// Start stock count
router.patch('/:id/start', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const stockCount = await StockCount.findByIdAndUpdate(
      req.params.id,
      {
        status: 'in_progress',
        startDate: new Date()
      },
      { new: true }
    );
    
    if (!stockCount) {
      return res.status(404).json({ message: 'Stok sayımı bulunamadı' });
    }
    
    res.json({ message: 'Stok sayımı başlatıldı', stockCount });
  } catch (error) {
    res.status(400).json({ message: 'Stok sayımı başlatılırken hata', error: error.message });
  }
});

// Complete stock count
router.patch('/:id/complete', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const stockCount = await StockCount.findById(req.params.id);
    
    if (!stockCount) {
      return res.status(404).json({ message: 'Stok sayımı bulunamadı' });
    }
    
    if (stockCount.status !== 'in_progress') {
      return res.status(400).json({ message: 'Stok sayımı devam etmiyor' });
    }
    
    // Calculate variances and update product stocks
    let totalVariance = 0;
    let varianceValue = 0;
    let countedItems = 0;
    
    for (const item of stockCount.items) {
      if (item.actualQuantity !== undefined && item.actualQuantity !== null) {
        countedItems++;
        item.variance = item.actualQuantity - item.expectedQuantity;
        totalVariance += Math.abs(item.variance);
        
        const product = await Product.findById(item.product);
        if (product) {
          varianceValue += Math.abs(item.variance) * product.cost;
          
          // Update product stock if there's a variance
          if (item.variance !== 0) {
            const newStock = product.stock + item.variance;
            
            // Create inventory adjustment
            const adjustment = new Inventory({
              product: item.product,
              type: 'adjustment',
              quantity: Math.abs(item.variance),
              previousStock: product.stock,
              newStock: Math.max(0, newStock),
              reference: 'Stock Count Adjustment',
              referenceNumber: `COUNT-${stockCount._id}`,
              reason: item.variance > 0 ? 'count_adjustment_in' : 'count_adjustment_out',
              notes: `Stok sayımı düzeltmesi - ${stockCount.title}`,
              performedBy: req.user.id
            });
            
            await adjustment.save();
            
            // Update product stock
            product.stock = Math.max(0, newStock);
            await product.save();
          }
        }
      }
    }
    
    // Update stock count
    stockCount.status = 'completed';
    stockCount.endDate = new Date();
    stockCount.countedItems = countedItems;
    stockCount.totalVariance = totalVariance;
    stockCount.varianceValue = varianceValue;
    stockCount.approvedBy = req.user.id;
    
    await stockCount.save();
    
    res.json({ message: 'Stok sayımı tamamlandı', stockCount });
  } catch (error) {
    res.status(400).json({ message: 'Stok sayımı tamamlanırken hata', error: error.message });
  }
});

// Update item count
router.patch('/:id/items/:itemIndex', auth, async (req, res) => {
  try {
    const { actualQuantity, notes } = req.body;
    const itemIndex = parseInt(req.params.itemIndex);
    
    const stockCount = await StockCount.findById(req.params.id);
    
    if (!stockCount) {
      return res.status(404).json({ message: 'Stok sayımı bulunamadı' });
    }
    
    if (itemIndex < 0 || itemIndex >= stockCount.items.length) {
      return res.status(400).json({ message: 'Geçersiz ürün indeksi' });
    }
    
    stockCount.items[itemIndex].actualQuantity = actualQuantity;
    stockCount.items[itemIndex].notes = notes;
    stockCount.items[itemIndex].countedBy = req.user.id;
    stockCount.items[itemIndex].countedAt = new Date();
    
    // Update counted items count
    stockCount.countedItems = stockCount.items.filter(item => 
      item.actualQuantity !== undefined && item.actualQuantity !== null
    ).length;
    
    await stockCount.save();
    
    res.json({ message: 'Ürün sayımı güncellendi', stockCount });
  } catch (error) {
    res.status(400).json({ message: 'Ürün sayımı güncellenirken hata', error: error.message });
  }
});

// Cancel stock count
router.patch('/:id/cancel', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const stockCount = await StockCount.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!stockCount) {
      return res.status(404).json({ message: 'Stok sayımı bulunamadı' });
    }
    
    res.json({ message: 'Stok sayımı iptal edildi', stockCount });
  } catch (error) {
    res.status(400).json({ message: 'Stok sayımı iptal edilirken hata', error: error.message });
  }
});

// Get stock count statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await StockCount.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalItems: { $sum: '$totalItems' },
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]);
    
    const totalCounts = await StockCount.countDocuments();
    const activeCounts = await StockCount.countDocuments({ status: 'in_progress' });
    const completedCounts = await StockCount.countDocuments({ status: 'completed' });
    
    res.json({
      stats,
      totalCounts,
      activeCounts,
      completedCounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router; 