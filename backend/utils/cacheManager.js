const Redis = require('ioredis');
const logger = require('./logger');

// Cache configuration
const cacheConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 1, // Use different DB for cache
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keyPrefix: 'cache:'
  },
  memory: {
    maxSize: 1000, // Maximum number of items in memory cache
    ttl: 300000, // 5 minutes default TTL
    checkPeriod: 60000 // Check for expired items every minute
  }
};

// Memory cache fallback
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.size = 0;
    this.maxSize = cacheConfig.memory.maxSize;
    this.checkPeriod = cacheConfig.memory.checkPeriod;
    
    // Start cleanup timer
    this.startCleanupTimer();
  }

  set(key, value, ttl = cacheConfig.memory.ttl) {
    // Remove existing timer if key exists
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Remove oldest items if cache is full
    if (this.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
    this.timers.set(key, setTimeout(() => this.delete(key), ttl));
    
    if (!this.cache.has(key)) {
      this.size++;
    }
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    if (this.cache.delete(key)) {
      this.size--;
    }
  }

  has(key) {
    return this.cache.has(key) && this.get(key) !== null;
  }

  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
    this.size = 0;
  }

  keys() {
    return Array.from(this.cache.keys());
  }

  size() {
    return this.size;
  }

  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < oldestTime) {
        oldestTime = item.expiresAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  startCleanupTimer() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiresAt) {
          this.delete(key);
        }
      }
    }, this.checkPeriod);
  }
}

// Cache Manager Class
class CacheManager {
  constructor() {
    this.redis = null;
    this.memory = new MemoryCache();
    this.isRedisAvailable = false;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };

    this.initializeRedis();
  }

  // Initialize Redis connection
  async initializeRedis() {
    try {
      this.redis = new Redis(cacheConfig.redis);
      
      this.redis.on('error', (err) => {
        logger.error('Redis cache error:', err);
        this.isRedisAvailable = false;
      });

      this.redis.on('connect', () => {
        logger.info('Redis cache connected successfully');
        this.isRedisAvailable = true;
      });

      this.redis.on('ready', () => {
        this.isRedisAvailable = true;
      });

      // Test connection
      await this.redis.ping();
      this.isRedisAvailable = true;
      
    } catch (error) {
      logger.warn('Redis cache not available, using memory cache only:', error.message);
      this.isRedisAvailable = false;
    }
  }

  // Set cache value
  async set(key, value, ttl = 3600) {
    try {
      this.stats.sets++;
      
      // Always set in memory cache as fallback
      this.memory.set(key, value, ttl * 1000);

      // Try to set in Redis if available
      if (this.isRedisAvailable && this.redis) {
        const serializedValue = JSON.stringify(value);
        await this.redis.setex(key, ttl, serializedValue);
      }

      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache set error:', error);
      return false;
    }
  }

  // Get cache value
  async get(key) {
    try {
      // Try Redis first
      if (this.isRedisAvailable && this.redis) {
        try {
          const value = await this.redis.get(key);
          if (value) {
            this.stats.hits++;
            const parsedValue = JSON.parse(value);
            // Update memory cache
            this.memory.set(key, parsedValue, 300000); // 5 minutes
            return parsedValue;
          }
        } catch (redisError) {
          logger.warn('Redis get error, falling back to memory:', redisError.message);
        }
      }

      // Fallback to memory cache
      const memoryValue = this.memory.get(key);
      if (memoryValue !== null) {
        this.stats.hits++;
        return memoryValue;
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache get error:', error);
      return null;
    }
  }

  // Delete cache value
  async delete(key) {
    try {
      this.stats.deletes++;
      
      // Delete from memory cache
      this.memory.delete(key);

      // Delete from Redis if available
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(key);
      }

      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  // Check if key exists
  async exists(key) {
    try {
      // Check memory cache first
      if (this.memory.has(key)) {
        return true;
      }

      // Check Redis if available
      if (this.isRedisAvailable && this.redis) {
        const exists = await this.redis.exists(key);
        return exists === 1;
      }

      return false;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  // Set multiple values
  async mset(keyValuePairs, ttl = 3600) {
    try {
      const results = [];
      
      for (const [key, value] of keyValuePairs) {
        const result = await this.set(key, value, ttl);
        results.push({ key, success: result });
      }

      return results;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache mset error:', error);
      return keyValuePairs.map(([key]) => ({ key, success: false }));
    }
  }

  // Get multiple values
  async mget(keys) {
    try {
      const results = [];
      
      for (const key of keys) {
        const value = await this.get(key);
        results.push({ key, value, exists: value !== null });
      }

      return results;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache mget error:', error);
      return keys.map(key => ({ key, value: null, exists: false }));
    }
  }

  // Increment counter
  async increment(key, amount = 1, ttl = 3600) {
    try {
      const currentValue = await this.get(key) || 0;
      const newValue = currentValue + amount;
      await this.set(key, newValue, ttl);
      return newValue;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache increment error:', error);
      return null;
    }
  }

  // Decrement counter
  async decrement(key, amount = 1, ttl = 3600) {
    try {
      const currentValue = await this.get(key) || 0;
      const newValue = Math.max(0, currentValue - amount);
      await this.set(key, newValue, ttl);
      return newValue;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache decrement error:', error);
      return null;
    }
  }

  // Get cache statistics
  getStats() {
    const memoryStats = {
      size: this.memory.size,
      keys: this.memory.keys().length
    };

    const redisStats = this.isRedisAvailable ? {
      status: 'connected',
      info: this.redis ? 'available' : 'unavailable'
    } : {
      status: 'disconnected',
      info: 'unavailable'
    };

    return {
      redis: redisStats,
      memory: memoryStats,
      stats: { ...this.stats },
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  // Clear all cache
  async clear() {
    try {
      // Clear memory cache
      this.memory.clear();

      // Clear Redis cache if available
      if (this.isRedisAvailable && this.redis) {
        const keys = await this.redis.keys('cache:*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      // Reset stats
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0
      };

      logger.info('Cache cleared successfully');
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  // Get cache keys by pattern
  async keys(pattern = '*') {
    try {
      const keys = [];

      // Get memory cache keys
      const memoryKeys = this.memory.keys();
      keys.push(...memoryKeys);

      // Get Redis keys if available
      if (this.isRedisAvailable && this.redis) {
        try {
          const redisKeys = await this.redis.keys(pattern);
          keys.push(...redisKeys);
        } catch (redisError) {
          logger.warn('Redis keys error:', redisError.message);
        }
      }

      // Remove duplicates
      return [...new Set(keys)];
    } catch (error) {
      this.stats.errors++;
      logger.error('Cache keys error:', error);
      return [];
    }
  }

  // Health check
  async health() {
    const redisHealth = this.isRedisAvailable && this.redis ? 'healthy' : 'unhealthy';
    const memoryHealth = 'healthy'; // Memory cache is always available

    return {
      status: redisHealth === 'healthy' ? 'healthy' : 'degraded',
      redis: redisHealth,
      memory: memoryHealth,
      stats: this.getStats()
    };
  }

  // Cleanup and disconnect
  async cleanup() {
    try {
      // Clear memory cache
      this.memory.clear();

      // Disconnect Redis if available
      if (this.redis) {
        await this.redis.disconnect();
        this.redis = null;
      }

      this.isRedisAvailable = false;
      logger.info('Cache manager cleaned up successfully');
    } catch (error) {
      logger.error('Cache cleanup error:', error);
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Graceful shutdown
process.on('SIGTERM', () => cacheManager.cleanup());
process.on('SIGINT', () => cacheManager.cleanup());

module.exports = cacheManager;
