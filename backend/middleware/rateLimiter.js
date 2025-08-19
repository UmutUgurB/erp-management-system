const crypto = require('crypto');

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.blacklist = new Set();
    this.whitelist = new Set();
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: this.defaultKeyGenerator,
      handler: this.defaultHandler,
      onLimitReached: null
    };
  }

  // Configure rate limiter
  configure(options) {
    this.config = { ...this.config, ...options };
  }

  // Main middleware function
  middleware(options = {}) {
    const config = { ...this.config, ...options };
    
    return (req, res, next) => {
      const key = config.keyGenerator(req);
      
      // Check whitelist
      if (this.whitelist.has(key)) {
        return next();
      }
      
      // Check blacklist
      if (this.blacklist.has(key)) {
        return config.handler(req, res, { 
          message: 'IP address is blacklisted',
          retryAfter: 3600 // 1 hour
        });
      }
      
      const current = this.requests.get(key) || { count: 0, resetTime: Date.now() + config.windowMs };
      
      // Reset counter if window has passed
      if (Date.now() > current.resetTime) {
        current.count = 0;
        current.resetTime = Date.now() + config.windowMs;
      }
      
      // Check if limit exceeded
      if (current.count >= config.maxRequests) {
        this.handleLimitExceeded(req, res, key, config);
        return;
      }
      
      // Increment counter
      current.count++;
      this.requests.set(key, current);
      
      // Add headers
      res.set({
        'X-RateLimit-Limit': config.maxRequests,
        'X-RateLimit-Remaining': Math.max(0, config.maxRequests - current.count),
        'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
      });
      
      // Track request for analytics
      this.trackRequest(key, req, res);
      
      next();
    };
  }

  // Dynamic rate limiting based on user role
  dynamicLimiter(limits) {
    return (req, res, next) => {
      const userRole = req.user?.role || 'anonymous';
      const limit = limits[userRole] || limits.default || { maxRequests: 100, windowMs: 900000 };
      
      const key = this.defaultKeyGenerator(req);
      const current = this.requests.get(key) || { count: 0, resetTime: Date.now() + limit.windowMs };
      
      if (Date.now() > current.resetTime) {
        current.count = 0;
        current.resetTime = Date.now() + limit.windowMs;
      }
      
      if (current.count >= limit.maxRequests) {
        return this.defaultHandler(req, res, { 
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil((current.resetTime - Date.now()) / 1000)
        });
      }
      
      current.count++;
      this.requests.set(key, current);
      
      res.set({
        'X-RateLimit-Limit': limit.maxRequests,
        'X-RateLimit-Remaining': Math.max(0, limit.maxRequests - current.count),
        'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
      });
      
      next();
    };
  }

  // Burst rate limiting
  burstLimiter(maxBurst, windowMs = 60000) {
    return (req, res, next) => {
      const key = this.defaultKeyGenerator(req);
      const now = Date.now();
      
      if (!this.requests.has(key)) {
        this.requests.set(key, { tokens: maxBurst, lastRefill: now });
      }
      
      const bucket = this.requests.get(key);
      const timePassed = now - bucket.lastRefill;
      const tokensToAdd = Math.floor(timePassed / windowMs) * maxBurst;
      
      bucket.tokens = Math.min(maxBurst, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
      
      if (bucket.tokens < 1) {
        return this.defaultHandler(req, res, { 
          message: 'Burst limit exceeded',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
      
      bucket.tokens--;
      this.requests.set(key, bucket);
      
      res.set({
        'X-RateLimit-Burst-Limit': maxBurst,
        'X-RateLimit-Burst-Remaining': bucket.tokens,
        'X-RateLimit-Burst-Reset': new Date(now + windowMs).toISOString()
      });
      
      next();
    };
  }

  // Adaptive rate limiting
  adaptiveLimiter(baseLimit, options = {}) {
    const { 
      increaseFactor = 1.5, 
      decreaseFactor = 0.8, 
      minLimit = 10, 
      maxLimit = 1000,
      learningWindow = 300000 // 5 minutes
    } = options;
    
    return (req, res, next) => {
      const key = this.defaultKeyGenerator(req);
      const now = Date.now();
      
      if (!this.requests.has(key)) {
        this.requests.set(key, { 
          count: 0, 
          limit: baseLimit, 
          resetTime: now + this.config.windowMs,
          learningData: []
        });
      }
      
      const record = this.requests.get(key);
      
      // Reset counter if window has passed
      if (now > record.resetTime) {
        // Analyze performance and adjust limit
        this.adjustLimit(record, learningWindow);
        
        record.count = 0;
        record.resetTime = now + this.config.windowMs;
      }
      
      if (record.count >= record.limit) {
        return this.defaultHandler(req, res, { 
          message: 'Adaptive rate limit exceeded',
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        });
      }
      
      record.count++;
      record.learningData.push({ timestamp: now, success: true });
      
      // Keep only recent learning data
      record.learningData = record.learningData.filter(d => now - d.timestamp < learningWindow);
      
      this.requests.set(key, record);
      
      res.set({
        'X-RateLimit-Limit': record.limit,
        'X-RateLimit-Remaining': Math.max(0, record.limit - record.count),
        'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
      });
      
      next();
    };
  }

  // Adjust limit based on performance
  adjustLimit(record, learningWindow) {
    const recentData = record.learningData.filter(d => Date.now() - d.timestamp < learningWindow);
    const successRate = recentData.filter(d => d.success).length / recentData.length;
    
    if (successRate > 0.95 && record.limit < this.config.maxLimit) {
      record.limit = Math.min(this.config.maxLimit, Math.floor(record.limit * 1.5));
    } else if (successRate < 0.8 && record.limit > this.config.minLimit) {
      record.limit = Math.max(this.config.minLimit, Math.floor(record.limit * 0.8));
    }
  }

  // Handle limit exceeded
  handleLimitExceeded(req, res, key, config) {
    if (config.onLimitReached) {
      config.onLimitReached(req, res, key);
    } else {
      config.handler(req, res, { 
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil(this.config.windowMs / 1000)
      });
    }
  }

  // Default key generator
  defaultKeyGenerator(req) {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  // Default handler
  defaultHandler(req, res, options) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: options.message,
      retryAfter: options.retryAfter
    });
  }

  // Track request for analytics
  trackRequest(key, req, res) {
    // Track response status for adaptive limiting
    res.on('finish', () => {
      const record = this.requests.get(key);
      if (record && record.learningData) {
        const lastRequest = record.learningData[record.learningData.length - 1];
        if (lastRequest) {
          lastRequest.success = res.statusCode < 400;
        }
      }
    });
  }

  // Management methods
  addToWhitelist(key) {
    this.whitelist.add(key);
  }

  removeFromWhitelist(key) {
    this.whitelist.delete(key);
  }

  addToBlacklist(key, duration = 3600000) { // Default 1 hour
    this.blacklist.add(key);
    setTimeout(() => this.blacklist.delete(key), duration);
  }

  removeFromBlacklist(key) {
    this.blacklist.delete(key);
  }

  // Get statistics
  getStats() {
    const stats = {
      totalKeys: this.requests.size,
      whitelisted: this.whitelist.size,
      blacklisted: this.blacklist.size,
      requests: {}
    };
    
    for (const [key, data] of this.requests.entries()) {
      stats.requests[key] = {
        count: data.count,
        limit: data.limit || this.config.maxRequests,
        resetTime: data.resetTime,
        remaining: Math.max(0, (data.limit || this.config.maxRequests) - data.count)
      };
    }
    
    return stats;
  }

  // Clean up expired records
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime + this.config.windowMs) {
        this.requests.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  // Reset all limits
  reset() {
    this.requests.clear();
    this.blacklist.clear();
    this.whitelist.clear();
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Export middleware functions
module.exports = {
  rateLimiter,
  middleware: (options) => rateLimiter.middleware(options),
  dynamicLimiter: (limits) => rateLimiter.dynamicLimiter(limits),
  burstLimiter: (maxBurst, windowMs) => rateLimiter.burstLimiter(maxBurst, windowMs),
  adaptiveLimiter: (baseLimit, options) => rateLimiter.adaptiveLimiter(baseLimit, options),
  configure: (options) => rateLimiter.configure(options),
  addToWhitelist: (key) => rateLimiter.addToWhitelist(key),
  addToBlacklist: (key, duration) => rateLimiter.addToBlacklist(key, duration),
  getStats: () => rateLimiter.getStats(),
  cleanup: () => rateLimiter.cleanup(),
  reset: () => rateLimiter.reset()
};
