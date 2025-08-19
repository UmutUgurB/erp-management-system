const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// Log klasörünü oluştur
const logDir = path.join(__dirname, '../logs');
fs.ensureDirSync(logDir);

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(info => {
    const { timestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// Logger konfigürasyonu
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'erp-backend' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Combined logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Daily rotate logs
    new winston.transports.File({
      filename: path.join(logDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ],
  
  // Exception handling
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ],
  
  // Rejection handling
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log')
    })
  ]
});

// Development ortamında console'a da yaz
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// HTTP request logger middleware
logger.httpLogger = (req, res, next) => {
  const start = Date.now();
  
  // Response'u intercept et
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    });
    
    originalSend.call(this, data);
  };
  
  next();
};

// Database operation logger
logger.dbLogger = {
  query: (operation, collection, query, duration) => {
    logger.debug('Database Query', {
      operation,
      collection,
      query: JSON.stringify(query),
      duration: `${duration}ms`
    });
  },
  
  error: (operation, collection, error) => {
    logger.error('Database Error', {
      operation,
      collection,
      error: error.message,
      stack: error.stack
    });
  }
};

// Security logger
logger.security = {
  loginAttempt: (email, ip, success, reason) => {
    logger.info('Login Attempt', {
      email,
      ip,
      success,
      reason,
      timestamp: new Date().toISOString()
    });
  },
  
  unauthorizedAccess: (ip, url, method, reason) => {
    logger.warn('Unauthorized Access', {
      ip,
      url,
      method,
      reason,
      timestamp: new Date().toISOString()
    });
  },
  
  passwordReset: (email, ip) => {
    logger.info('Password Reset Request', {
      email,
      ip,
      timestamp: new Date().toISOString()
    });
  }
};

// Performance logger
logger.performance = {
  apiCall: (endpoint, method, duration, statusCode) => {
    const level = duration > 1000 ? 'warn' : 'info';
    logger.log(level, 'API Performance', {
      endpoint,
      method,
      duration: `${duration}ms`,
      statusCode,
      slow: duration > 1000
    });
  },
  
  databaseOperation: (operation, collection, duration) => {
    const level = duration > 500 ? 'warn' : 'debug';
    logger.log(level, 'Database Performance', {
      operation,
      collection,
      duration: `${duration}ms`,
      slow: duration > 500
    });
  }
};

// Business logic logger
logger.business = {
  orderCreated: (orderId, customerId, amount) => {
    logger.info('Order Created', {
      orderId,
      customerId,
      amount,
      timestamp: new Date().toISOString()
    });
  },
  
  paymentProcessed: (paymentId, orderId, amount, method) => {
    logger.info('Payment Processed', {
      paymentId,
      orderId,
      amount,
      method,
      timestamp: new Date().toISOString()
    });
  },
  
  inventoryUpdate: (productId, oldQuantity, newQuantity, reason) => {
    logger.info('Inventory Updated', {
      productId,
      oldQuantity,
      newQuantity,
      change: newQuantity - oldQuantity,
      reason,
      timestamp: new Date().toISOString()
    });
  }
};

// Error helper functions
logger.logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

logger.logValidationError = (errors, context = {}) => {
  logger.warn('Validation Error', {
    errors,
    ...context
  });
};

// System logger
logger.system = {
  startup: (port, env) => {
    logger.info('Server Starting', {
      port,
      environment: env,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    });
  },
  
  shutdown: (reason) => {
    logger.info('Server Shutdown', {
      reason,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  },
  
  memoryUsage: () => {
    const usage = process.memoryUsage();
    logger.info('Memory Usage', {
      rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(usage.external / 1024 / 1024)} MB`
    });
  }
};

module.exports = logger;