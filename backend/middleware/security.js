const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const logger = require('../utils/logger');

// Security configuration
const securityConfig = {
  // CORS configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : 
      ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-API-Key'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400 // 24 hours
  },

  // Helmet configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", "ws:", "wss:"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  },

  // HPP configuration
  hpp: {
    whitelist: ['filter', 'sort', 'page', 'limit', 'fields']
  }
};

// Threat detection patterns
const threatPatterns = {
  sqlInjection: [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/i,
    /(\b(or|and)\s+\d+\s*=\s*\d+)/i,
    /(\b(union|select).*from)/i,
    /(\b(union|select).*where)/i
  ],
  xss: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi
  ],
  pathTraversal: [
    /\.\.\//g,
    /\.\.\\/g,
    /\/etc\/passwd/i,
    /\/proc\/self\/environ/i,
    /\/var\/log/i
  ],
  commandInjection: [
    /(\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ipconfig)\b)/i,
    /(\b(rm|del|copy|move|mkdir|rmdir)\b)/i,
    /(\b(echo|printf|sprintf)\b)/i
  ]
};

// Security middleware class
class SecurityMiddleware {
  constructor() {
    this.threatLog = new Map();
    this.blockedIPs = new Set();
    this.suspiciousIPs = new Map();
  }

  // Main security middleware
  middleware() {
    return [
      this.corsMiddleware(),
      this.helmetMiddleware(),
      this.hppMiddleware(),
      this.mongoSanitizeMiddleware(),
      this.xssMiddleware(),
      this.threatDetectionMiddleware(),
      this.securityHeadersMiddleware(),
      this.requestValidationMiddleware()
    ];
  }

  // CORS middleware
  corsMiddleware() {
    return cors(securityConfig.cors);
  }

  // Helmet middleware
  helmetMiddleware() {
    return helmet(securityConfig.helmet);
  }

  // HPP middleware
  hppMiddleware() {
    return hpp(securityConfig.hpp);
  }

  // MongoDB sanitization middleware
  mongoSanitizeMiddleware() {
    return mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        logger.warn('MongoDB injection attempt detected', {
          ip: req.ip,
          path: req.path,
          key: key,
          userAgent: req.get('User-Agent')
        });
      }
    });
  }

  // XSS protection middleware
  xssMiddleware() {
    return xss({
      whiteList: {
        // Allow specific HTML tags for rich content
        a: ['href', 'title', 'target'],
        b: [],
        i: [],
        em: [],
        strong: [],
        code: [],
        pre: [],
        br: [],
        hr: []
      }
    });
  }

  // Threat detection middleware
  threatDetectionMiddleware() {
    return (req, res, next) => {
      const ip = req.ip;
      const userAgent = req.get('User-Agent') || '';
      const path = req.path;
      const method = req.method;
      const body = req.body;
      const query = req.query;
      const headers = req.headers;

      // Check if IP is blocked
      if (this.blockedIPs.has(ip)) {
        logger.warn('Blocked IP attempted access', { ip, path, method });
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'Your IP address has been blocked due to suspicious activity'
        });
      }

      let threatScore = 0;
      const threats = [];

      // Check request body
      if (body) {
        const bodyStr = JSON.stringify(body);
        threats.push(...this.detectThreats(bodyStr, 'body'));
      }

      // Check query parameters
      if (query) {
        const queryStr = JSON.stringify(query);
        threats.push(...this.detectThreats(queryStr, 'query'));
      }

      // Check headers
      if (headers) {
        const headersStr = JSON.stringify(headers);
        threats.push(...this.detectThreats(headersStr, 'headers'));
      }

      // Check path
      threats.push(...this.detectThreats(path, 'path'));

      // Check user agent
      threats.push(...this.detectThreats(userAgent, 'userAgent'));

      // Calculate threat score
      threatScore = threats.length * 10;

      // Log threats if detected
      if (threats.length > 0) {
        logger.warn('Security threats detected', {
          ip,
          path,
          method,
          threats,
          threatScore,
          userAgent
        });

        // Track suspicious IP
        this.trackSuspiciousIP(ip, threats, threatScore);

        // Block IP if threat score is too high
        if (threatScore > 50) {
          this.blockedIPs.add(ip);
          logger.error('IP blocked due to high threat score', {
            ip,
            threatScore,
            threats
          });
        }
      }

      // Add security headers
      res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
      });

      next();
    };
  }

  // Security headers middleware
  securityHeadersMiddleware() {
    return (req, res, next) => {
      // Additional security headers
      res.set({
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      });

      next();
    };
  }

  // Request validation middleware
  requestValidationMiddleware() {
    return (req, res, next) => {
      const ip = req.ip;
      const path = req.path;

      // Validate request size
      const contentLength = parseInt(req.get('Content-Length') || '0');
      if (contentLength > 10 * 1024 * 1024) { // 10MB limit
        logger.warn('Large request blocked', { ip, path, size: contentLength });
        return res.status(413).json({
          success: false,
          error: 'Request too large',
          message: 'Request size exceeds the allowed limit'
        });
      }

      // Validate request method
      const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
      if (!allowedMethods.includes(req.method)) {
        logger.warn('Invalid HTTP method', { ip, path, method: req.method });
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: 'The HTTP method is not supported'
        });
      }

      // Validate content type for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
          logger.warn('Invalid content type', { ip, path, contentType });
          return res.status(400).json({
            success: false,
            error: 'Invalid content type',
            message: 'Content-Type must be application/json'
          });
        }
      }

      next();
    };
  }

  // Detect threats in input
  detectThreats(input, source) {
    const threats = [];
    const inputStr = String(input).toLowerCase();

    // Check for SQL injection
    for (const pattern of threatPatterns.sqlInjection) {
      if (pattern.test(inputStr)) {
        threats.push({
          type: 'sql_injection',
          source,
          pattern: pattern.source,
          severity: 'high'
        });
      }
    }

    // Check for XSS
    for (const pattern of threatPatterns.xss) {
      if (pattern.test(inputStr)) {
        threats.push({
          type: 'xss',
          source,
          pattern: pattern.source,
          severity: 'high'
        });
      }
    }

    // Check for path traversal
    for (const pattern of threatPatterns.pathTraversal) {
      if (pattern.test(inputStr)) {
        threats.push({
          type: 'path_traversal',
          source,
          pattern: pattern.source,
          severity: 'medium'
        });
      }
    }

    // Check for command injection
    for (const pattern of threatPatterns.commandInjection) {
      if (pattern.test(inputStr)) {
        threats.push({
          type: 'command_injection',
          source,
          pattern: pattern.source,
          severity: 'critical'
        });
      }
    }

    return threats;
  }

  // Track suspicious IP addresses
  trackSuspiciousIP(ip, threats, threatScore) {
    if (!this.suspiciousIPs.has(ip)) {
      this.suspiciousIPs.set(ip, {
        firstSeen: new Date(),
        threatCount: 0,
        lastSeen: new Date(),
        threats: [],
        maxThreatScore: 0
      });
    }

    const record = this.suspiciousIPs.get(ip);
    record.threatCount++;
    record.lastSeen = new Date();
    record.threats.push(...threats);
    record.maxThreatScore = Math.max(record.maxThreatScore, threatScore);

    // Auto-block after multiple threats
    if (record.threatCount > 5 || record.maxThreatScore > 80) {
      this.blockedIPs.add(ip);
      logger.error('IP auto-blocked due to repeated threats', {
        ip,
        threatCount: record.threatCount,
        maxThreatScore: record.maxThreatScore
      });
    }
  }

  // Get security statistics
  getSecurityStats() {
    return {
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      threatLog: this.threatLog.size,
      blockedIPsList: Array.from(this.blockedIPs),
      suspiciousIPsList: Array.from(this.suspiciousIPs.entries()).map(([ip, data]) => ({
        ip,
        threatCount: data.threatCount,
        maxThreatScore: data.maxThreatScore,
        firstSeen: data.firstSeen,
        lastSeen: data.lastSeen
      }))
    };
  }

  // Unblock IP address
  unblockIP(ip) {
    if (this.blockedIPs.has(ip)) {
      this.blockedIPs.delete(ip);
      logger.info('IP unblocked', { ip });
      return true;
    }
    return false;
  }

  // Clear suspicious IP record
  clearSuspiciousIP(ip) {
    if (this.suspiciousIPs.has(ip)) {
      this.suspiciousIPs.delete(ip);
      logger.info('Suspicious IP record cleared', { ip });
      return true;
    }
    return false;
  }

  // Cleanup old records
  cleanup() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Clean up old suspicious IP records
    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (data.lastSeen < oneHourAgo && data.threatCount < 3) {
        this.suspiciousIPs.delete(ip);
      }
    }

    // Clean up old threat log entries
    for (const [key, timestamp] of this.threatLog.entries()) {
      if (timestamp < oneHourAgo) {
        this.threatLog.delete(key);
      }
    }

    logger.info('Security middleware cleanup completed');
  }
}

// Create singleton instance
const securityMiddleware = new SecurityMiddleware();

// Export middleware functions
module.exports = {
  // Main security middleware
  security: securityMiddleware.middleware(),
  
  // Individual middleware functions
  cors: securityMiddleware.corsMiddleware(),
  helmet: securityMiddleware.helmetMiddleware(),
  hpp: securityMiddleware.hppMiddleware(),
  mongoSanitize: securityMiddleware.mongoSanitizeMiddleware(),
  xss: securityMiddleware.xssMiddleware(),
  threatDetection: securityMiddleware.threatDetectionMiddleware(),
  securityHeaders: securityMiddleware.securityHeadersMiddleware(),
  requestValidation: securityMiddleware.requestValidationMiddleware(),
  
  // Utility functions
  getSecurityStats: () => securityMiddleware.getSecurityStats(),
  unblockIP: (ip) => securityMiddleware.unblockIP(ip),
  clearSuspiciousIP: (ip) => securityMiddleware.clearSuspiciousIP(ip),
  cleanup: () => securityMiddleware.cleanup(),
  
  // Configuration
  config: securityConfig
}; 