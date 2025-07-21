const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
fs.ensureDirSync(logsDir);

// Custom format for logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'erp-system' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Access logs
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Custom logging methods
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      logger.error('HTTP Request Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

const logError = (error, req, res, next) => {
  logger.error('Application Error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id || 'anonymous',
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  next(error);
};

const logDatabase = (operation, collection, documentId, userId) => {
  logger.info('Database Operation', {
    operation,
    collection,
    documentId,
    userId: userId || 'system'
  });
};

const logSecurity = (event, details) => {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

const logPerformance = (operation, duration, details = {}) => {
  logger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...details
  });
};

// Export logger and utility functions
module.exports = {
  logger,
  logRequest,
  logError,
  logDatabase,
  logSecurity,
  logPerformance,
  logsDir
}; 