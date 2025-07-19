const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, department, role, search } = req.query;
    
    let query = {};
    
    if (department) {
      query.department = department;
    }
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Get single user
router.get('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Update user
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json({ message: 'Kullanıcı başarıyla güncellendi', user });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Bu email zaten kullanımda' });
    } else {
      res.status(400).json({ message: 'Kullanıcı güncellenirken hata', error: error.message });
    }
  }
});

// Update user status (activate/deactivate)
router.patch('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json({ 
      message: `Kullanıcı ${isActive ? 'aktif edildi' : 'deaktif edildi'}`, 
      user 
    });
  } catch (error) {
    res.status(400).json({ message: 'Kullanıcı durumu güncellenirken hata', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Kendi hesabınızı silemezsiniz' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Change password
router.patch('/:id/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Users can only change their own password, or admin can change any password
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmuyor' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Check current password if not admin
    if (req.user.role !== 'admin') {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mevcut şifre yanlış' });
      }
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    res.status(400).json({ message: 'Şifre güncellenirken hata', error: error.message });
  }
});

module.exports = router; 