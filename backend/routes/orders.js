const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');
const socketManager = require('../utils/socket');
const emailService = require('../utils/email');

const router = express.Router();

// Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('createdBy', 'name email');
      
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { customer, items, paymentMethod, notes } = req.body;
    
    // Calculate total and validate items
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Ürün bulunamadı: ${item.product}` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Yetersiz stok: ${product.name} (Mevcut: ${product.stock}, İstenen: ${item.quantity})` 
        });
      }
      
      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
      
      totalAmount += product.price * item.quantity;
    }
    
    const order = new Order({
      customer,
      items: validatedItems,
      totalAmount,
      paymentMethod,
      notes,
      createdBy: req.user._id
    });
    
    await order.save();
    
    // Update product stocks
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    await order.populate('items.product', 'name sku');
    
    // Send real-time notifications
    socketManager.sendNewOrderNotification(order);
    
    // Send email confirmation
    try {
      await emailService.sendOrderConfirmationEmail(req.user, order);
    } catch (error) {
      console.error('Email sending failed:', error);
    }
    
    res.status(201).json({ message: 'Sipariş başarıyla oluşturuldu', order });
  } catch (error) {
    res.status(400).json({ message: 'Sipariş oluşturulurken hata', error: error.message });
  }
});

// Update order status
router.patch('/:id/status', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('items.product', 'name sku');
    
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
    
    // Send real-time notification
    socketManager.sendOrderUpdate(order.createdBy.toString(), order._id.toString(), status, order);
    
    // Send email notification
    try {
      await emailService.sendOrderStatusUpdateEmail(req.user, order);
    } catch (error) {
      console.error('Email sending failed:', error);
    }
    
    res.json({ message: 'Sipariş durumu güncellendi', order });
  } catch (error) {
    res.status(400).json({ message: 'Sipariş durumu güncellenirken hata', error: error.message });
  }
});

// Update payment status
router.patch('/:id/payment', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    ).populate('items.product', 'name sku');
    
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
    
    res.json({ message: 'Ödeme durumu güncellendi', order });
  } catch (error) {
    res.status(400).json({ message: 'Ödeme durumu güncellenirken hata', error: error.message });
  }
});

// Delete order (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
    
    // Return stock if order is cancelled
    if (order.status !== 'delivered') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
    }
    
    await Order.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Sipariş başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router; 