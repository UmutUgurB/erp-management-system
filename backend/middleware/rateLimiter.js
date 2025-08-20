const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// Redis client for distributed rate limiting
let redisClient = null;

try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected for rate limiting');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis connection error:', err);
    redisClient = null;
  });
} catch (error) {
  logger.warn('Redis not available, using in-memory rate limiting');
}

// Rate limiting strategies
const strategies = {
  // Strict rate limiting for authentication endpoints
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
      error: 'Too many authentication attempts',
      message: 'Please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  },

  // Standard rate limiting for API endpoints
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Generous rate limiting for public endpoints
  generous: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
    message: {
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Burst rate limiting for high-traffic endpoints
  burst: {
    windowMs: 60 * 1000, // 1 minute
    max: 200, // 200 requests per minute
    message: {
      error: 'Rate limit exceeded',
      message: 'Please slow down your requests',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
};

// Create rate limiter with Redis store if available
const createRateLimiter = (strategy, keyGenerator = null) => {
  const config = {
    ...strategies[strategy],
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    }) : undefined,
    keyGenerator: keyGenerator || ((req) => {
      // Use IP address as default key
      return req.ip || req.connection.remoteAddress || 'unknown';
    }),
    handler: (req, res) => {
      const retryAfter = Math.ceil(strategies[strategy].windowMs / 1000 / 60);
      
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        retryAfter: `${retryAfter} minutes`
      });

      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: strategies[strategy].message.message,
        retryAfter: `${retryAfter} minutes`,
        timestamp: new Date().toISOString()
      });
    },
    onLimitReached: (req, res, options) => {
      logger.warn('Rate limit reached', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        limit: options.max,
        windowMs: options.windowMs
      });
    }
  };

  return rateLimit(config);
};

// Specialized rate limiters
const authRateLimiter = createRateLimiter('strict', (req) => {
  // Use IP + username for auth endpoints
  const username = req.body?.username || req.body?.email || 'unknown';
  return `${req.ip}-${username}`;
});

const apiRateLimiter = createRateLimiter('standard');

const publicRateLimiter = createRateLimiter('generous');

const burstRateLimiter = createRateLimiter('burst');

// Dynamic rate limiter based on user role
const dynamicRateLimiter = (req, res, next) => {
  const user = req.user;
  
  if (!user) {
    // Anonymous users get standard rate limiting
    return apiRateLimiter(req, res, next);
  }

  // Premium users get higher limits
  if (user.role === 'premium' || user.role === 'admin') {
    const premiumConfig = {
      ...strategies.generous,
      max: strategies.generous.max * 2 // Double the limit for premium users
    };
    
    const premiumLimiter = rateLimit({
      ...premiumConfig,
      store: redisClient ? new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
      }) : undefined,
      keyGenerator: (req) => `premium-${req.user.id}`
    });
    
    return premiumLimiter(req, res, next);
  }

  // Regular users get standard rate limiting
  return apiRateLimiter(req, res, next);
};

// IP-based rate limiting with whitelist
const ipBasedRateLimiter = (whitelist = []) => {
  return rateLimit({
    ...strategies.standard,
    keyGenerator: (req) => req.ip,
    skip: (req) => whitelist.includes(req.ip),
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    }) : undefined
  });
};

// User-based rate limiting
const userBasedRateLimiter = (strategy = 'standard') => {
  return rateLimit({
    ...strategies[strategy],
    keyGenerator: (req) => {
      if (!req.user) return req.ip;
      return `user-${req.user.id}`;
    },
    skip: (req) => !req.user, // Skip if no user (fallback to IP-based)
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    }) : undefined
  });
};

// Endpoint-specific rate limiting
const endpointRateLimiters = {
  // Authentication endpoints
  '/auth/login': authRateLimiter,
  '/auth/register': authRateLimiter,
  '/auth/forgot-password': authRateLimiter,
  '/auth/reset-password': authRateLimiter,
  
  // API endpoints
  '/api': apiRateLimiter,
  
  // Public endpoints
  '/public': publicRateLimiter,
  
  // High-traffic endpoints
  '/api/search': burstRateLimiter,
  '/api/export': burstRateLimiter
};

// Apply rate limiting based on endpoint
const applyRateLimiting = (req, res, next) => {
  const path = req.path;
  
  // Find matching rate limiter
  for (const [endpoint, limiter] of Object.entries(endpointRateLimiters)) {
    if (path.startsWith(endpoint)) {
      return limiter(req, res, next);
    }
  }
  
  // Default to standard rate limiting
  return apiRateLimiter(req, res, next);
};

// Health check for rate limiting system
const getRateLimitStatus = async () => {
  try {
    if (redisClient) {
      const info = await redisClient.info();
      return {
        status: 'healthy',
        store: 'redis',
        info: info.split('\r\n').slice(0, 10) // First 10 lines of Redis info
      };
    }
    
    return {
      status: 'healthy',
      store: 'memory',
      info: 'Using in-memory rate limiting'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      store: 'unknown',
      error: error.message
    };
  }
};

// Cleanup function
const cleanup = () => {
  if (redisClient) {
    redisClient.disconnect();
  }
};

module.exports = {
  // Individual rate limiters
  authRateLimiter,
  apiRateLimiter,
  publicRateLimiter,
  burstRateLimiter,
  dynamicRateLimiter,
  ipBasedRateLimiter,
  userBasedRateLimiter,
  
  // Auto-apply rate limiting
  applyRateLimiting,
  
  // Utility functions
  getRateLimitStatus,
  cleanup,
  
  // Strategies for custom limiters
  strategies
};
