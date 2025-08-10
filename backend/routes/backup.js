const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const backupManager = require('../utils/backup');
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

// Get backup statistics
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const stats = await backupManager.getBackupStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Backup stats error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Backup istatistikleri alınamadı'
    });
  }
});

// List all backups
router.get('/list', auth, adminOnly, async (req, res) => {
  try {
    const backups = await backupManager.listBackups();
    res.json({
      success: true,
      data: { backups }
    });
  } catch (error) {
    logger.error('Backup list error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Backup listesi alınamadı'
    });
  }
});

// Create new backup
router.post('/create', auth, adminOnly, async (req, res) => {
  try {
    const backup = await backupManager.createBackup();
    
    logger.info('Manual backup created', {
      userId: req.user.id,
      filename: backup.filename
    });

    res.json({
      success: true,
      message: 'Backup başarıyla oluşturuldu',
      data: backup
    });
  } catch (error) {
    logger.error('Backup creation error', { 
      error: error.message,
      userId: req.user.id 
    });
    res.status(500).json({
      success: false,
      message: 'Backup oluşturulamadı'
    });
  }
});

// Restore backup
router.post('/restore/:filename', auth, adminOnly, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename
    if (!filename || !filename.startsWith('backup-') || !filename.endsWith('.json')) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz backup dosya adı'
      });
    }

    const result = await backupManager.restoreBackup(filename);
    
    logger.warn('Backup restored', {
      userId: req.user.id,
      filename,
      collections: result.collections
    });

    res.json({
      success: true,
      message: 'Backup başarıyla geri yüklendi',
      data: result
    });
  } catch (error) {
    logger.error('Backup restoration error', { 
      error: error.message,
      userId: req.user.id,
      filename: req.params.filename
    });
    res.status(500).json({
      success: false,
      message: 'Backup geri yüklenemedi'
    });
  }
});

// Delete backup
router.delete('/delete/:filename', auth, adminOnly, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename
    if (!filename || !filename.startsWith('backup-') || !filename.endsWith('.json')) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz backup dosya adı'
      });
    }

    const result = await backupManager.deleteBackup(filename);
    
    logger.info('Backup deleted', {
      userId: req.user.id,
      filename
    });

    res.json({
      success: true,
      message: 'Backup başarıyla silindi',
      data: result
    });
  } catch (error) {
    logger.error('Backup deletion error', { 
      error: error.message,
      userId: req.user.id,
      filename: req.params.filename
    });
    res.status(500).json({
      success: false,
      message: 'Backup silinemedi'
    });
  }
});

// Download backup file
router.get('/download/:filename', auth, adminOnly, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename
    if (!filename || !filename.startsWith('backup-') || !filename.endsWith('.json')) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz backup dosya adı'
      });
    }

    const filepath = require('path').join(backupManager.backupDir, filename);
    const fs = require('fs-extra');
    
    if (!await fs.pathExists(filepath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup dosyası bulunamadı'
      });
    }

    logger.info('Backup downloaded', {
      userId: req.user.id,
      filename
    });

    res.download(filepath);
  } catch (error) {
    logger.error('Backup download error', { 
      error: error.message,
      userId: req.user.id,
      filename: req.params.filename
    });
    res.status(500).json({
      success: false,
      message: 'Backup dosyası indirilemedi'
    });
  }
});

module.exports = router; 