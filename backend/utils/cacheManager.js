const crypto = require('crypto');

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.diskCache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
    this.maxMemorySize = 100 * 1024 * 1024; // 100MB
    this.currentMemorySize = 0;
  }

  // Set cache with TTL
  set(key, value, ttl = 3600000, options = {}) {
    const cacheKey = this.generateKey(key);
    const cacheItem = {
      value,
      timestamp: Date.now(),
      ttl,
      size: this.calculateSize(value),
      accessCount: 0,
      lastAccessed: Date.now(),
      tags: options.tags || [],
      priority: options.priority || 'normal'
    };

    // Memory cache
    if (options.persistent !== false) {
      this.setMemoryCache(cacheKey, cacheItem);
    }

    // Disk cache for large items
    if (cacheItem.size > 1024 * 1024) { // > 1MB
      this.setDiskCache(cacheKey, cacheItem);
    }

    this.stats.sets++;
    return true;
  }

  // Get cache item
  get(key, options = {}) {
    const cacheKey = this.generateKey(key);
    
    // Try memory cache first
    let item = this.getMemoryCache(cacheKey);
    
    if (!item && options.fallbackToDisk !== false) {
      item = this.getDiskCache(cacheKey);
      if (item) {
        // Move to memory cache
        this.setMemoryCache(cacheKey, item);
      }
    }

    if (item && !this.isExpired(item)) {
      this.updateAccessStats(item);
      this.stats.hits++;
      return item.value;
    }

    this.stats.misses++;
    return null;
  }

  // Delete cache item
  delete(key) {
    const cacheKey = this.generateKey(key);
    const memoryDeleted = this.deleteMemoryCache(cacheKey);
    const diskDeleted = this.deleteDiskCache(cacheKey);
    
    if (memoryDeleted || diskDeleted) {
      this.stats.deletes++;
      return true;
    }
    
    return false;
  }

  // Clear cache by tags
  clearByTags(tags) {
    let clearedCount = 0;
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (tags.some(tag => item.tags.includes(tag))) {
        this.deleteMemoryCache(key);
        clearedCount++;
      }
    }
    
    for (const [key, item] of this.diskCache.entries()) {
      if (tags.some(tag => item.tags.includes(tag))) {
        this.deleteDiskCache(key);
        clearedCount++;
      }
    }
    
    return clearedCount;
  }

  // Get cache statistics
  getStats() {
    return {
      ...this.stats,
      memorySize: this.currentMemorySize,
      memoryItems: this.memoryCache.size,
      diskItems: this.diskCache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      memoryUsage: (this.currentMemorySize / this.maxMemorySize) * 100
    };
  }

  // Warm up cache
  async warmup(keys, fetcher) {
    const results = [];
    
    for (const key of keys) {
      try {
        const value = await fetcher(key);
        this.set(key, value, 1800000, { tags: ['warmup'] }); // 30 min TTL
        results.push({ key, success: true });
      } catch (error) {
        results.push({ key, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Cache invalidation patterns
  invalidatePattern(pattern) {
    let invalidatedCount = 0;
    
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.deleteMemoryCache(key);
        invalidatedCount++;
      }
    }
    
    for (const key of this.diskCache.keys()) {
      if (key.includes(pattern)) {
        this.deleteDiskCache(key);
        invalidatedCount++;
      }
    }
    
    return invalidatedCount;
  }

  // Memory cache management
  setMemoryCache(key, item) {
    // Check if we need to evict items
    while (this.currentMemorySize + item.size > this.maxMemorySize) {
      this.evictLRU();
    }
    
    this.memoryCache.set(key, item);
    this.currentMemorySize += item.size;
  }

  getMemoryCache(key) {
    const item = this.memoryCache.get(key);
    if (item) {
      item.lastAccessed = Date.now();
      item.accessCount++;
    }
    return item;
  }

  deleteMemoryCache(key) {
    const item = this.memoryCache.get(key);
    if (item) {
      this.currentMemorySize -= item.size;
      this.memoryCache.delete(key);
      return true;
    }
    return false;
  }

  // Disk cache management (simplified)
  setDiskCache(key, item) {
    this.diskCache.set(key, item);
  }

  getDiskCache(key) {
    return this.diskCache.get(key);
  }

  deleteDiskCache(key) {
    return this.diskCache.delete(key);
  }

  // LRU eviction
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.deleteMemoryCache(oldestKey);
      this.stats.evictions++;
    }
  }

  // Utility methods
  generateKey(key) {
    return crypto.createHash('md5').update(String(key)).digest('hex');
  }

  calculateSize(value) {
    return Buffer.byteLength(JSON.stringify(value), 'utf8');
  }

  isExpired(item) {
    return Date.now() - item.timestamp > item.ttl;
  }

  updateAccessStats(item) {
    item.lastAccessed = Date.now();
    item.accessCount++;
  }

  // Cache compression
  compressValue(value) {
    try {
      const jsonString = JSON.stringify(value);
      const compressed = Buffer.from(jsonString).toString('base64');
      
      return {
        compressed,
        originalSize: jsonString.length,
        compressedSize: compressed.length,
        compressionRatio: (1 - compressed.length / jsonString.length) * 100
      };
    } catch (error) {
      return { compressed: value, originalSize: 0, compressedSize: 0, compressionRatio: 0 };
    }
  }

  // Cache analytics
  getAnalytics() {
    const analytics = {
      totalItems: this.memoryCache.size + this.diskCache.size,
      memoryUsage: (this.currentMemorySize / this.maxMemorySize) * 100,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      averageItemSize: this.currentMemorySize / this.memoryCache.size || 0,
      topAccessedKeys: this.getTopAccessedKeys(),
      cacheDistribution: {
        memory: this.memoryCache.size,
        disk: this.diskCache.size
      }
    };
    
    return analytics;
  }

  getTopAccessedKeys(limit = 10) {
    const items = Array.from(this.memoryCache.entries())
      .map(([key, item]) => ({ key, accessCount: item.accessCount, lastAccessed: item.lastAccessed }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
    
    return items;
  }

  // Cache health check
  healthCheck() {
    const issues = [];
    
    if (this.currentMemorySize > this.maxMemorySize * 0.9) {
      issues.push('Memory cache nearly full');
    }
    
    if (this.stats.evictions > 100) {
      issues.push('High eviction rate detected');
    }
    
    if (this.stats.hitRate < 0.5) {
      issues.push('Low cache hit rate');
    }
    
    return {
      healthy: issues.length === 0,
      issues,
      recommendations: this.getRecommendations(issues)
    };
  }

  getRecommendations(issues) {
    const recommendations = [];
    
    if (issues.includes('Memory cache nearly full')) {
      recommendations.push('Increase maxMemorySize or implement more aggressive eviction');
    }
    
    if (issues.includes('High eviction rate detected')) {
      recommendations.push('Review cache TTL settings and memory allocation');
    }
    
    if (issues.includes('Low cache hit rate')) {
      recommendations.push('Review cache key patterns and TTL strategies');
    }
    
    return recommendations;
  }
}

module.exports = CacheManager;
