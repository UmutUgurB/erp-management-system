const { logger } = require('./logger');

/**
 * Standard API Response Handler
 * Provides consistent response format across all endpoints
 */
class ResponseHandler {
  /**
   * Success Response
   */
  static success(res, data = null, message = 'İşlem başarılı', statusCode = 200, meta = {}) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
      method: res.req.method,
      ...meta
    };

    // Add pagination info if present
    if (meta.pagination) {
      response.pagination = meta.pagination;
    }

    // Add cache info if present
    if (meta.cache) {
      response.cache = meta.cache;
    }

    logger.info(`API Success: ${res.req.method} ${res.req.originalUrl}`, {
      statusCode,
      responseTime: Date.now() - res.req.startTime,
      userAgent: res.req.get('User-Agent'),
      ip: res.req.ip
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Error Response
   */
  static error(res, error, statusCode = 500, context = {}) {
    const errorResponse = {
      success: false,
      message: error.message || 'Bir hata oluştu',
      error: {
        code: error.code || 'INTERNAL_ERROR',
        type: error.type || 'ServerError',
        details: error.details || null,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
      method: res.req.method,
      requestId: res.req.id,
      ...context
    };

    // Log error with context
    logger.error(`API Error: ${res.req.method} ${res.req.originalUrl}`, {
      statusCode,
      error: error.message,
      stack: error.stack,
      context,
      userAgent: res.req.get('User-Agent'),
      ip: res.req.ip,
      userId: res.req.user?.id
    });

    return res.status(statusCode).json(errorResponse);
  }

  /**
   * Validation Error Response
   */
  static validationError(res, errors, message = 'Validasyon hatası') {
    const validationResponse = {
      success: false,
      message,
      error: {
        code: 'VALIDATION_ERROR',
        type: 'ValidationError',
        details: errors
      },
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
      method: res.req.method,
      requestId: res.req.id
    };

    logger.warn(`Validation Error: ${res.req.method} ${res.req.originalUrl}`, {
      errors,
      userAgent: res.req.get('User-Agent'),
      ip: res.req.ip
    });

    return res.status(400).json(validationResponse);
  }

  /**
   * Not Found Response
   */
  static notFound(res, resource = 'Kaynak', message = null) {
    const notFoundResponse = {
      success: false,
      message: message || `${resource} bulunamadı`,
      error: {
        code: 'NOT_FOUND',
        type: 'NotFoundError',
        details: null
      },
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
      method: res.req.method,
      requestId: res.req.id
    };

    logger.warn(`Not Found: ${res.req.method} ${res.req.originalUrl}`, {
      resource,
      userAgent: res.req.get('User-Agent'),
      ip: res.req.ip
    });

    return res.status(404).json(notFoundResponse);
  }

  /**
   * Unauthorized Response
   */
  static unauthorized(res, message = 'Yetkisiz erişim') {
    const unauthorizedResponse = {
      success: false,
      message,
      error: {
        code: 'UNAUTHORIZED',
        type: 'UnauthorizedError',
        details: null
      },
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
      method: res.req.method,
      requestId: res.req.id
    };

    logger.warn(`Unauthorized: ${res.req.method} ${res.req.originalUrl}`, {
      userAgent: res.req.get('User-Agent'),
      ip: res.req.ip
    });

    return res.status(401).json(unauthorizedResponse);
  }

  /**
   * Forbidden Response
   */
  static forbidden(res, message = 'Bu işlem için yetkiniz yok') {
    const forbiddenResponse = {
      success: false,
      message,
      error: {
        code: 'FORBIDDEN',
        type: 'ForbiddenError',
        details: null
      },
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
      method: res.req.method,
      requestId: res.req.id
    };

    logger.warn(`Forbidden: ${res.req.method} ${res.req.originalUrl}`, {
      userAgent: res.req.get('User-Agent'),
      ip: res.req.ip,
      userId: res.req.user?.id
    });

    return res.status(403).json(forbiddenResponse);
  }

  /**
   * Rate Limit Response
   */
  static rateLimit(res, message = 'Çok fazla istek gönderildi', retryAfter = 60) {
    const rateLimitResponse = {
      success: false,
      message,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        type: 'RateLimitError',
        details: {
          retryAfter,
          limit: res.get('X-RateLimit-Limit'),
          remaining: res.get('X-RateLimit-Remaining'),
          reset: res.get('X-RateLimit-Reset')
        }
      },
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
      method: res.req.method,
      requestId: res.req.id
    };

    logger.warn(`Rate Limit: ${res.req.method} ${res.req.originalUrl}`, {
      userAgent: res.req.get('User-Agent'),
      ip: res.req.ip,
      retryAfter
    });

    res.set('Retry-After', retryAfter);
    return res.status(429).json(rateLimitResponse);
  }

  /**
   * Paginated Response
   */
  static paginated(res, data, page, limit, total, filters = {}, sort = {}) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
      startIndex: (page - 1) * limit + 1,
      endIndex: Math.min(page * limit, total)
    };

    const meta = {
      pagination,
      filters,
      sort,
      responseTime: Date.now() - res.req.startTime
    };

    return this.success(res, data, 'Veriler başarıyla getirildi', 200, meta);
  }

  /**
   * Cached Response
   */
  static cached(res, data, message = 'Veriler cache\'den getirildi', cacheInfo = {}) {
    const meta = {
      cache: {
        ...cacheInfo,
        cached: true,
        timestamp: new Date().toISOString()
      },
      responseTime: Date.now() - res.req.startTime
    };

    return this.success(res, data, message, 200, meta);
  }

  /**
   * Stream Response
   */
  static stream(res, stream, filename = 'download', contentType = 'application/octet-stream') {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');

    stream.pipe(res);

    stream.on('error', (error) => {
      logger.error('Stream Error:', error);
      res.status(500).end();
    });

    stream.on('end', () => {
      logger.info(`Stream completed: ${filename}`);
    });
  }

  /**
   * Health Check Response
   */
  static health(res, services = {}) {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV
    };

    return res.status(200).json(healthData);
  }
}

/**
 * Custom Error Classes
 */
class AppError extends Error {
  constructor(message, statusCode, code, type, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.type = type;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validasyon hatası', details = null) {
    super(message, 400, 'VALIDATION_ERROR', 'ValidationError', details);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Kaynak bulunamadı') {
    super(message, 404, 'NOT_FOUND', 'NotFoundError');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Yetkisiz erişim') {
    super(message, 401, 'UNAUTHORIZED', 'UnauthorizedError');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Bu işlem için yetkiniz yok') {
    super(message, 403, 'FORBIDDEN', 'ForbiddenError');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Çakışma oluştu') {
    super(message, 409, 'CONFLICT', 'ConflictError');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Çok fazla istek gönderildi', retryAfter = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', 'RateLimitError', { retryAfter });
  }
}

module.exports = {
  ResponseHandler,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError
};
