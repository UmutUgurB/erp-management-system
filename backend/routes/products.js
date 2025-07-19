const express = require('express');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, stockStatus } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (stockStatus === 'low') {
      query.$expr = { $lte: ['$stock', '$minStock'] };
    } else if (stockStatus === 'out') {
      query.stock = 0;
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Get single product
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Create product
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Ürün başarıyla oluşturuldu', product });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Bu SKU zaten mevcut' });
    } else {
      res.status(400).json({ message: 'Ürün oluşturulurken hata', error: error.message });
    }
  }
});

// Update product
router.put('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    res.json({ message: 'Ürün başarıyla güncellendi', product });
  } catch (error) {
    res.status(400).json({ message: 'Ürün güncellenirken hata', error: error.message });
  }
});

// Delete product
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    res.json({ message: 'Ürün başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Update stock
router.patch('/:id/stock', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    res.json({ message: 'Stok başarıyla güncellendi', product });
  } catch (error) {
    res.status(400).json({ message: 'Stok güncellenirken hata', error: error.message });
  }
});

module.exports = router; 