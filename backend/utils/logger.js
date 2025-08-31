const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

/**
 * Advanced Logging System
 * Provides structured logging with multiple transports and formats
 */
class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    
    // Create logs directory if it doesn't exist
    require('fs').mkdirSync(this.logDir, { recursive: true });

    this.setupTransports();
    this.setupFormats();
    this.createLogger();
  }

  setupTransports() {
    this.transports = {
      // Console transport for development
      console: new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),

      // Daily rotate file transport for all logs
      all: new DailyRotateFile({
        filename: path.join(this.logDir, 'all-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info'
      }),

      // Daily rotate file transport for errors
      error: new DailyRotateFile({
        filename: path.join(this.logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error'
      }),

      // Daily rotate file transport for API requests
      api: new DailyRotateFile({
        filename: path.join(this.logDir, 'api-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '7d',
        level: 'info'
      }),

      // Daily rotate file transport for database operations
      database: new DailyRotateFile({
        filename: path.join(this.logDir, 'database-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '7d',
        level: 'info'
      }),

      // Daily rotate file transport for security events
      security: new DailyRotateFile({
        filename: path.join(this.logDir, 'security-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '90d',
        level: 'warn'
      }),

      // Daily rotate file transport for performance metrics
      performance: new DailyRotateFile({
        filename: path.join(this.logDir, 'performance-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '7d',
        level: 'info'
      })
    };
  }

  setupFormats() {
    this.formats = {
      // JSON format for file logs
      json: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),

      // Simple format for console
      simple: winston.format.combine(
        winston.format.timestamp({
          format: 'HH:mm:ss'
        }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let log = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          return log;
        })
      ),

      // API request format
      api: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, method, url, statusCode, responseTime, ip, userAgent }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            method,
            url,
            statusCode,
            responseTime: `${responseTime}ms`,
            ip,
            userAgent
          });
        })
      )
    };
  }

  createLogger() {
    // Main logger
    this.logger = winston.createLogger({
      level: 'info',
      format: this.formats.json,
      defaultMeta: { service: 'erp-backend' },
      transports: [
        this.transports.all,
        this.transports.error
      ]
    });

    // API logger
    this.apiLogger = winston.createLogger({
      level: 'info',
      format: this.formats.api,
      defaultMeta: { service: 'erp-api' },
      transports: [this.transports.api]
    });

    // Database logger
    this.dbLogger = winston.createLogger({
      level: 'info',
      format: this.formats.json,
      defaultMeta: { service: 'erp-database' },
      transports: [this.transports.database]
    });

    // Security logger
    this.securityLogger = winston.createLogger({
      level: 'warn',
      format: this.formats.json,
      defaultMeta: { service: 'erp-security' },
      transports: [this.transports.security]
    });

    // Performance logger
    this.performanceLogger = winston.createLogger({
      level: 'info',
      format: this.formats.json,
      defaultMeta: { service: 'erp-performance' },
      transports: [this.transports.performance]
    });

    // Add console transport in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(this.transports.console);
      this.apiLogger.add(this.transports.console);
      this.dbLogger.add(this.transports.console);
      this.securityLogger.add(this.transports.console);
      this.performanceLogger.add(this.transports.console);
    }
  }

  // Main logging methods
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // API logging methods
  logApiRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      requestId: req.id
    };

    if (res.statusCode >= 400) {
      this.apiLogger.error('API Request Error', logData);
    } else {
      this.apiLogger.info('API Request', logData);
    }
  }

  logApiError(req, error, statusCode) {
    this.apiLogger.error('API Error', {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      requestId: req.id
    });
  }

  // Database logging methods
  logDbQuery(operation, collection, query, executionTime, result) {
    this.dbLogger.info('Database Operation', {
      operation,
      collection,
      query: JSON.stringify(query),
      executionTime: `${executionTime}ms`,
      resultCount: Array.isArray(result) ? result.length : 1,
      timestamp: new Date().toISOString()
    });
  }

  logDbError(operation, collection, error, query) {
    this.dbLogger.error('Database Error', {
      operation,
      collection,
      error: error.message,
      stack: error.stack,
      query: JSON.stringify(query),
      timestamp: new Date().toISOString()
    });
  }

  // Security logging methods
  logSecurityEvent(event, details, severity = 'medium') {
    this.securityLogger.warn('Security Event', {
      event,
      details,
      severity,
      timestamp: new Date().toISOString(),
      ip: details.ip,
      userId: details.userId,
      userAgent: details.userAgent
    });
  }

  logAuthentication(operation, userId, ip, userAgent, success, details = {}) {
    const level = success ? 'info' : 'warn';
    this.securityLogger[level]('Authentication Event', {
      operation,
      userId,
      ip,
      userAgent,
      success,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Performance logging methods
  logPerformance(operation, duration, metadata = {}) {
    this.performanceLogger.info('Performance Metric', {
      operation,
      duration: `${duration}ms`,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  logSlowOperation(operation, duration, threshold, metadata = {}) {
    if (duration > threshold) {
      this.performanceLogger.warn('Slow Operation Detected', {
        operation,
        duration: `${duration}ms`,
        threshold: `${threshold}ms`,
        metadata,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Cache logging methods
  logCacheHit(key, ttl) {
    this.logger.debug('Cache Hit', { key, ttl, timestamp: new Date().toISOString() });
  }

  logCacheMiss(key) {
    this.logger.debug('Cache Miss', { key, timestamp: new Date().toISOString() });
  }

  logCacheSet(key, ttl) {
    this.logger.debug('Cache Set', { key, ttl, timestamp: new Date().toISOString() });
  }

  // Job queue logging methods
  logJobStart(jobId, jobType, payload) {
    this.logger.info('Job Started', {
      jobId,
      jobType,
      payload: JSON.stringify(payload),
      timestamp: new Date().toISOString()
    });
  }

  logJobComplete(jobId, jobType, duration, result) {
    this.logger.info('Job Completed', {
      jobId,
      jobType,
      duration: `${duration}ms`,
      result: JSON.stringify(result),
      timestamp: new Date().toISOString()
    });
  }

  logJobError(jobId, jobType, error, payload) {
    this.logger.error('Job Error', {
      jobId,
      jobType,
      error: error.message,
      stack: error.stack,
      payload: JSON.stringify(payload),
      timestamp: new Date().toISOString()
    });
  }

  // WebSocket logging methods
  logWebSocketEvent(event, connectionId, data) {
    this.logger.info('WebSocket Event', {
      event,
      connectionId,
      data: JSON.stringify(data),
      timestamp: new Date().toISOString()
    });
  }

  logWebSocketError(event, connectionId, error) {
    this.logger.error('WebSocket Error', {
      event,
      connectionId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  // Utility methods
  getLogStats() {
    return {
      logDir: this.logDir,
      transports: Object.keys(this.transports),
      levels: this.logger.levels
    };
  }

  // Graceful shutdown
  async shutdown() {
    return new Promise((resolve) => {
      this.logger.on('finish', () => {
        resolve();
      });
      this.logger.end();
    });
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = { logger, Logger };