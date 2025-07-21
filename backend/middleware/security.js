const helmet = require('helmet');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { logger } = require('../utils/logger');

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip || req.connection.remoteAddress);
    next();
  } catch (rejRes) {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });
    
    res.status(429).json({
      success: false,
      message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

// API specific rate limiter (more strict)
const apiRateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  points: 50, // Number of requests
  duration: 60, // Per 60 seconds
});

const apiRateLimitMiddleware = async (req, res, next) => {
  try {
    await apiRateLimiter.consume(req.ip || req.connection.remoteAddress);
    next();
  } catch (rejRes) {
    logger.warn('API rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });
    
    res.status(429).json({
      success: false,
      message: 'API istek limiti aşıldı. Lütfen daha sonra tekrar deneyin.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

// Auth rate limiter (for login attempts)
const authRateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  points: 5, // Number of login attempts
  duration: 300, // Per 5 minutes
});

const authRateLimitMiddleware = async (req, res, next) => {
  try {
    await authRateLimiter.consume(req.ip || req.connection.remoteAddress);
    next();
  } catch (rejRes) {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });
    
    res.status(429).json({
      success: false,
      message: 'Çok fazla giriş denemesi. Lütfen 5 dakika sonra tekrar deneyin.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'https://yourdomain.com'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// Request logging middleware
const requestLogger = (req, res, next) => {
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
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  logger.error('Application Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id || 'anonymous',
    ip: req.ip
  });
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Veri doğrulama hatası',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Geçersiz ID formatı'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Bu kayıt zaten mevcut'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Sunucu hatası' 
      : err.message
  });
};

module.exports = {
  rateLimitMiddleware,
  apiRateLimitMiddleware,
  authRateLimitMiddleware,
  securityHeaders,
  compressionMiddleware,
  corsOptions,
  requestLogger,
  errorHandler
}; 