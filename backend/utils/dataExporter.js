const fs = require('fs').promises;
const path = require('path');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const csv = require('csv-writer').createObjectCsvWriter;
const archiver = require('archiver');
const { logger } = require('./logger');

class DataExporter {
  constructor() {
    this.supportedFormats = ['json', 'csv', 'excel', 'pdf', 'zip'];
    this.exportPath = path.join(__dirname, '../exports');
    this.ensureExportDirectory();
  }

  async ensureExportDirectory() {
    try {
      await fs.mkdir(this.exportPath, { recursive: true });
    } catch (error) {
      logger.error('Error creating export directory:', error);
    }
  }

  /**
   * Export data to multiple formats
   * @param {Object} data - Data to export
   * @param {string} format - Export format
   * @param {Object} options - Export options
   * @returns {Promise<string>} - Path to exported file
   */
  async exportData(data, format, options = {}) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `export_${options.prefix || 'data'}_${timestamp}`;
      
      switch (format.toLowerCase()) {
        case 'json':
          return await this.exportToJSON(data, filename, options);
        case 'csv':
          return await this.exportToCSV(data, filename, options);
        case 'excel':
          return await this.exportToExcel(data, filename, options);
        case 'pdf':
          return await this.exportToPDF(data, filename, options);
        case 'zip':
          return await this.exportToZIP(data, filename, options);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      logger.error('Export error:', error);
      throw error;
    }
  }

  /**
   * Export data to JSON format
   */
  async exportToJSON(data, filename, options) {
    const filepath = path.join(this.exportPath, `${filename}.json`);
    const jsonData = JSON.stringify(data, null, options.pretty ? 2 : 0);
    
    await fs.writeFile(filepath, jsonData, 'utf8');
    logger.info(`Data exported to JSON: ${filepath}`);
    
    return filepath;
  }

  /**
   * Export data to CSV format
   */
  async exportToCSV(data, filename, options) {
    const filepath = path.join(this.exportPath, `${filename}.csv`);
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('CSV export requires array data');
    }

    const headers = options.headers || Object.keys(data[0]);
    const csvWriter = csv({
      path: filepath,
      header: headers.map(header => ({ id: header, title: header }))
    });

    await csvWriter.writeRecords(data);
    logger.info(`Data exported to CSV: ${filepath}`);
    
    return filepath;
  }

  /**
   * Export data to Excel format
   */
  async exportToExcel(data, filename, options) {
    const filepath = path.join(this.exportPath, `${filename}.xlsx`);
    const workbook = new ExcelJS.Workbook();
    
    // Add metadata
    workbook.creator = options.creator || 'ERP System';
    workbook.lastModifiedBy = options.modifiedBy || 'System';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Create worksheet
    const worksheet = workbook.addWorksheet(options.sheetName || 'Data');
    
    if (Array.isArray(data) && data.length > 0) {
      // Add headers
      const headers = options.headers || Object.keys(data[0]);
      worksheet.addRow(headers);
      
      // Style headers
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add data rows
      data.forEach(row => {
        const rowData = headers.map(header => row[header] || '');
        worksheet.addRow(rowData);
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = Math.max(
          column.header.length + 2,
          ...column.values.map(v => String(v).length)
        );
      });
    } else if (typeof data === 'object') {
      // Handle single object or nested data
      this.addObjectToWorksheet(worksheet, data, options);
    }

    await workbook.xlsx.writeFile(filepath);
    logger.info(`Data exported to Excel: ${filepath}`);
    
    return filepath;
  }

  /**
   * Add object data to Excel worksheet
   */
  addObjectToWorksheet(worksheet, obj, options, prefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.addObjectToWorksheet(worksheet, value, options, fullKey);
      } else {
        worksheet.addRow([fullKey, this.formatValue(value)]);
      }
    });
  }

  /**
   * Format value for Excel
   */
  formatValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
    if (value instanceof Date) return value.toLocaleDateString('tr-TR');
    return String(value);
  }

  /**
   * Export data to PDF format
   */
  async exportToPDF(data, filename, options) {
    const filepath = path.join(this.exportPath, `${filename}.pdf`);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: options.pageSize || 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Add header
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text(options.title || 'Data Export', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Generated on: ${new Date().toLocaleString('tr-TR')}`, { align: 'center' });
      
      doc.moveDown(2);

      // Add content based on data type
      if (Array.isArray(data)) {
        this.addTableToPDF(doc, data, options);
      } else if (typeof data === 'object') {
        this.addObjectToPDF(doc, data, options);
      }

      // Add footer
      doc.fontSize(10)
         .font('Helvetica-Oblique')
         .text(`Page ${doc.bufferedPageRange().count}`, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        logger.info(`Data exported to PDF: ${filepath}`);
        resolve(filepath);
      });

      stream.on('error', reject);
    });
  }

  /**
   * Add table data to PDF
   */
  addTableToPDF(doc, data, options) {
    if (data.length === 0) return;

    const headers = options.headers || Object.keys(data[0]);
    const columnWidth = (doc.page.width - 100) / headers.length;
    
    // Add table headers
    doc.fontSize(12).font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, 50 + (i * columnWidth), doc.y, {
        width: columnWidth,
        align: 'left'
      });
    });

    doc.moveDown();
    doc.fontSize(10).font('Helvetica');

    // Add data rows
    data.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
        doc.fontSize(12).font('Helvetica-Bold');
        headers.forEach((header, i) => {
          doc.text(header, 50 + (i * columnWidth), doc.y, {
            width: columnWidth,
            align: 'left'
          });
        });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica');
      }

      headers.forEach((header, i) => {
        const value = row[header] || '';
        doc.text(String(value), 50 + (i * columnWidth), doc.y, {
          width: columnWidth,
          align: 'left'
        });
      });
      
      doc.moveDown();
    });
  }

  /**
   * Add object data to PDF
   */
  addObjectToPDF(doc, obj, options, prefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        doc.fontSize(12).font('Helvetica-Bold').text(fullKey);
        doc.moveDown(0.5);
        this.addObjectToPDF(doc, value, options, fullKey);
      } else {
        doc.fontSize(10).font('Helvetica-Bold').text(fullKey);
        doc.fontSize(10).font('Helvetica').text(`: ${this.formatValue(value)}`);
        doc.moveDown(0.5);
      }
    });
  }

  /**
   * Export data to ZIP format with multiple formats
   */
  async exportToZIP(data, filename, options) {
    const zipPath = path.join(this.exportPath, `${filename}.zip`);
    
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        logger.info(`Data exported to ZIP: ${zipPath}`);
        resolve(zipPath);
      });

      archive.on('error', reject);
      archive.pipe(output);

      // Add multiple formats to ZIP
      const formats = options.formats || ['json', 'csv', 'excel'];
      
      Promise.all(formats.map(async (format) => {
        try {
          const filepath = await this.exportData(data, format, {
            ...options,
            prefix: `${filename}_${format}`
          });
          archive.file(filepath, { name: path.basename(filepath) });
        } catch (error) {
          logger.warn(`Failed to add ${format} to ZIP:`, error);
        }
      })).then(() => {
        archive.finalize();
      });
    });
  }

  /**
   * Export specific data types
   */
  async exportEmployees(employees, format, options = {}) {
    const exportData = employees.map(emp => ({
      ID: emp._id,
      'Ad Soyad': emp.name,
      'E-posta': emp.email,
      'Telefon': emp.phone,
      'Departman': emp.department,
      'Pozisyon': emp.position,
      'Maaş': emp.salary,
      'İşe Başlama Tarihi': emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('tr-TR') : '',
      'Durum': emp.status
    }));

    return await this.exportData(exportData, format, {
      ...options,
      headers: ['ID', 'Ad Soyad', 'E-posta', 'Telefon', 'Departman', 'Pozisyon', 'Maaş', 'İşe Başlama Tarihi', 'Durum'],
      title: 'Çalışan Listesi',
      sheetName: 'Çalışanlar'
    });
  }

  async exportProducts(products, format, options = {}) {
    const exportData = products.map(prod => ({
      ID: prod._id,
      'Ürün Adı': prod.name,
      'Kategori': prod.category,
      'Fiyat': prod.price,
      'Stok': prod.stock,
      'Açıklama': prod.description,
      'Durum': prod.status
    }));

    return await this.exportData(exportData, format, {
      ...options,
      headers: ['ID', 'Ürün Adı', 'Kategori', 'Fiyat', 'Stok', 'Açıklama', 'Durum'],
      title: 'Ürün Listesi',
      sheetName: 'Ürünler'
    });
  }

  async exportOrders(orders, format, options = {}) {
    const exportData = orders.map(order => ({
      ID: order._id,
      'Müşteri': order.customer?.name || 'Bilinmeyen',
      'Toplam Tutar': order.totalAmount,
      'Durum': order.status,
      'Tarih': order.orderDate ? new Date(order.orderDate).toLocaleDateString('tr-TR') : '',
      'Ödeme Yöntemi': order.paymentMethod
    }));

    return await this.exportData(exportData, format, {
      ...options,
      headers: ['ID', 'Müşteri', 'Toplam Tutar', 'Durum', 'Tarih', 'Ödeme Yöntemi'],
      title: 'Sipariş Listesi',
      sheetName: 'Siparişler'
    });
  }

  /**
   * Clean up old export files
   */
  async cleanupOldExports(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    try {
      const files = await fs.readdir(this.exportPath);
      const now = Date.now();
      
      for (const file of files) {
        const filepath = path.join(this.exportPath, file);
        const stats = await fs.stat(filepath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filepath);
          logger.info(`Cleaned up old export file: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up old exports:', error);
    }
  }

  /**
   * Get export statistics
   */
  async getExportStats() {
    try {
      const files = await fs.readdir(this.exportPath);
      const stats = {
        totalFiles: files.length,
        formats: {},
        totalSize: 0
      };

      for (const file of files) {
        const filepath = path.join(this.exportPath, file);
        const fileStats = await fs.stat(filepath);
        const ext = path.extname(file).slice(1);
        
        stats.totalSize += fileStats.size;
        stats.formats[ext] = (stats.formats[ext] || 0) + 1;
      }

      return stats;
    } catch (error) {
      logger.error('Error getting export stats:', error);
      return null;
    }
  }
}

module.exports = DataExporter;
