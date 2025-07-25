const express = require('express');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const StockCount = require('../models/StockCount');
const { auth, authorize } = require('../middleware/auth');
const socketManager = require('../utils/socket');

const router = express.Router();

// Get all inventory transactions
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, product, reason, startDate, endDate } = req.query;
    
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (product) {
      query.product = product;
    }
    
    if (reason) {
      query.reason = reason;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Inventory.find(query)
      .populate('product', 'name sku category')
      .populate('performedBy', 'name email')
      .populate('approvedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Inventory.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Get inventory transaction by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Inventory.findById(req.params.id)
      .populate('product', 'name sku category price cost')
      .populate('performedBy', 'name email')
      .populate('approvedBy', 'name email');
    
    if (!transaction) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Create stock in transaction
router.post('/stock-in', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { productId, quantity, reference, referenceNumber, reason, notes, unitCost, location } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    const previousStock = product.stock;
    const newStock = previousStock + quantity;
    const totalCost = unitCost ? unitCost * quantity : null;
    
    // Create inventory transaction
    const transaction = new Inventory({
      product: productId,
      type: 'in',
      quantity,
      previousStock,
      newStock,
      reference,
      referenceNumber,
      location: { to: location },
      reason,
      notes,
      unitCost,
      totalCost,
      performedBy: req.user.id
    });
    
    await transaction.save();
    
    // Update product stock
    product.stock = newStock;
    await product.save();
    
    // Send real-time notification
    socketManager.sendInventoryUpdate(productId, 'stock_in', quantity, newStock);
    
    res.status(201).json({ 
      message: 'Stok girişi başarıyla kaydedildi', 
      transaction,
      updatedProduct: product
    });
  } catch (error) {
    res.status(400).json({ message: 'Stok girişi kaydedilirken hata', error: error.message });
  }
});

// Create stock out transaction
router.post('/stock-out', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { productId, quantity, reference, referenceNumber, reason, notes, location } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Yetersiz stok' });
    }
    
    const previousStock = product.stock;
    const newStock = previousStock - quantity;
    
    // Create inventory transaction
    const transaction = new Inventory({
      product: productId,
      type: 'out',
      quantity,
      previousStock,
      newStock,
      reference,
      referenceNumber,
      location: { from: location },
      reason,
      notes,
      performedBy: req.user.id
    });
    
    await transaction.save();
    
    // Update product stock
    product.stock = newStock;
    await product.save();
    
    // Send real-time notification
    socketManager.sendInventoryUpdate(productId, 'stock_out', quantity, newStock);
    
    res.status(201).json({ 
      message: 'Stok çıkışı başarıyla kaydedildi', 
      transaction,
      updatedProduct: product
    });
  } catch (error) {
    res.status(400).json({ message: 'Stok çıkışı kaydedilirken hata', error: error.message });
  }
});

// Create stock transfer transaction
router.post('/stock-transfer', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { productId, quantity, fromLocation, toLocation, reference, referenceNumber, notes } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    const previousStock = product.stock;
    const newStock = previousStock; // Transfer doesn't change total stock
    
    // Create inventory transaction
    const transaction = new Inventory({
      product: productId,
      type: 'transfer',
      quantity,
      previousStock,
      newStock,
      reference,
      referenceNumber,
      location: { from: fromLocation, to: toLocation },
      reason: 'transfer',
      notes,
      performedBy: req.user.id
    });
    
    await transaction.save();
    
    // Send real-time notification
    socketManager.sendInventoryUpdate(productId, 'stock_transfer', quantity, newStock);
    
    res.status(201).json({ 
      message: 'Stok transferi başarıyla kaydedildi', 
      transaction
    });
  } catch (error) {
    res.status(400).json({ message: 'Stok transferi kaydedilirken hata', error: error.message });
  }
});

// Create stock adjustment transaction
router.post('/stock-adjustment', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { productId, quantity, reason, notes } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    const previousStock = product.stock;
    const newStock = quantity; // Direct adjustment to specified quantity
    
    // Create inventory transaction
    const transaction = new Inventory({
      product: productId,
      type: 'adjustment',
      quantity: Math.abs(newStock - previousStock),
      previousStock,
      newStock,
      reference: 'Stock Adjustment',
      referenceNumber: `ADJ-${Date.now()}`,
      reason,
      notes,
      performedBy: req.user.id
    });
    
    await transaction.save();
    
    // Update product stock
    product.stock = newStock;
    await product.save();
    
    // Send real-time notification
    socketManager.sendInventoryUpdate(productId, 'stock_adjustment', quantity, newStock);
    
    res.status(201).json({ 
      message: 'Stok düzeltmesi başarıyla kaydedildi', 
      transaction,
      updatedProduct: product
    });
  } catch (error) {
    res.status(400).json({ message: 'Stok düzeltmesi kaydedilirken hata', error: error.message });
  }
});

// Get inventory statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const stats = await Inventory.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $ifNull: ['$totalCost', 0] } }
        }
      }
    ]);
    
    const totalTransactions = await Inventory.countDocuments(dateFilter);
    const lowStockProducts = await Product.countDocuments({ $expr: { $lte: ['$stock', '$minStock'] } });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    
    res.json({
      stats,
      totalTransactions,
      lowStockProducts,
      outOfStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Get product inventory history
router.get('/product/:productId/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const transactions = await Inventory.find({ product: req.params.productId })
      .populate('performedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Inventory.countDocuments({ product: req.params.productId });
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router; 