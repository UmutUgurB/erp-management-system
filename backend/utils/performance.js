const { logger } = require('./logger');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        error: 0,
        averageResponseTime: 0
      },
      database: {
        queries: 0,
        slowQueries: 0,
        averageQueryTime: 0
      },
      memory: {
        usage: 0,
        peak: 0
      },
      uptime: {
        startTime: Date.now(),
        current: 0
      }
    };
    
    this.startMonitoring();
  }

  startMonitoring() {
    // Update uptime every minute
    setInterval(() => {
      this.metrics.uptime.current = Date.now() - this.metrics.uptime.startTime;
      this.updateMemoryUsage();
    }, 60000);

    // Log metrics every 5 minutes
    setInterval(() => {
      this.logMetrics();
    }, 300000);
  }

  updateMemoryUsage() {
    const memUsage = process.memoryUsage();
    this.metrics.memory.usage = memUsage.heapUsed / 1024 / 1024; // MB
    this.metrics.memory.peak = Math.max(this.metrics.memory.peak, this.metrics.memory.usage);
  }

  recordRequest(duration, success = true) {
    this.metrics.requests.total++;
    
    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.error++;
    }

    // Update average response time
    const currentAvg = this.metrics.requests.averageResponseTime;
    const totalRequests = this.metrics.requests.total;
    this.metrics.requests.averageResponseTime = 
      (currentAvg * (totalRequests - 1) + duration) / totalRequests;
  }

  recordDatabaseQuery(duration) {
    this.metrics.database.queries++;
    
    if (duration > 1000) { // Slow query threshold: 1 second
      this.metrics.database.slowQueries++;
      logger.warn('Slow database query detected', { duration: `${duration}ms` });
    }

    // Update average query time
    const currentAvg = this.metrics.database.averageQueryTime;
    const totalQueries = this.metrics.database.queries;
    this.metrics.database.averageQueryTime = 
      (currentAvg * (totalQueries - 1) + duration) / totalQueries;
  }

  logMetrics() {
    logger.info('Performance Metrics', {
      requests: {
        total: this.metrics.requests.total,
        success: this.metrics.requests.success,
        error: this.metrics.requests.error,
        successRate: `${((this.metrics.requests.success / this.metrics.requests.total) * 100).toFixed(2)}%`,
        averageResponseTime: `${this.metrics.requests.averageResponseTime.toFixed(2)}ms`
      },
      database: {
        queries: this.metrics.database.queries,
        slowQueries: this.metrics.database.slowQueries,
        averageQueryTime: `${this.metrics.database.averageQueryTime.toFixed(2)}ms`
      },
      memory: {
        current: `${this.metrics.memory.usage.toFixed(2)}MB`,
        peak: `${this.metrics.memory.peak.toFixed(2)}MB`
      },
      uptime: {
        seconds: Math.floor(this.metrics.uptime.current / 1000),
        minutes: Math.floor(this.metrics.uptime.current / 60000),
        hours: Math.floor(this.metrics.uptime.current / 3600000)
      }
    });
  }

  getMetrics() {
    this.updateMemoryUsage();
    return {
      ...this.metrics,
      timestamp: new Date().toISOString()
    };
  }

  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        error: 0,
        averageResponseTime: 0
      },
      database: {
        queries: 0,
        slowQueries: 0,
        averageQueryTime: 0
      },
      memory: {
        usage: 0,
        peak: 0
      },
      uptime: {
        startTime: this.metrics.uptime.startTime,
        current: Date.now() - this.metrics.uptime.startTime
      }
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Middleware to track request performance
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const success = res.statusCode < 400;
    performanceMonitor.recordRequest(duration, success);
  });
  
  next();
};

// Database query performance tracking
const trackDatabaseQuery = (query, duration) => {
  performanceMonitor.recordDatabaseQuery(duration);
};

module.exports = {
  performanceMonitor,
  performanceMiddleware,
  trackDatabaseQuery
}; 