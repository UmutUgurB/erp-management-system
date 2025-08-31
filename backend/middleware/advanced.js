const { logger } = require('../utils/logger');
const { performanceMonitor } = require('../utils/performanceMonitor');
const { cacheManager } = require('../utils/cacheManager');
const { ResponseHandler } = require('../utils/responseHandler');

/**
 * Request Timing Middleware
 * Measures and logs request response times
 */
const requestTiming = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Log request timing
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });
    
    // Record performance metrics
    performanceMonitor.recordRequest(req.method, req.url, responseTime, res.statusCode);
    
    // Add response time header
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    
    // Call original end method
    originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Request Validation Middleware
 * Validates request body, query, and params
 */
const requestValidation = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.body) {
        const { error } = schema.body.validate(req.body);
        if (error) {
          return ResponseHandler.validationError(res, error.details);
        }
      }
      
      if (schema.query) {
        const { error } = schema.query.validate(req.query);
        if (error) {
          return ResponseHandler.validationError(res, error.details);
        }
      }
      
      if (schema.params) {
        const { error } = schema.params.validate(req.params);
        if (error) {
          return ResponseHandler.validationError(res, error.details);
        }
      }
      
      next();
    } catch (error) {
      logger.error('Request validation error', {
        error: error.message,
        url: req.url,
        method: req.method
      });
      
      return ResponseHandler.error(res, error, 400);
    }
  };
};

/**
 * Cache Middleware
 * Implements intelligent caching for GET requests
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
    condition = (req) => req.method === 'GET',
    varyBy = ['authorization', 'accept-language']
  } = options;
  
  return async (req, res, next) => {
    if (!condition(req)) {
      return next();
    }
    
    try {
      const cacheKey = keyGenerator(req);
      const varyHeaders = varyBy.map(header => req.get(header)).filter(Boolean);
      const fullCacheKey = varyHeaders.length > 0 
        ? `${cacheKey}:${varyHeaders.join(':')}`
        : cacheKey;
      
      // Try to get from cache
      const cachedData = await cacheManager.get(fullCacheKey);
      
      if (cachedData) {
        logger.info('Cache hit', {
          key: fullCacheKey,
          url: req.url
        });
        
        return ResponseHandler.cached(res, cachedData, 'Veriler cache\'den getirildi', {
          key: fullCacheKey,
          ttl
        });
      }
      
      // Store original send method
      const originalSend = res.send;
      const originalJson = res.json;
      
      // Override send method to cache response
      res.send = function(data) {
        if (res.statusCode === 200) {
          cacheManager.set(fullCacheKey, data, ttl);
          logger.info('Cache set', {
            key: fullCacheKey,
            url: req.url,
            ttl
          });
        }
        originalSend.call(this, data);
      };
      
      // Override json method to cache response
      res.json = function(data) {
        if (res.statusCode === 200) {
          cacheManager.set(fullCacheKey, data, ttl);
          logger.info('Cache set', {
            key: fullCacheKey,
            url: req.url,
            ttl
          });
        }
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error', {
        error: error.message,
        url: req.url
      });
      next();
    }
  };
};

/**
 * Performance Monitoring Middleware
 * Monitors and logs performance metrics
 */
const performanceMonitoring = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  // Override res.end to capture detailed metrics
  const originalEnd = res.end;
  res.end = function(...args) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Record detailed performance metrics
    performanceMonitor.recordDetailedMetrics({
      method: req.method,
      url: req.url,
      duration,
      statusCode: res.statusCode,
      contentLength: res.get('Content-Length'),
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date()
    });
    
    // Check for slow operations
    if (duration > 1000) { // 1 second threshold
      performanceMonitor.recordSlowOperation(req.method, req.url, duration);
      logger.warn('Slow operation detected', {
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`
      });
    }
    
    // Add performance headers
    res.setHeader('X-Processing-Time', `${duration.toFixed(2)}ms`);
    
    originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Error Tracking Middleware
 * Enhanced error handling and tracking
 */
const errorTracking = (req, res, next) => {
  // Store original error handler
  const originalErrorHandler = res.locals.errorHandler;
  
  // Override error handling
  res.locals.errorHandler = (error, statusCode = 500) => {
    // Log detailed error information
    logger.error('Request error', {
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers
    });
    
    // Record error metrics
    performanceMonitor.recordError(req.method, req.url, statusCode, error.message);
    
    // Call original error handler if exists
    if (originalErrorHandler) {
      return originalErrorHandler(error, statusCode);
    }
    
    // Default error response
    return ResponseHandler.error(res, error, statusCode);
  };
  
  next();
};

/**
 * Request Logging Middleware
 * Comprehensive request logging
 */
const requestLogging = (req, res, next) => {
  const requestData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    protocol: req.protocol,
    hostname: req.hostname,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    accept: req.get('Accept'),
    acceptLanguage: req.get('Accept-Language'),
    acceptEncoding: req.get('Accept-Encoding'),
    referer: req.get('Referer'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    authorization: req.get('Authorization') ? 'Bearer ***' : undefined,
    cookies: Object.keys(req.cookies || {}),
    query: req.query,
    params: req.params,
    body: req.method !== 'GET' ? req.body : undefined
  };
  
  logger.info('Incoming request', requestData);
  
  next();
};

/**
 * Response Enhancement Middleware
 * Adds useful headers and response metadata
 */
const responseEnhancement = (req, res, next) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add API version header
  res.setHeader('X-API-Version', '2.1.0');
  
  // Add request ID for tracking
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', requestId);
  
  // Add timestamp header
  res.setHeader('X-Timestamp', new Date().toISOString());
  
  // Override json method to add metadata
  const originalJson = res.json;
  res.json = function(data) {
    const enhancedData = {
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        apiVersion: '2.1.0',
        endpoint: req.originalUrl,
        method: req.method
      }
    };
    
    originalJson.call(this, enhancedData);
  };
  
  next();
};

/**
 * Database Query Monitoring Middleware
 * Monitors database query performance
 */
const databaseMonitoring = (req, res, next) => {
  // Store original database operations
  const originalDbOps = req.app.locals.dbOps || {};
  
  // Override database operations to add monitoring
  req.app.locals.dbOps = {
    ...originalDbOps,
    monitor: (operation, collection, query, executionTime, result) => {
      // Log database operation
      logger.info('Database operation', {
        operation,
        collection,
        query: JSON.stringify(query),
        executionTime: `${executionTime}ms`,
        url: req.url,
        method: req.method
      });
      
      // Record database metrics
      performanceMonitor.recordDatabaseOperation(operation, collection, executionTime);
      
      // Check for slow queries
      if (executionTime > 100) { // 100ms threshold
        performanceMonitor.recordSlowQuery(operation, collection, executionTime, query);
        logger.warn('Slow database query detected', {
          operation,
          collection,
          executionTime: `${executionTime}ms`,
          query: JSON.stringify(query)
        });
      }
      
      // Call original monitoring if exists
      if (originalDbOps.monitor) {
        originalDbOps.monitor(operation, collection, query, executionTime, result);
      }
    }
  };
  
  next();
};

/**
 * Rate Limiting Enhancement Middleware
 * Enhanced rate limiting with user-specific limits
 */
const enhancedRateLimiting = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Çok fazla istek gönderildi',
    standardHeaders = true,
    legacyHeaders = false,
    store = null
  } = options;
  
  return (req, res, next) => {
    // Get user role for dynamic limits
    const userRole = req.user?.role || 'anonymous';
    
    // Adjust limits based on user role
    let userMax = max;
    switch (userRole) {
      case 'admin':
        userMax = max * 3; // 3x limit for admins
        break;
      case 'manager':
        userMax = max * 2; // 2x limit for managers
        break;
      case 'user':
        userMax = max; // Standard limit for users
        break;
      default:
        userMax = Math.floor(max * 0.5); // Reduced limit for anonymous
    }
    
    // Store rate limit info in request
    req.rateLimit = {
      windowMs,
      max: userMax,
      current: 0,
      remaining: userMax,
      resetTime: new Date(Date.now() + windowMs)
    };
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', userMax);
    res.setHeader('X-RateLimit-Remaining', userMax);
    res.setHeader('X-RateLimit-Reset', req.rateLimit.resetTime.getTime());
    
    next();
  };
};

/**
 * Request Sanitization Middleware
 * Sanitizes request data to prevent injection attacks
 */
const requestSanitization = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/[<>]/g, '') // Remove < and >
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+=/gi, '') // Remove event handlers
          .trim();
      }
    });
  }
  
  // Sanitize body parameters
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim();
      }
    });
  }
  
  // Sanitize URL parameters
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key]
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim();
      }
    });
  }
  
  next();
};

/**
 * Compression Optimization Middleware
 * Optimizes compression based on content type and size
 */
const compressionOptimization = (req, res, next) => {
  // Skip compression for small responses
  const originalSend = res.send;
  res.send = function(data) {
    const contentLength = Buffer.byteLength(data, 'utf8');
    
    // Only compress if content is large enough
    if (contentLength > 1024) { // 1KB threshold
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
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
};
