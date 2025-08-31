const mongoose = require('mongoose');
const { logger } = require('./logger');
const { ResponseHandler } = require('./responseHandler');

/**
 * Advanced Database Manager
 * Provides connection management, monitoring, and optimization features
 */
class DatabaseManager {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      autoIndex: process.env.NODE_ENV !== 'production',
      autoCreate: process.env.NODE_ENV !== 'production'
    };

    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      failedConnections: 0,
      lastConnectionTime: null,
      lastDisconnectionTime: null,
      uptime: 0,
      queries: {
        total: 0,
        successful: 0,
        failed: 0,
        slow: 0
      }
    };

    this.healthChecks = [];
    this.setupEventHandlers();
  }

  /**
   * Setup MongoDB event handlers
   */
  setupEventHandlers() {
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      this.stats.lastConnectionTime = new Date();
      this.stats.totalConnections++;
      this.stats.activeConnections++;
      
      logger.info('MongoDB connected successfully', {
        uri: this.getConnectionString(),
        timestamp: new Date().toISOString()
      });

      // Start health check interval
      this.startHealthChecks();
    });

    mongoose.connection.on('error', (error) => {
      this.isConnected = false;
      this.stats.failedConnections++;
      
      logger.error('MongoDB connection error', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      this.stats.lastDisconnectionTime = new Date();
      this.stats.activeConnections = Math.max(0, this.stats.activeConnections - 1);
      
      logger.warn('MongoDB disconnected', {
        timestamp: new Date().toISOString(),
        uptime: this.stats.uptime
      });

      // Stop health checks
      this.stopHealthChecks();
    });

    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      this.stats.totalConnections++;
      this.stats.activeConnections++;
      
      logger.info('MongoDB reconnected', {
        timestamp: new Date().toISOString()
      });

      // Restart health checks
      this.startHealthChecks();
    });

    // Monitor query performance
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
        logger.debug('MongoDB Query', {
          collection: collectionName,
          method: methodName,
          args: methodArgs,
          timestamp: new Date().toISOString()
        });
      });
    }
  }

  /**
   * Get connection string
   */
  getConnectionString() {
    const {
      MONGODB_HOST = 'localhost',
      MONGODB_PORT = '27017',
      MONGODB_DATABASE = 'erp',
      MONGODB_USERNAME,
      MONGODB_PASSWORD
    } = process.env;

    if (MONGODB_USERNAME && MONGODB_PASSWORD) {
      return `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=admin`;
    }

    return `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      const startTime = Date.now();
      
      logger.info('Connecting to MongoDB...', {
        uri: this.getConnectionString(),
        timestamp: new Date().toISOString()
      });

      this.connection = await mongoose.connect(
        this.getConnectionString(),
        this.connectionOptions
      );

      const connectionTime = Date.now() - startTime;
      
      logger.info('MongoDB connection established', {
        connectionTime: `${connectionTime}ms`,
        timestamp: new Date().toISOString()
      });

      // Set up query monitoring
      this.setupQueryMonitoring();

      return this.connection;
    } catch (error) {
      logger.error('Failed to connect to MongoDB', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.isConnected = false;
        
        logger.info('MongoDB disconnected', {
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Setup query monitoring
   */
  setupQueryMonitoring() {
    // Monitor all queries
    mongoose.connection.db.admin().command({ getLog: 'global' }, (err, result) => {
      if (!err) {
        logger.info('MongoDB query monitoring enabled');
      }
    });

    // Add query middleware to all models
    mongoose.plugin((schema) => {
      schema.pre('find', function() {
        this.startTime = Date.now();
      });

      schema.post('find', function(result) {
        const executionTime = Date.now() - this.startTime;
        this.logQuery('find', executionTime, result);
      });

      schema.pre('findOne', function() {
        this.startTime = Date.now();
      });

      schema.post('findOne', function(result) {
        const executionTime = Date.now() - this.startTime;
        this.logQuery('findOne', executionTime, result);
      });

      schema.pre('save', function() {
        this.startTime = Date.now();
      });

      schema.post('save', function(result) {
        const executionTime = Date.now() - this.startTime;
        this.logQuery('save', executionTime, result);
      });

      schema.pre('updateOne', function() {
        this.startTime = Date.now();
      });

      schema.post('updateOne', function(result) {
        const executionTime = Date.now() - this.startTime;
        this.logQuery('updateOne', executionTime, result);
      });

      schema.pre('deleteOne', function() {
        this.startTime = Date.now();
      });

      schema.post('deleteOne', function(result) {
        const executionTime = Date.now() - this.startTime;
        this.logQuery('deleteOne', executionTime, result);
      });
    });
  }

  /**
   * Log query execution
   */
  logQuery(operation, executionTime, result) {
    this.stats.queries.total++;
    
    if (executionTime > 100) { // Consider queries over 100ms as slow
      this.stats.queries.slow++;
      logger.warn('Slow database query detected', {
        operation,
        executionTime: `${executionTime}ms`,
        threshold: '100ms',
        timestamp: new Date().toISOString()
      });
    }

    // Log to performance logger
    logger.logPerformance('database_query', executionTime, {
      operation,
      resultCount: Array.isArray(result) ? result.length : 1
    });
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      if (!this.isConnected) {
        return { error: 'Database not connected' };
      }

      const dbStats = await mongoose.connection.db.stats();
      const adminStats = await mongoose.connection.db.admin().serverStatus();

      return {
        connection: {
          isConnected: this.isConnected,
          totalConnections: this.stats.totalConnections,
          activeConnections: this.stats.activeConnections,
          failedConnections: this.stats.failedConnections,
          lastConnectionTime: this.stats.lastConnectionTime,
          lastDisconnectionTime: this.stats.lastDisconnectionTime
        },
        queries: this.stats.queries,
        database: {
          collections: dbStats.collections,
          dataSize: this.formatBytes(dbStats.dataSize),
          storageSize: this.formatBytes(dbStats.storageSize),
          indexes: dbStats.indexes,
          indexSize: this.formatBytes(dbStats.indexSize)
        },
        server: {
          version: adminStats.version,
          uptime: adminStats.uptime,
          connections: adminStats.connections,
          opcounters: adminStats.opcounters
        }
      };
    } catch (error) {
      logger.error('Error getting database stats', {
        error: error.message,
        stack: error.stack
      });
      return { error: error.message };
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Start health checks
   */
  startHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error('Health check failed', {
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop health checks
   */
  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      const startTime = Date.now();
      
      // Simple ping command
      await mongoose.connection.db.admin().ping();
      
      const responseTime = Date.now() - startTime;
      
      this.healthChecks.push({
        timestamp: new Date().toISOString(),
        status: 'healthy',
        responseTime,
        uptime: process.uptime()
      });

      // Keep only last 100 health checks
      if (this.healthChecks.length > 100) {
        this.healthChecks = this.healthChecks.slice(-100);
      }

      // Update uptime
      this.stats.uptime = process.uptime();

      logger.debug('Database health check passed', {
        responseTime: `${responseTime}ms`,
        uptime: this.stats.uptime
      });
    } catch (error) {
      this.healthChecks.push({
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: error.message,
        uptime: process.uptime()
      });

      logger.error('Database health check failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get health check history
   */
  getHealthCheckHistory() {
    return this.healthChecks;
  }

  /**
   * Optimize database
   */
  async optimize() {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      logger.info('Starting database optimization...');

      // Get all collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      for (const collection of collections) {
        try {
          // Analyze collection
          const stats = await mongoose.connection.db.collection(collection.name).stats();
          
          // Rebuild indexes if needed
          if (stats.indexSizes && Object.keys(stats.indexSizes).length > 0) {
            await mongoose.connection.db.collection(collection.name).reIndex();
            logger.info(`Rebuilt indexes for collection: ${collection.name}`);
          }
        } catch (error) {
          logger.warn(`Failed to optimize collection: ${collection.name}`, {
            error: error.message
          });
        }
      }

      logger.info('Database optimization completed');
      return { success: true, message: 'Database optimization completed' };
    } catch (error) {
      logger.error('Database optimization failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Backup database
   */
  async backup(backupPath) {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      logger.info('Starting database backup...', { backupPath });

      // This would require mongodump to be installed
      // For now, we'll just log the request
      logger.info('Backup requested', {
        backupPath,
        timestamp: new Date().toISOString()
      });

      return { success: true, message: 'Backup request logged' };
    } catch (error) {
      logger.error('Database backup failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown() {
    try {
      logger.info('Starting graceful database shutdown...');
      
      // Stop health checks
      this.stopHealthChecks();
      
      // Close connection
      await this.disconnect();
      
      logger.info('Database shutdown completed');
    } catch (error) {
      logger.error('Error during database shutdown', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

module.exports = { databaseManager, DatabaseManager };
