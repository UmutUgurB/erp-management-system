const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const CacheManager = require('../utils/cacheManager');
const { rateLimiter } = require('../middleware/rateLimiter');

// Initialize cache manager
const cacheManager = new CacheManager();

// Apply authentication and rate limiting
router.use(authenticateToken);
router.use(rateLimiter.middleware({ maxRequests: 50, windowMs: 60000 }));

// Get cache statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = cacheManager.getStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cache statistics',
      details: error.message
    });
  }
});

// Get cache analytics
router.get('/analytics', async (req, res) => {
  try {
    const analytics = cacheManager.getAnalytics();
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache Analytics Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cache analytics',
      details: error.message
    });
  }
});

// Get cache health status
router.get('/health', async (req, res) => {
  try {
    const health = cacheManager.healthCheck();
    
    res.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache Health Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cache health',
      details: error.message
    });
  }
});

// Set cache item
router.post('/set', async (req, res) => {
  try {
    const { key, value, ttl, options } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Key and value are required'
      });
    }
    
    const success = cacheManager.set(key, value, ttl, options);
    
    res.json({
      success: true,
      data: { key, success },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache Set Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set cache item',
      details: error.message
    });
  }
});

// Get cache item
router.get('/get/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { fallbackToDisk } = req.query;
    
    const value = cacheManager.get(key, { fallbackToDisk: fallbackToDisk !== 'false' });
    
    if (value === null) {
      return res.status(404).json({
        success: false,
        error: 'Cache item not found'
      });
    }
    
    res.json({
      success: true,
      data: { key, value },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache Get Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache item',
      details: error.message
    });
  }
});

// Delete cache item
router.delete('/delete/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const success = cacheManager.delete(key);
    
    res.json({
      success: true,
      data: { key, deleted: success },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache Delete Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete cache item',
      details: error.message
    });
  }
});

// Clear cache by tags
router.post('/clear-tags', async (req, res) => {
  try {
    const { tags } = req.body;
    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: 'Tags array is required'
      });
    }
    
    const clearedCount = cacheManager.clearByTags(tags);
    
    res.json({
      success: true,
      data: { tags, clearedCount },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache Clear Tags Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache by tags',
      details: error.message
    });
  }
});

// Invalidate cache by pattern
router.post('/invalidate-pattern', async (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (!pattern) {
      return res.status(400).json({
        success: false,
        error: 'Pattern is required'
      });
    }
    
    const invalidatedCount = cacheManager.invalidatePattern(pattern);
    
    res.json({
      success: true,
      data: { pattern, invalidatedCount },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache Invalidate Pattern Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to invalidate cache by pattern',
      details: error.message
    });
  }
});

// Warm up cache
router.post('/warmup', async (req, res) => {
  try {
    const { keys, fetcher } = req.body;
    
    if (!keys || !Array.isArray(keys)) {
      return res.status(400).json({
        success: false,
        error: 'Keys array is required'
      });
    }
    
    // For demo purposes, we'll use a mock fetcher
    const mockFetcher = async (key) => {
      return { key, data: `Mock data for ${key}`, timestamp: Date.now() };
    };
    
    const results = await cacheManager.warmup(keys, fetcher || mockFetcher);
    
    res.json({
      success: true,
      data: { results },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache Warmup Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to warm up cache',
      details: error.message
    });
  }
});

// Compress cache value
router.post('/compress', async (req, res) => {
  try {
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Value is required'
      });
    }
    
    const compressed = cacheManager.compressValue(value);
    
    res.json({
      success: true,
      data: compressed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache Compress Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compress value',
      details: error.message
    });
  }
});

// Get rate limiter statistics
router.get('/rate-limiter/stats', async (req, res) => {
  try {
    const stats = rateLimiter.getStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Rate Limiter Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rate limiter statistics',
      details: error.message
    });
  }
});

// Add IP to whitelist
router.post('/rate-limiter/whitelist', async (req, res) => {
  try {
    const { ip } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        error: 'IP address is required'
      });
    }
    
    rateLimiter.addToWhitelist(ip);
    
    res.json({
      success: true,
      data: { ip, whitelisted: true },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Rate Limiter Whitelist Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add IP to whitelist',
      details: error.message
    });
  }
});

// Add IP to blacklist
router.post('/rate-limiter/blacklist', async (req, res) => {
  try {
    const { ip, duration } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        error: 'IP address is required'
      });
    }
    
    rateLimiter.addToBlacklist(ip, duration);
    
    res.json({
      success: true,
      data: { ip, blacklisted: true, duration },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Rate Limiter Blacklist Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add IP to blacklist',
      details: error.message
    });
  }
});

// Clean up expired cache items
router.post('/cleanup', async (req, res) => {
  try {
    const cleaned = cacheManager.cleanup();
    const rateLimiterCleaned = rateLimiter.cleanup();
    
    res.json({
      success: true,
      data: { 
        cacheCleaned: cleaned, 
        rateLimiterCleaned: rateLimiterCleaned,
        totalCleaned: cleaned + rateLimiterCleaned
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache Cleanup Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup cache',
      details: error.message
    });
  }
});

// Reset all cache and rate limiter
router.post('/reset', async (req, res) => {
  try {
    cacheManager.reset();
    rateLimiter.reset();
    
    res.json({
      success: true,
      data: { message: 'Cache and rate limiter reset successfully' },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache Reset Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset cache',
      details: error.message
    });
  }
});

module.exports = router;
