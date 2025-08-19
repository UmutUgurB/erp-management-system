const express = require('express');
const router = express.Router();
const DataExporter = require('../utils/dataExporter');
const { logger } = require('../utils/logger');
const { ResponseFormatter } = require('../utils/responseFormatter');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const dataExporter = new DataExporter();

// Get supported export formats
router.get('/formats', (req, res) => {
  try {
    res.json(ResponseFormatter.success('Export formats retrieved successfully', {
      formats: dataExporter.supportedFormats,
      description: 'Available export formats for data export'
    }));
  } catch (error) {
    logger.error('Error getting export formats:', error);
    res.status(500).json(ResponseFormatter.error('Failed to get export formats', error.message));
  }
});

// Export employees data
router.post('/employees', auth, async (req, res) => {
  try {
    const { format, options = {} } = req.body;
    
    if (!format || !dataExporter.supportedFormats.includes(format.toLowerCase())) {
      return res.status(400).json(ResponseFormatter.validationError('Invalid export format', {
        supported: dataExporter.supportedFormats,
        received: format
      }));
    }

    // Mock employee data for demonstration
    const employees = [
      {
        _id: '1',
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '+90 555 123 4567',
        department: 'Yazılım Geliştirme',
        position: 'Senior Developer',
        salary: 15000,
        hireDate: '2022-01-15',
        status: 'Aktif'
      },
      {
        _id: '2',
        name: 'Ayşe Demir',
        email: 'ayse@example.com',
        phone: '+90 555 987 6543',
        department: 'İnsan Kaynakları',
        position: 'HR Manager',
        salary: 12000,
        hireDate: '2021-08-20',
        status: 'Aktif'
      },
      {
        _id: '3',
        name: 'Mehmet Kaya',
        email: 'mehmet@example.com',
        phone: '+90 555 456 7890',
        department: 'Satış',
        position: 'Sales Representative',
        salary: 8000,
        hireDate: '2023-03-10',
        status: 'Aktif'
      }
    ];

    const filepath = await dataExporter.exportEmployees(employees, format, options);
    
    logger.info(`Employee data exported successfully: ${filepath}`);
    
    res.json(ResponseFormatter.success('Employee data exported successfully', {
      filepath,
      format,
      recordCount: employees.length,
      downloadUrl: `/exports/${filepath.split('/').pop()}`
    }));
  } catch (error) {
    logger.error('Error exporting employee data:', error);
    res.status(500).json(ResponseFormatter.error('Failed to export employee data', error.message));
  }
});

// Export products data
router.post('/products', auth, async (req, res) => {
  try {
    const { format, options = {} } = req.body;
    
    if (!format || !dataExporter.supportedFormats.includes(format.toLowerCase())) {
      return res.status(400).json(ResponseFormatter.validationError('Invalid export format', {
        supported: dataExporter.supportedFormats,
        received: format
      }));
    }

    // Mock product data for demonstration
    const products = [
      {
        _id: '1',
        name: 'Laptop Dell XPS 13',
        category: 'Elektronik',
        price: 25000,
        stock: 15,
        description: 'Yüksek performanslı iş laptopu',
        status: 'Aktif'
      },
      {
        _id: '2',
        name: 'iPhone 15 Pro',
        category: 'Telefon',
        price: 45000,
        stock: 8,
        description: 'Apple\'ın en yeni telefon modeli',
        status: 'Aktif'
      },
      {
        _id: '3',
        name: 'Samsung 4K TV',
        category: 'Televizyon',
        price: 18000,
        stock: 12,
        description: '55 inç 4K Ultra HD Smart TV',
        status: 'Aktif'
      }
    ];

    const filepath = await dataExporter.exportProducts(products, format, options);
    
    logger.info(`Product data exported successfully: ${filepath}`);
    
    res.json(ResponseFormatter.success('Product data exported successfully', {
      filepath,
      format,
      recordCount: products.length,
      downloadUrl: `/exports/${filepath.split('/').pop()}`
    }));
  } catch (error) {
    logger.error('Error exporting product data:', error);
    res.status(500).json(ResponseFormatter.error('Failed to export product data', error.message));
  }
});

// Export orders data
router.post('/orders', auth, async (req, res) => {
  try {
    const { format, options = {} } = req.body;
    
    if (!format || !dataExporter.supportedFormats.includes(format.toLowerCase())) {
      return res.status(400).json(ResponseFormatter.validationError('Invalid export format', {
        supported: dataExporter.supportedFormats,
        received: format
      }));
    }

    // Mock order data for demonstration
    const orders = [
      {
        _id: '1',
        customer: { name: 'ABC Şirketi' },
        totalAmount: 35000,
        status: 'Tamamlandı',
        orderDate: '2024-01-15',
        paymentMethod: 'Kredi Kartı'
      },
      {
        _id: '2',
        customer: { name: 'XYZ Ltd.' },
        totalAmount: 28000,
        status: 'Hazırlanıyor',
        orderDate: '2024-01-16',
        paymentMethod: 'Banka Transferi'
      },
      {
        _id: '3',
        customer: { name: 'DEF A.Ş.' },
        totalAmount: 42000,
        status: 'Kargoda',
        orderDate: '2024-01-17',
        paymentMethod: 'Nakit'
      }
    ];

    const filepath = await dataExporter.exportOrders(orders, format, options);
    
    logger.info(`Order data exported successfully: ${filepath}`);
    
    res.json(ResponseFormatter.success('Order data exported successfully', {
      filepath,
      format,
      recordCount: orders.length,
      downloadUrl: `/exports/${filepath.split('/').pop()}`
    }));
  } catch (error) {
    logger.error('Error exporting order data:', error);
    res.status(500).json(ResponseFormatter.error('Failed to export order data', error.message));
  }
});

// Export custom data
router.post('/custom', auth, async (req, res) => {
  try {
    const { data, format, options = {} } = req.body;
    
    if (!data) {
      return res.status(400).json(ResponseFormatter.validationError('Data is required'));
    }
    
    if (!format || !dataExporter.supportedFormats.includes(format.toLowerCase())) {
      return res.status(400).json(ResponseFormatter.validationError('Invalid export format', {
        supported: dataExporter.supportedFormats,
        received: format
      }));
    }

    const filepath = await dataExporter.exportData(data, format, options);
    
    logger.info(`Custom data exported successfully: ${filepath}`);
    
    res.json(ResponseFormatter.success('Custom data exported successfully', {
      filepath,
      format,
      recordCount: Array.isArray(data) ? data.length : 1,
      downloadUrl: `/exports/${filepath.split('/').pop()}`
    }));
  } catch (error) {
    logger.error('Error exporting custom data:', error);
    res.status(500).json(ResponseFormatter.error('Failed to export custom data', error.message));
  }
});

// Export multiple formats in ZIP
router.post('/zip', auth, async (req, res) => {
  try {
    const { data, formats = ['json', 'csv', 'excel'], options = {} } = req.body;
    
    if (!data) {
      return res.status(400).json(ResponseFormatter.validationError('Data is required'));
    }
    
    if (!Array.isArray(formats) || formats.length === 0) {
      return res.status(400).json(ResponseFormatter.validationError('Formats array is required'));
    }

    // Validate formats
    for (const format of formats) {
      if (!dataExporter.supportedFormats.includes(format.toLowerCase())) {
        return res.status(400).json(ResponseFormatter.validationError('Invalid format in formats array', {
          supported: dataExporter.supportedFormats,
          invalid: format
        }));
      }
    }

    const filepath = await dataExporter.exportToZIP(data, options.prefix || 'data', {
      ...options,
      formats
    });
    
    logger.info(`Data exported to ZIP successfully: ${filepath}`);
    
    res.json(ResponseFormatter.success('Data exported to ZIP successfully', {
      filepath,
      formats,
      recordCount: Array.isArray(data) ? data.length : 1,
      downloadUrl: `/exports/${filepath.split('/').pop()}`
    }));
  } catch (error) {
    logger.error('Error exporting data to ZIP:', error);
    res.status(500).json(ResponseFormatter.error('Failed to export data to ZIP', error.message));
  }
});

// Get export statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await dataExporter.getExportStats();
    
    if (!stats) {
      return res.status(500).json(ResponseFormatter.error('Failed to get export statistics'));
    }
    
    res.json(ResponseFormatter.success('Export statistics retrieved successfully', stats));
  } catch (error) {
    logger.error('Error getting export statistics:', error);
    res.status(500).json(ResponseFormatter.error('Failed to get export statistics', error.message));
  }
});

// Clean up old exports
router.delete('/cleanup', auth, async (req, res) => {
  try {
    const { maxAge } = req.query;
    const maxAgeMs = maxAge ? parseInt(maxAge) : 24 * 60 * 60 * 1000; // 24 hours default
    
    await dataExporter.cleanupOldExports(maxAgeMs);
    
    logger.info('Old export files cleaned up successfully');
    
    res.json(ResponseFormatter.success('Old export files cleaned up successfully', {
      maxAge: maxAgeMs,
      message: 'Cleanup completed'
    }));
  } catch (error) {
    logger.error('Error cleaning up old exports:', error);
    res.status(500).json(ResponseFormatter.error('Failed to clean up old exports', error.message));
  }
});

// Download exported file
router.get('/download/:filename', auth, (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(dataExporter.exportPath, filename);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json(ResponseFormatter.notFound('Export file not found'));
    }
    
    // Set appropriate headers for download
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.json':
        contentType = 'application/json';
        break;
      case '.csv':
        contentType = 'text/csv';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.zip':
        contentType = 'application/zip';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
    
    logger.info(`Export file downloaded: ${filename}`);
  } catch (error) {
    logger.error('Error downloading export file:', error);
    res.status(500).json(ResponseFormatter.error('Failed to download export file', error.message));
  }
});

module.exports = router;
