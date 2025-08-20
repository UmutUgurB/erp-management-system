const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
};

// Create Redis client
let redisClient;
try {
  redisClient = new Redis(redisConfig);
  redisClient.on('error', (err) => {
    logger.error('Redis connection error:', err);
  });
  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });
} catch (error) {
  logger.warn('Redis not available, falling back to memory store');
  redisClient = null;
}

// Rate limit configurations
const rateLimitConfigs = {
  // Global rate limit
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: 'Too many requests',
      message: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    }) : undefined
  },

  // API rate limit (more strict)
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: {
      success: false,
      error: 'API rate limit exceeded',
      message: 'API istek limiti aşıldı. Lütfen 15 dakika sonra tekrar deneyin.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    }) : undefined
  },

  // Authentication rate limit (very strict)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: {
      success: false,
      error: 'Too many authentication attempts',
      message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    }) : undefined
  },

  // File upload rate limit
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 uploads per hour
    message: {
      success: false,
      error: 'Upload limit exceeded',
      message: 'Dosya yükleme limiti aşıldı. Lütfen 1 saat sonra tekrar deneyin.',
      retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    }) : undefined
  },

  // Search rate limit
  search: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // limit each IP to 30 searches per 5 minutes
    message: {
      success: false,
      error: 'Search limit exceeded',
      message: 'Arama limiti aşıldı. Lütfen 5 dakika sonra tekrar deneyin.',
      retryAfter: '5 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    }) : undefined
  },

  // Export rate limit
  export: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 exports per hour
    message: {
      success: false,
      error: 'Export limit exceeded',
      message: 'Veri export limiti aşıldı. Lütfen 1 saat sonra tekrar deneyin.',
      retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    }) : undefined
  }
};

// Custom key generator for rate limiting
const keyGenerator = (req) => {
  // Use user ID if authenticated, otherwise use IP
  if (req.user && req.user.id) {
    return `user:${req.user.id}`;
  }
  
  // Use IP address
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  return `ip:${ip}`;
};

// Custom skip function for rate limiting
const skipSuccessfulRequests = (req, res) => {
  // Skip rate limiting for successful requests (optional)
  return res.statusCode < 400;
};

// Custom skip function for specific paths
const skipPaths = (paths) => {
  return (req) => {
    return paths.some(path => req.path.startsWith(path));
  };
};

// Create rate limiters
const createRateLimiter = (config, options = {}) => {
  return rateLimit({
    ...config,
    keyGenerator: options.keyGenerator || keyGenerator,
    skip: options.skip || skipSuccessfulRequests,
    handler: (req, res) => {
      // Log rate limit exceeded
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'anonymous'
      });

      // Set retry-after header
      res.set('Retry-After', Math.ceil(config.windowMs / 1000));

      // Send error response
      res.status(429).json(config.message);
    },
    onLimitReached: (req, res, options) => {
      // Additional logging when limit is reached
      logger.info('Rate limit reached', {
        ip: req.ip,
        path: req.path,
        limit: options.max,
        windowMs: options.windowMs,
        userId: req.user?.id || 'anonymous'
      });
    }
  });
};

// Create specific rate limiters
const rateLimiters = {
  // Global rate limiter
  global: createRateLimiter(rateLimitConfigs.global),

  // API rate limiter
  api: createRateLimiter(rateLimitConfigs.api, {
    skip: skipPaths(['/api'])
  }),

  // Authentication rate limiter
  auth: createRateLimiter(rateLimitConfigs.auth, {
    skip: skipPaths(['/api/auth/login', '/api/auth/register'])
  }),

  // File upload rate limiter
  upload: createRateLimiter(rateLimitConfigs.upload, {
    skip: skipPaths(['/api/upload'])
  }),

  // Search rate limiter
  search: createRateLimiter(rateLimitConfigs.search, {
    skip: skipPaths(['/api/search'])
  }),

  // Export rate limiter
  export: createRateLimiter(rateLimitConfigs.export, {
    skip: skipPaths(['/api/export'])
  }),

  // Custom rate limiter for specific endpoints
  custom: (windowMs, max, message, options = {}) => {
    return createRateLimiter({
      windowMs,
      max,
      message: {
        success: false,
        error: 'Rate limit exceeded',
        message: message || 'İstek limiti aşıldı.',
        retryAfter: `${Math.ceil(windowMs / 1000)} seconds`
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: redisClient ? new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
      }) : undefined
    }, options);
  }
};

// Dynamic rate limiting based on user role
const dynamicRateLimit = (req, res, next) => {
  const user = req.user;
  const path = req.path;

  // Different limits for different user roles
  let limit;
  let windowMs;

  if (user && user.role === 'admin') {
    // Admins get higher limits
    limit = 200;
    windowMs = 15 * 60 * 1000; // 15 minutes
  } else if (user && user.role === 'manager') {
    // Managers get medium limits
    limit = 150;
    windowMs = 15 * 60 * 1000; // 15 minutes
  } else if (user && user.role === 'user') {
    // Regular users get standard limits
    limit = 100;
    windowMs = 15 * 60 * 1000; // 15 minutes
  } else {
    // Anonymous users get lower limits
    limit = 50;
    windowMs = 15 * 60 * 1000; // 15 minutes
  }

  // Create dynamic rate limiter
  const dynamicLimiter = createRateLimiter({
    windowMs,
    max: limit,
    message: {
      success: false,
      error: 'Rate limit exceeded',
      message: `İstek limiti aşıldı. Lütfen ${Math.ceil(windowMs / 60000)} dakika sonra tekrar deneyin.`,
      retryAfter: `${Math.ceil(windowMs / 1000)} seconds`
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    }) : undefined
  });

  // Apply the dynamic rate limiter
  dynamicLimiter(req, res, next);
};

// Burst rate limiting for high-traffic periods
const burstRateLimit = (req, res, next) => {
  const burstLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Allow burst of 20 requests per minute
    message: {
      success: false,
      error: 'Burst rate limit exceeded',
      message: 'Çok hızlı istek gönderildi. Lütfen 1 dakika sonra tekrar deneyin.',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    }) : undefined
  });

  burstLimiter(req, res, next);
};

// Rate limit statistics
const getRateLimitStats = async () => {
  if (!redisClient) {
    return { error: 'Redis not available' };
  }

  try {
    const keys = await redisClient.keys('rl:*');
    const stats = {};

    for (const key of keys) {
      const value = await redisClient.get(key);
      if (value) {
        const parts = key.split(':');
        const type = parts[1] || 'unknown';
        const identifier = parts[2] || 'unknown';
        
        if (!stats[type]) {
          stats[type] = {};
        }
        
        stats[type][identifier] = parseInt(value);
      }
    }

    return stats;
  } catch (error) {
    logger.error('Error getting rate limit stats:', error);
    return { error: error.message };
  }
};

// Reset rate limit for specific key
const resetRateLimit = async (key) => {
  if (!redisClient) {
    return { error: 'Redis not available' };
  }

  try {
    const result = await redisClient.del(key);
    return { success: result > 0, deleted: result };
  } catch (error) {
    logger.error('Error resetting rate limit:', error);
    return { error: error.message };
  }
};

// Health check for Redis
const checkRedisHealth = async () => {
  if (!redisClient) {
    return { status: 'unavailable', message: 'Redis not configured' };
  }

  try {
    await redisClient.ping();
    return { status: 'healthy', message: 'Redis connection OK' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
};

// Cleanup function
const cleanup = () => {
  if (redisClient) {
    redisClient.disconnect();
    logger.info('Redis client disconnected');
  }
};

// Graceful shutdown
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

module.exports = {
  // Rate limiters
  rateLimiters,
  
  // Specific limiters
  global: rateLimiters.global,
  api: rateLimiters.api,
  auth: rateLimiters.auth,
  upload: rateLimiters.upload,
  search: rateLimiters.search,
  export: rateLimiters.export,
  custom: rateLimiters.custom,
  
  // Dynamic and burst rate limiting
  dynamic: dynamicRateLimit,
  burst: burstRateLimit,
  
  // Utility functions
  getStats: getRateLimitStats,
  reset: resetRateLimit,
  health: checkRedisHealth,
  cleanup,
  
  // Configuration
  config: rateLimitConfigs,
  
  // Redis client (for advanced usage)
  redis: redisClient
};
