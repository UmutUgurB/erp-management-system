const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { logger } = require('./logger');

class BackupManager {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.maxBackups = 10; // Keep last 10 backups
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    fs.ensureDirSync(this.backupDir);
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);

      // Get database connection
      const mongoose = require('mongoose');
      const db = mongoose.connection.db;

      // Get all collections
      const collections = await db.listCollections().toArray();
      const backupData = {};

      // Export each collection
      for (const collection of collections) {
        const collectionName = collection.name;
        const documents = await db.collection(collectionName).find({}).toArray();
        backupData[collectionName] = documents;
      }

      // Write backup to file
      await fs.writeJson(filepath, backupData, { spaces: 2 });

      // Log backup creation
      logger.info('Backup created successfully', {
        filename,
        collections: Object.keys(backupData),
        documentCount: Object.values(backupData).reduce((sum, docs) => sum + docs.length, 0)
      });

      // Clean old backups
      await this.cleanOldBackups();

      return {
        success: true,
        filename,
        filepath,
        timestamp
      };

    } catch (error) {
      logger.error('Backup creation failed', { error: error.message });
      throw error;
    }
  }

  async restoreBackup(filename) {
    try {
      const filepath = path.join(this.backupDir, filename);
      
      // Check if backup file exists
      if (!await fs.pathExists(filepath)) {
        throw new Error('Backup file not found');
      }

      // Read backup data
      const backupData = await fs.readJson(filepath);

      // Get database connection
      const mongoose = require('mongoose');
      const db = mongoose.connection.db;

      // Clear existing data
      const collections = await db.listCollections().toArray();
      for (const collection of collections) {
        await db.collection(collection.name).deleteMany({});
      }

      // Restore data
      for (const [collectionName, documents] of Object.entries(backupData)) {
        if (documents.length > 0) {
          await db.collection(collectionName).insertMany(documents);
        }
      }

      logger.info('Backup restored successfully', {
        filename,
        collections: Object.keys(backupData),
        documentCount: Object.values(backupData).reduce((sum, docs) => sum + docs.length, 0)
      });

      return {
        success: true,
        filename,
        collections: Object.keys(backupData)
      };

    } catch (error) {
      logger.error('Backup restoration failed', { error: error.message });
      throw error;
    }
  }

  async cleanOldBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Remove old backups if we have more than maxBackups
      if (backupFiles.length > this.maxBackups) {
        const filesToDelete = backupFiles.slice(this.maxBackups);
        
        for (const file of filesToDelete) {
          await fs.remove(file.path);
          logger.info('Old backup deleted', { filename: file.name });
        }
      }

    } catch (error) {
      logger.error('Backup cleanup failed', { error: error.message });
    }
  }

  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
        .map(file => {
          const stats = fs.statSync(path.join(this.backupDir, file));
          return {
            filename: file,
            size: stats.size,
            created: stats.mtime,
            sizeFormatted: this.formatFileSize(stats.size)
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime());

      return backupFiles;

    } catch (error) {
      logger.error('Backup listing failed', { error: error.message });
      throw error;
    }
  }

  async deleteBackup(filename) {
    try {
      const filepath = path.join(this.backupDir, filename);
      
      if (!await fs.pathExists(filepath)) {
        throw new Error('Backup file not found');
      }

      await fs.remove(filepath);
      
      logger.info('Backup deleted', { filename });
      
      return { success: true, filename };

    } catch (error) {
      logger.error('Backup deletion failed', { error: error.message });
      throw error;
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async getBackupStats() {
    try {
      const backups = await this.listBackups();
      const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
      
      return {
        totalBackups: backups.length,
        totalSize: this.formatFileSize(totalSize),
        oldestBackup: backups.length > 0 ? backups[backups.length - 1].created : null,
        newestBackup: backups.length > 0 ? backups[0].created : null
      };

    } catch (error) {
      logger.error('Backup stats failed', { error: error.message });
      throw error;
    }
  }
}

// Create singleton instance
const backupManager = new BackupManager();

module.exports = backupManager; 