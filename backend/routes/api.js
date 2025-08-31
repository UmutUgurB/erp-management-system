const express = require('express');
const { ResponseHandler } = require('../utils/responseHandler');
const { logger } = require('../utils/logger');
const { databaseManager } = require('../utils/databaseManager');
const { cacheManager } = require('../utils/cacheManager');
const { performanceMonitor } = require('../utils/performanceMonitor');
const { jobQueue } = require('../utils/jobQueue');

const router = express.Router();

/**
 * API Health Check
 */
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    const dbStatus = databaseManager.getConnectionStatus();
    
    // Check cache status
    const cacheStatus = await cacheManager.health();
    
    // Check performance metrics
    const performanceStats = performanceMonitor.getStats();
    
    // Check job queue status
    const jobQueueStats = jobQueue.getStats();
    
    const responseTime = Date.now() - startTime;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          status: dbStatus.isConnected ? 'healthy' : 'unhealthy',
          details: dbStatus
        },
        cache: {
          status: cacheStatus.status,
          details: cacheStatus
        },
        performance: {
          status: 'healthy',
          details: performanceStats
        },
        jobQueue: {
          status: 'healthy',
          details: jobQueueStats
        }
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV
    };

    // Determine overall status
    const allServicesHealthy = Object.values(healthData.services).every(
      service => service.status === 'healthy'
    );
    
    healthData.status = allServicesHealthy ? 'healthy' : 'degraded';
    
    const statusCode = allServicesHealthy ? 200 : 503;
    
    logger.info('Health check completed', {
      status: healthData.status,
      responseTime,
      services: Object.keys(healthData.services)
    });

    return ResponseHandler.health(res, healthData.services);
  } catch (error) {
    logger.error('Health check failed', {
      error: error.message,
      stack: error.stack
    });
    
    return ResponseHandler.error(res, error, 500);
  }
});

/**
 * API Statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get database statistics
    const dbStats = await databaseManager.getStats();
    
    // Get cache statistics
    const cacheStats = await cacheManager.getStats();
    
    // Get performance statistics
    const perfStats = performanceMonitor.getStats();
    
    // Get job queue statistics
    const jobStats = jobQueue.getStats();
    
    // Get system information
    const systemInfo = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      pid: process.pid
    };

    const stats = {
      database: dbStats,
      cache: cacheStats,
      performance: perfStats,
      jobQueue: jobStats,
      system: systemInfo,
      timestamp: new Date().toISOString()
    };

    const responseTime = Date.now() - startTime;
    
    logger.info('API stats retrieved', {
      responseTime,
      timestamp: new Date().toISOString()
    });

    return ResponseHandler.success(res, stats, 'İstatistikler başarıyla getirildi', 200, {
      responseTime
    });
  } catch (error) {
    logger.error('Failed to get API stats', {
      error: error.message,
      stack: error.stack
    });
    
    return ResponseHandler.error(res, error, 500);
  }
});

/**
 * API Documentation
 */
router.get('/docs', (req, res) => {
  const apiDocs = {
    name: 'ERP Backend API',
    version: '2.1.0',
    description: 'Modern ERP sistemi backend API\'si',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      health: {
        path: '/health',
        method: 'GET',
        description: 'Sistem sağlık durumu kontrolü',
        response: 'Health status of all services'
      },
      stats: {
        path: '/stats',
        method: 'GET',
        description: 'Sistem istatistikleri',
        response: 'System performance and usage statistics'
      },
      docs: {
        path: '/docs',
        method: 'GET',
        description: 'API dokümantasyonu',
        response: 'This documentation'
      }
    },
    authentication: {
      type: 'JWT',
      header: 'Authorization: Bearer <token>'
    },
    rateLimiting: {
      description: 'API rate limiting uygulanmaktadır',
      headers: [
        'X-RateLimit-Limit: Request limit per window',
        'X-RateLimit-Remaining: Remaining requests in current window',
        'X-RateLimit-Reset: Time when the rate limit resets'
      ]
    },
    errorHandling: {
      format: 'Standardized error response format',
      codes: {
        400: 'Bad Request - Validation error',
        401: 'Unauthorized - Authentication required',
        403: 'Forbidden - Insufficient permissions',
        404: 'Not Found - Resource not found',
        429: 'Too Many Requests - Rate limit exceeded',
        500: 'Internal Server Error - Server error'
      }
    },
    timestamp: new Date().toISOString()
  };

  return ResponseHandler.success(res, apiDocs, 'API dokümantasyonu', 200);
});

/**
 * System Information
 */
router.get('/system', (req, res) => {
  try {
    const systemInfo = {
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        uptime: process.uptime()
      },
      memory: {
        ...process.memoryUsage(),
        external: process.memoryUsage().external,
        arrayBuffers: process.memoryUsage().arrayBuffers
      },
      cpu: process.cpuUsage(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        MONGODB_HOST: process.env.MONGODB_HOST,
        REDIS_HOST: process.env.REDIS_HOST
      },
      versions: process.versions,
      timestamp: new Date().toISOString()
    };

    return ResponseHandler.success(res, systemInfo, 'Sistem bilgileri getirildi');
  } catch (error) {
    logger.error('Failed to get system info', {
      error: error.message,
      stack: error.stack
    });
    
    return ResponseHandler.error(res, error, 500);
  }
});

/**
 * Performance Metrics
 */
router.get('/performance', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get performance metrics
    const metrics = await performanceMonitor.getMetrics();
    
    // Get recent alerts
    const alerts = performanceMonitor.getRecentAlerts();
    
    // Get slow operations
    const slowOps = performanceMonitor.getSlowOperations();
    
    const performanceData = {
      metrics,
      alerts,
      slowOperations: slowOps,
      timestamp: new Date().toISOString()
    };

    const responseTime = Date.now() - startTime;
    
    logger.info('Performance metrics retrieved', {
      responseTime,
      metricsCount: Object.keys(metrics).length,
      alertsCount: alerts.length,
      slowOpsCount: slowOps.length
    });

    return ResponseHandler.success(res, performanceData, 'Performans metrikleri getirildi', 200, {
      responseTime
    });
  } catch (error) {
    logger.error('Failed to get performance metrics', {
      error: error.message,
      stack: error.stack
    });
    
    return ResponseHandler.error(res, error, 500);
  }
});

/**
 * Cache Management
 */
router.get('/cache', async (req, res) => {
  try {
    const cacheInfo = await cacheManager.getStats();
    
    return ResponseHandler.success(res, cacheInfo, 'Cache istatistikleri getirildi');
  } catch (error) {
    logger.error('Failed to get cache info', {
      error: error.message,
      stack: error.stack
    });
    
    return ResponseHandler.error(res, error, 500);
  }
});

/**
 * Clear Cache
 */
router.delete('/cache', async (req, res) => {
  try {
    const result = await cacheManager.clear();
    
    logger.info('Cache cleared', {
      timestamp: new Date().toISOString()
    });
    
    return ResponseHandler.success(res, result, 'Cache başarıyla temizlendi');
  } catch (error) {
    logger.error('Failed to clear cache', {
      error: error.message,
      stack: error.stack
    });
    
    return ResponseHandler.error(res, error, 500);
  }
});

/**
 * Job Queue Status
 */
router.get('/jobs', async (req, res) => {
  try {
    const jobStats = jobQueue.getStats();
    
    return ResponseHandler.success(res, jobStats, 'Job queue durumu getirildi');
  } catch (error) {
    logger.error('Failed to get job queue status', {
      error: error.message,
      stack: error.stack
    });
    
    return ResponseHandler.error(res, error, 500);
  }
});

/**
 * Database Operations
 */
router.get('/database', async (req, res) => {
  try {
    const dbStats = await databaseManager.getStats();
    
    return ResponseHandler.success(res, dbStats, 'Veritabanı istatistikleri getirildi');
  } catch (error) {
    logger.error('Failed to get database stats', {
      error: error.message,
      stack: error.stack
    });
    
    return ResponseHandler.error(res, error, 500);
  }
});

/**
 * Database Optimization
 */
router.post('/database/optimize', async (req, res) => {
  try {
    const result = await databaseManager.optimize();
    
    logger.info('Database optimization completed', {
      timestamp: new Date().toISOString()
    });
    
    return ResponseHandler.success(res, result, 'Veritabanı optimizasyonu tamamlandı');
  } catch (error) {
    logger.error('Database optimization failed', {
      error: error.message,
      stack: error.stack
    });
    
    return ResponseHandler.error(res, error, 500);
  }
});

/**
 * Database Backup
 */
router.post('/database/backup', async (req, res) => {
  try {
    const { backupPath } = req.body;
    
    if (!backupPath) {
      return ResponseHandler.validationError(res, {
        backupPath: 'Backup path is required'
      });
    }
    
    const result = await databaseManager.backup(backupPath);
    
    logger.info('Database backup requested', {
      backupPath,
      timestamp: new Date().toISOString()
    });
    
    return ResponseHandler.success(res, result, 'Veritabanı yedekleme başlatıldı');
  } catch (error) {
    logger.error('Database backup failed', {
      error: error.message,
      stack: error.stack
    });
    
    return ResponseHandler.error(res, error, 500);
  }
});

/**
 * Logs Endpoint
 */
router.get('/logs', (req, res) => {
  try {
    const { level = 'info', limit = 100, startDate, endDate } = req.query;
    
    // This would typically read from log files
    // For now, return log statistics
    const logStats = {
      availableLevels: ['error', 'warn', 'info', 'debug'],
      currentLevel: level,
      logDirectory: 'logs/',
      rotation: 'Daily rotation with size limits',
      retention: 'Error logs: 30 days, API logs: 7 days, All logs: 14 days',
      timestamp: new Date().toISOString()
    };
    
    return ResponseHandler.success(res, logStats, 'Log bilgileri getirildi');
  } catch (error) {
    logger.error('Failed to get log info', {
      error: error.message,
      stack: error.stack
    });
    
    return ResponseHandler.error(res, error, 500);
  }
});

/**
 * 404 Handler for API routes
 */
router.use('*', (req, res) => {
  return ResponseHandler.notFound(res, 'API endpoint', 'Endpoint bulunamadı');
});

module.exports = router;
