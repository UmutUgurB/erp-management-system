const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { performanceMonitor } = require('../utils/performance');
const { logger } = require('../utils/logger');

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için admin yetkisi gereklidir'
    });
  }
  next();
};

// Get performance metrics
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    
    logger.info('Performance metrics requested', {
      userId: req.user.id
    });

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Metrics retrieval error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Metrikler alınamadı'
    });
  }
});

// Reset performance metrics
router.post('/reset', auth, adminOnly, async (req, res) => {
  try {
    performanceMonitor.resetMetrics();
    
    logger.info('Performance metrics reset', {
      userId: req.user.id
    });

    res.json({
      success: true,
      message: 'Metrikler sıfırlandı'
    });
  } catch (error) {
    logger.error('Metrics reset error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Metrikler sıfırlanamadı'
    });
  }
});

// Get system information
router.get('/system', auth, adminOnly, async (req, res) => {
  try {
    const os = require('os');
    
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
        free: Math.round(os.freemem() / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
        used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024 * 100) / 100 + ' GB'
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model
      },
      uptime: {
        system: Math.floor(os.uptime() / 3600) + ' hours',
        process: Math.floor(process.uptime() / 3600) + ' hours'
      },
      environment: process.env.NODE_ENV || 'development'
    };

    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    logger.error('System info error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Sistem bilgileri alınamadı'
    });
  }
});

module.exports = router; 