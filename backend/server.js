const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const path = require('path');
const fs = require('fs-extra');

// Import utilities
const { logger } = require('./utils/logger');
const { databaseManager } = require('./utils/databaseManager');
const { cacheManager } = require('./utils/cacheManager');
const { performanceMonitor } = require('./utils/performanceMonitor');
const { jobQueue } = require('./utils/jobQueue');
const { chatManager } = require('./utils/chatManager');
const { ResponseHandler } = require('./utils/responseHandler');
const { jobScheduler } = require('./utils/scheduler');

// Import middleware
const securityMiddleware = require('./middleware/security');
const rateLimitMiddleware = require('./middleware/rateLimit');
const {
  requestTiming,
  requestValidation,
  cacheMiddleware,
  performanceMonitoring,
  errorTracking,
  requestLogging,
  responseEnhancement,
  databaseMonitoring,
  enhancedRateLimiting,
  requestSanitization,
  compressionOptimization
} = require('./middleware/advanced');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const employeeRoutes = require('./routes/employees');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const performanceRoutes = require('./routes/performance');
const exportRoutes = require('./routes/export');
const apiRoutes = require('./routes/api');
const analyticsRoutes = require('./routes/analytics');
const webhookRoutes = require('./routes/webhooks');
const docsRoutes = require('./routes/docs');

// Import WebSocket server
const { WebSocketServer } = require('./utils/websocketServer');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

// Redis event handlers
redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('Redis connection error', { error: error.message });
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Initialize services
let websocketServer;
let gracefulShutdownInProgress = false;

/**
 * Initialize all services
 */
async function initializeServices() {
  try {
    logger.info('Initializing services...');
    
    // Initialize database
    await databaseManager.connect();
    logger.info('Database initialized');
    
    // Initialize cache manager
    await cacheManager.initialize(redis);
    logger.info('Cache manager initialized');
    
    // Initialize performance monitor
    performanceMonitor.start();
    logger.info('Performance monitor started');
    
    // Initialize job queue
    await jobQueue.initialize(redis);
    logger.info('Job queue initialized');
    
    // Initialize chat manager
    await chatManager.initialize();
    logger.info('Chat manager initialized');
    
    // Initialize job scheduler
    await jobScheduler.initialize();
    logger.info('Job scheduler initialized');
    
    // Initialize WebSocket server
    websocketServer = new WebSocketServer();
    await websocketServer.initialize();
    logger.info('WebSocket server initialized');
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Service initialization failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Setup middleware
 */
function setupMiddleware() {
  // Basic security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "ws:", "wss:"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));
  
  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key']
  }));
  
  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Compression
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
  
  // Advanced middleware
  app.use(requestTiming);
  app.use(performanceMonitoring);
  app.use(errorTracking);
  app.use(requestLogging);
  app.use(responseEnhancement);
  app.use(databaseMonitoring);
  app.use(requestSanitization);
  app.use(compressionOptimization);
  
  // Enhanced rate limiting
  app.use(enhancedRateLimiting({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Çok fazla istek gönderildi',
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args)
    })
  }));
  
  // Security middleware
  app.use(securityMiddleware);
  
  // Static files
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/exports', express.static(path.join(__dirname, 'exports')));
  
  // Health check endpoint (before rate limiting)
  app.get('/health', async (req, res) => {
    try {
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
          database: databaseManager.getConnectionStatus(),
          cache: await cacheManager.health(),
          performance: performanceMonitor.getStats(),
          jobQueue: jobQueue.getStats(),
          jobScheduler: jobScheduler.getAllJobsStatus()
        }
      };
      
      const allServicesHealthy = Object.values(healthData.services).every(
        service => service.status === 'healthy' || service.isConnected
      );
      
      healthData.status = allServicesHealthy ? 'healthy' : 'degraded';
      const statusCode = allServicesHealthy ? 200 : 503;
      
      res.status(statusCode).json(healthData);
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      res.status(503).json({ status: 'unhealthy', error: error.message });
    }
  });
}

/**
 * Setup routes
 */
function setupRoutes() {
  // API routes
  app.use('/api', apiRoutes);
  
  // Feature routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/leave', leaveRoutes);
  app.use('/api/performance', performanceRoutes);
  app.use('/api/export', exportRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/docs', docsRoutes);
  
  // 404 handler
  app.use('*', (req, res) => {
    return ResponseHandler.notFound(res, 'Endpoint', 'Endpoint bulunamadı');
  });
  
  // Global error handler
  app.use((error, req, res, next) => {
    logger.error('Unhandled error', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip || req.connection.remoteAddress
    });
    
    return ResponseHandler.error(res, error, error.statusCode || 500);
  });
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(signal) {
  if (gracefulShutdownInProgress) {
    logger.warn('Graceful shutdown already in progress');
    return;
  }
  
  gracefulShutdownInProgress = true;
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Stop accepting new connections
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed');
      });
    }
    
    // Close WebSocket connections
    if (websocketServer) {
      await websocketServer.shutdown();
      logger.info('WebSocket server closed');
    }
    
    // Stop performance monitoring
    performanceMonitor.stop();
    logger.info('Performance monitoring stopped');
    
    // Stop job queue
    await jobQueue.shutdown();
    logger.info('Job queue stopped');
    
    // Stop job scheduler
    jobScheduler.stopAllJobs();
    logger.info('Job scheduler stopped');
    
    // Close database connection
    await databaseManager.disconnect();
    logger.info('Database connection closed');
    
    // Close cache connections
    await cacheManager.shutdown();
    logger.info('Cache connections closed');
    
    // Close Redis connection
    await redis.quit();
    logger.info('Redis connection closed');
    
    // Stop logger
    await logger.shutdown();
    logger.info('Logger stopped');
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

/**
 * Start server
 */
async function startServer() {
  try {
    // Initialize services
    await initializeServices();
    
    // Setup middleware and routes
    setupMiddleware();
    setupRoutes();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
      
      // Log server information
      const serverInfo = {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      };
      
      logger.info('Server information', serverInfo);
    });
    
    // Store server reference for graceful shutdown
    global.server = server;
    
    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error', {
        error: error.message,
        stack: error.stack
      });
      
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack
      });
      
      gracefulShutdown('uncaughtException');
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection', {
        reason: reason?.message || reason,
        stack: reason?.stack,
        promise: promise
      });
      
      gracefulShutdown('unhandledRejection');
    });
    
    // Handle graceful shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle process warnings
    process.on('warning', (warning) => {
      logger.warn('Process warning', {
        name: warning.name,
        message: warning.message,
        stack: warning.stack
      });
    });
    
    logger.info('Server started successfully');
    
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;