const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('../utils/logger');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.memoryServer = null;
    this.retryAttempts = 0;
    this.maxRetryAttempts = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  async connect() {
    try {
      // MongoDB bağlantı seçenekleri
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 50, // Connection pool size
        minPoolSize: 5,
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferMaxEntries: 0,
        bufferCommands: false,
      };

      let mongoUri = process.env.MONGODB_URI;

      // Eğer production değilse veya MongoDB URI yoksa, memory server kullan
      if (!mongoUri || process.env.NODE_ENV === 'test') {
        await this.setupMemoryServer();
        mongoUri = this.memoryServer.getUri();
        logger.info('Using MongoDB Memory Server for development/testing');
      }

      // MongoDB'ye bağlan
      await mongoose.connect(mongoUri, options);
      this.isConnected = true;
      this.retryAttempts = 0;

      logger.info(`MongoDB connected successfully to: ${mongoUri.includes('memory') ? 'Memory Server' : 'Remote Database'}`);

      // Bağlantı event listener'ları
      this.setupEventListeners();

      return true;
    } catch (error) {
      logger.error('MongoDB connection error:', error);
      
      if (this.retryAttempts < this.maxRetryAttempts) {
        this.retryAttempts++;
        logger.info(`Retrying connection... Attempt ${this.retryAttempts}/${this.maxRetryAttempts}`);
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connect();
      } else {
        logger.error('Max retry attempts reached. Could not connect to MongoDB.');
        throw error;
      }
    }
  }

  async setupMemoryServer() {
    try {
      this.memoryServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'erp_test',
        },
        binary: {
          version: '6.0.0',
        },
      });
      logger.info('MongoDB Memory Server started');
    } catch (error) {
      logger.error('Failed to start MongoDB Memory Server:', error);
      throw error;
    }
  }

  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
      this.isConnected = true;
    });

    mongoose.connection.on('error', (error) => {
      logger.error('Mongoose connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
      this.isConnected = false;
      
      // Otomatik yeniden bağlanma dene
      if (this.retryAttempts < this.maxRetryAttempts) {
        setTimeout(() => {
          logger.info('Attempting to reconnect to MongoDB...');
          this.connect();
        }, this.retryDelay);
      }
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Mongoose reconnected to MongoDB');
      this.isConnected = true;
      this.retryAttempts = 0;
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      this.disconnect();
    });

    process.on('SIGTERM', () => {
      this.disconnect();
    });
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      
      if (this.memoryServer) {
        await this.memoryServer.stop();
        logger.info('MongoDB Memory Server stopped');
      }
      
      logger.info('MongoDB connection closed');
      this.isConnected = false;
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      dbName: mongoose.connection.db?.databaseName,
      connectionCount: mongoose.connections.length,
    };
  }

  // Veritabanı health check
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', message: 'Database not connected' };
      }

      // Basit bir ping işlemi
      await mongoose.connection.db.admin().ping();
      
      const stats = await mongoose.connection.db.stats();
      
      return {
        status: 'connected',
        message: 'Database connection is healthy',
        stats: {
          collections: stats.collections,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes,
          indexSize: stats.indexSize,
        },
        connection: this.getConnectionStatus(),
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'error',
        message: 'Database health check failed',
        error: error.message,
      };
    }
  }

  // Collection'ları ve index'leri başlat
  async initializeDatabase() {
    try {
      // Index'leri oluştur
      await this.createIndexes();
      
      // Varsayılan verileri oluştur
      await this.seedDefaultData();
      
      logger.info('Database initialization completed');
    } catch (error) {
      logger.error('Database initialization failed:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      const db = mongoose.connection.db;
      
      // Users collection indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ username: 1 }, { unique: true });
      await db.collection('users').createIndex({ role: 1 });
      await db.collection('users').createIndex({ isActive: 1 });
      
      // Employees collection indexes
      await db.collection('employees').createIndex({ employeeId: 1 }, { unique: true });
      await db.collection('employees').createIndex({ email: 1 }, { unique: true });
      await db.collection('employees').createIndex({ department: 1 });
      await db.collection('employees').createIndex({ status: 1 });
      
      // Products collection indexes
      await db.collection('products').createIndex({ sku: 1 }, { unique: true });
      await db.collection('products').createIndex({ name: 1 });
      await db.collection('products').createIndex({ category: 1 });
      await db.collection('products').createIndex({ isActive: 1 });
      
      // Orders collection indexes
      await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
      await db.collection('orders').createIndex({ customerId: 1 });
      await db.collection('orders').createIndex({ status: 1 });
      await db.collection('orders').createIndex({ orderDate: -1 });
      
      // Attendance collection indexes
      await db.collection('attendances').createIndex({ employeeId: 1, date: 1 }, { unique: true });
      await db.collection('attendances').createIndex({ date: -1 });
      await db.collection('attendances').createIndex({ status: 1 });
      
      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Failed to create indexes:', error);
      throw error;
    }
  }

  async seedDefaultData() {
    try {
      const User = require('../models/User');
      const userCount = await User.countDocuments();
      
      if (userCount === 0) {
        // Default admin user oluştur
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await User.create({
          username: 'admin',
          email: 'admin@erp.com',
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          profile: {
            firstName: 'System',
            lastName: 'Administrator',
          },
        });
        
        logger.info('Default admin user created');
      }
    } catch (error) {
      logger.error('Failed to seed default data:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseConnection();
