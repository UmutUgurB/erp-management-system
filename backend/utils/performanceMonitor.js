const os = require('os');
const process = require('process');
const logger = require('./logger');
const cacheManager = require('./cacheManager');

// Performance metrics configuration
const config = {
  collectionInterval: 5000, // 5 seconds
  retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
  maxDataPoints: 1000,
  alertThresholds: {
    cpu: 80, // CPU usage percentage
    memory: 85, // Memory usage percentage
    responseTime: 2000, // Response time in ms
    errorRate: 5, // Error rate percentage
    activeConnections: 1000 // Active connections
  }
};

// Performance metrics storage
class MetricsStorage {
  constructor() {
    this.metrics = {
      system: [],
      requests: [],
      database: [],
      cache: [],
      errors: []
    };
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimeSum = 0;
    this.activeConnections = 0;
  }

  // Add system metrics
  addSystemMetrics() {
    const metrics = {
      timestamp: Date.now(),
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: os.loadavg(),
        uptime: process.uptime()
      },
      memory: {
        process: process.memoryUsage(),
        system: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        }
      },
      network: {
        interfaces: os.networkInterfaces()
      },
      platform: {
        type: os.type(),
        release: os.release(),
        arch: os.arch(),
        cpus: os.cpus().length
      }
    };

    this.metrics.system.push(metrics);
    this.cleanupOldMetrics('system');
  }

  // Add request metrics
  addRequestMetrics(duration, statusCode, path, method) {
    const metrics = {
      timestamp: Date.now(),
      duration,
      statusCode,
      path,
      method,
      success: statusCode < 400
    };

    this.metrics.requests.push(metrics);
    this.cleanupOldMetrics('requests');

    // Update counters
    this.requestCount++;
    this.responseTimeSum += duration;
    
    if (statusCode >= 400) {
      this.errorCount++;
    }
  }

  // Add database metrics
  addDatabaseMetrics(operation, duration, success, collection) {
    const metrics = {
      timestamp: Date.now(),
      operation,
      duration,
      success,
      collection
    };

    this.metrics.database.push(metrics);
    this.cleanupOldMetrics('database');
  }

  // Add cache metrics
  addCacheMetrics(operation, duration, success, hit) {
    const metrics = {
      timestamp: Date.now(),
      operation,
      duration,
      success,
      hit
    };

    this.metrics.cache.push(metrics);
    this.cleanupOldMetrics('cache');
  }

  // Add error metrics
  addErrorMetrics(error, context) {
    const metrics = {
      timestamp: Date.now(),
      error: error.message || error,
      stack: error.stack,
      context,
      type: error.name || 'Error'
    };

    this.metrics.errors.push(metrics);
    this.cleanupOldMetrics('errors');
  }

  // Cleanup old metrics
  cleanupOldMetrics(type) {
    const cutoff = Date.now() - config.retentionPeriod;
    
    this.metrics[type] = this.metrics[type].filter(
      metric => metric.timestamp > cutoff
    );

    // Limit data points
    if (this.metrics[type].length > config.maxDataPoints) {
      this.metrics[type] = this.metrics[type].slice(-config.maxDataPoints);
    }
  }

  // Get metrics summary
  getSummary() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneMinuteAgo = now - (60 * 1000);

    // Filter recent metrics
    const recentRequests = this.metrics.requests.filter(
      req => req.timestamp > oneMinuteAgo
    );
    const recentErrors = this.metrics.errors.filter(
      err => err.timestamp > oneMinuteAgo
    );

    // Calculate averages
    const avgResponseTime = recentRequests.length > 0
      ? recentRequests.reduce((sum, req) => sum + req.duration, 0) / recentRequests.length
      : 0;

    const errorRate = recentRequests.length > 0
      ? (recentErrors.length / recentRequests.length) * 100
      : 0;

    // Get latest system metrics
    const latestSystem = this.metrics.system[this.metrics.system.length - 1] || {};
    const latestMemory = latestSystem.memory || {};

    return {
      uptime: process.uptime(),
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      activeConnections: this.activeConnections,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      system: {
        cpu: {
          loadAverage: latestSystem.cpu?.loadAverage || [0, 0, 0],
          usage: latestSystem.cpu?.usage || { user: 0, system: 0 }
        },
        memory: {
          process: latestMemory.process || {},
          system: latestMemory.system || {},
          usage: latestMemory.system ? 
            ((latestMemory.system.used / latestMemory.system.total) * 100).toFixed(2) : 0
        }
      },
      cache: cacheManager.getStats()
    };
  }

  // Get detailed metrics
  getDetailedMetrics(type, timeRange = '1h') {
    const now = Date.now();
    let cutoff;

    switch (timeRange) {
      case '1m':
        cutoff = now - (60 * 1000);
        break;
      case '5m':
        cutoff = now - (5 * 60 * 1000);
        break;
      case '1h':
        cutoff = now - (60 * 60 * 1000);
        break;
      case '24h':
        cutoff = now - (24 * 60 * 60 * 1000);
        break;
      default:
        cutoff = now - (60 * 60 * 1000);
    }

    return this.metrics[type]?.filter(metric => metric.timestamp > cutoff) || [];
  }

  // Get performance alerts
  getAlerts() {
    const summary = this.getSummary();
    const alerts = [];

    // CPU usage alert
    if (summary.system.cpu.loadAverage[0] > config.alertThresholds.cpu / 100) {
      alerts.push({
        type: 'warning',
        category: 'system',
        message: `High CPU load: ${summary.system.cpu.loadAverage[0].toFixed(2)}`,
        timestamp: Date.now(),
        severity: 'medium'
      });
    }

    // Memory usage alert
    if (parseFloat(summary.system.memory.usage) > config.alertThresholds.memory) {
      alerts.push({
        type: 'warning',
        category: 'system',
        message: `High memory usage: ${summary.system.memory.usage}%`,
        timestamp: Date.now(),
        severity: 'medium'
      });
    }

    // Response time alert
    if (summary.avgResponseTime > config.alertThresholds.responseTime) {
      alerts.push({
        type: 'warning',
        category: 'performance',
        message: `High response time: ${summary.avgResponseTime}ms`,
        timestamp: Date.now(),
        severity: 'high'
      });
    }

    // Error rate alert
    if (summary.errorRate > config.alertThresholds.errorRate) {
      alerts.push({
        type: 'error',
        category: 'reliability',
        message: `High error rate: ${summary.errorRate}%`,
        timestamp: Date.now(),
        severity: 'critical'
      });
    }

    // Active connections alert
    if (summary.activeConnections > config.alertThresholds.activeConnections) {
      alerts.push({
        type: 'warning',
        category: 'system',
        message: `High connection count: ${summary.activeConnections}`,
        timestamp: Date.now(),
        severity: 'medium'
      });
    }

    return alerts;
  }

  // Export metrics for analysis
  exportMetrics(format = 'json') {
    const data = {
      summary: this.getSummary(),
      alerts: this.getAlerts(),
      metrics: this.metrics,
      config: {
        collectionInterval: config.collectionInterval,
        retentionPeriod: config.retentionPeriod,
        maxDataPoints: config.maxDataPoints
      }
    };

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      default:
        return data;
    }
  }

  // Convert metrics to CSV
  convertToCSV(data) {
    // Implementation for CSV conversion
    // This is a simplified version
    const lines = [];
    
    // Add headers
    lines.push('Timestamp,Type,Value,Category');
    
    // Add data
    Object.entries(data.metrics).forEach(([type, metrics]) => {
      metrics.forEach(metric => {
        lines.push(`${metric.timestamp},${type},${JSON.stringify(metric)},${metric.category || 'general'}`);
      });
    });
    
    return lines.join('\n');
  }
}

// Performance Monitor Class
class PerformanceMonitor {
  constructor() {
    this.storage = new MetricsStorage();
    this.isRunning = false;
    this.collectionTimer = null;
    this.middleware = this.createMiddleware();
    
    // Bind methods
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.collectMetrics = this.collectMetrics.bind(this);
  }

  // Start monitoring
  start() {
    if (this.isRunning) {
      logger.warn('Performance monitor is already running');
      return;
    }

    this.isRunning = true;
    this.collectionTimer = setInterval(this.collectMetrics, config.collectionInterval);
    
    logger.info('Performance monitor started');
  }

  // Stop monitoring
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }
    
    logger.info('Performance monitor stopped');
  }

  // Collect system metrics
  collectMetrics() {
    try {
      this.storage.addSystemMetrics();
      
      // Check for alerts
      const alerts = this.storage.getAlerts();
      if (alerts.length > 0) {
        alerts.forEach(alert => {
          logger.warn(`Performance alert: ${alert.message}`, alert);
        });
      }
    } catch (error) {
      logger.error('Error collecting performance metrics:', error);
    }
  }

  // Create monitoring middleware
  createMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Track active connections
      this.storage.activeConnections++;
      
      // Override res.end to capture response metrics
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const duration = Date.now() - startTime;
        
        // Add request metrics
        this.storage.addRequestMetrics(
          duration,
          res.statusCode,
          req.path,
          req.method
        );
        
        // Update active connections
        this.storage.activeConnections = Math.max(0, this.storage.activeConnections - 1);
        
        // Call original end method
        originalEnd.call(this, chunk, encoding);
      }.bind(this);
      
      next();
    };
  }

  // Database monitoring wrapper
  monitorDatabase(operation, collection) {
    return async (fn) => {
      const startTime = Date.now();
      
      try {
        const result = await fn();
        this.storage.addDatabaseMetrics(operation, Date.now() - startTime, true, collection);
        return result;
      } catch (error) {
        this.storage.addDatabaseMetrics(operation, Date.now() - startTime, false, collection);
        throw error;
      }
    };
  }

  // Cache monitoring wrapper
  monitorCache(operation) {
    return async (fn) => {
      const startTime = Date.now();
      
      try {
        const result = await fn();
        const hit = result !== null;
        this.storage.addCacheMetrics(operation, Date.now() - startTime, true, hit);
        return result;
      } catch (error) {
        this.storage.addCacheMetrics(operation, Date.now() - startTime, false, false);
        throw error;
      }
    };
  }

  // Error monitoring
  monitorError(error, context = {}) {
    this.storage.addErrorMetrics(error, context);
  }

  // Get performance report
  getReport(timeRange = '1h') {
    const summary = this.storage.getSummary();
    const alerts = this.storage.getAlerts();
    const detailedMetrics = {
      requests: this.storage.getDetailedMetrics('requests', timeRange),
      database: this.storage.getDetailedMetrics('database', timeRange),
      cache: this.storage.getDetailedMetrics('cache', timeRange),
      errors: this.storage.getDetailedMetrics('errors', timeRange)
    };

    return {
      summary,
      alerts,
      detailedMetrics,
      recommendations: this.getRecommendations(summary, alerts),
      timestamp: Date.now()
    };
  }

  // Get performance recommendations
  getRecommendations(summary, alerts) {
    const recommendations = [];

    // High response time recommendations
    if (summary.avgResponseTime > 1000) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        message: 'Consider implementing caching for frequently accessed data',
        action: 'Review and optimize database queries, implement Redis caching'
      });
    }

    // High error rate recommendations
    if (summary.errorRate > 2) {
      recommendations.push({
        priority: 'high',
        category: 'reliability',
        message: 'High error rate detected, review error handling and logging',
        action: 'Check application logs, review error handling middleware'
      });
    }

    // High memory usage recommendations
    if (parseFloat(summary.system.memory.usage) > 80) {
      recommendations.push({
        priority: 'medium',
        category: 'system',
        message: 'High memory usage, consider memory optimization',
        action: 'Review memory leaks, optimize data structures, consider garbage collection'
      });
    }

    // Low cache hit rate recommendations
    if (summary.cache.stats.hitRate && parseFloat(summary.cache.stats.hitRate) < 50) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        message: 'Low cache hit rate, review caching strategy',
        action: 'Review cache keys, TTL settings, and cache invalidation patterns'
      });
    }

    return recommendations;
  }

  // Health check
  health() {
    return {
      status: this.isRunning ? 'healthy' : 'stopped',
      uptime: process.uptime(),
      metricsCount: {
        system: this.storage.metrics.system.length,
        requests: this.storage.metrics.requests.length,
        database: this.storage.metrics.database.length,
        cache: this.storage.metrics.cache.length,
        errors: this.storage.metrics.errors.length
      },
      lastCollection: this.storage.metrics.system.length > 0 
        ? this.storage.metrics.system[this.storage.metrics.system.length - 1].timestamp
        : null
    };
  }

  // Reset metrics
  reset() {
    this.storage = new MetricsStorage();
    logger.info('Performance metrics reset');
  }

  // Cleanup
  cleanup() {
    this.stop();
    this.storage = null;
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring
performanceMonitor.start();

// Graceful shutdown
process.on('SIGTERM', () => performanceMonitor.cleanup());
process.on('SIGINT', () => performanceMonitor.cleanup());

module.exports = performanceMonitor;
