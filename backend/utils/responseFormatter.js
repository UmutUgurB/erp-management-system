const logger = require('./logger');

class ResponseFormatter {
  // Başarılı yanıt formatı
  static success(res, data = null, message = 'Success', statusCode = 200, meta = {}) {
    const response = {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId || null,
        ...meta
      }
    };

    // Pagination bilgisi varsa ekle
    if (meta.pagination) {
      response.pagination = meta.pagination;
    }

    logger.info('API Success Response', {
      statusCode,
      message,
      dataType: data ? typeof data : 'null',
      hasData: !!data
    });

    return res.status(statusCode).json(response);
  }

  // Hata yanıt formatı
  static error(res, message = 'An error occurred', statusCode = 500, errors = null, meta = {}) {
    const response = {
      success: false,
      message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId || null,
        ...meta
      }
    };

    logger.error('API Error Response', {
      statusCode,
      message,
      errors,
      meta
    });

    return res.status(statusCode).json(response);
  }

  // Validation error formatı
  static validationError(res, errors, message = 'Validation failed') {
    const formattedErrors = Array.isArray(errors) 
      ? errors.map(err => ({
          field: err.path || err.field,
          message: err.message || err.msg,
          value: err.value
        }))
      : [{ message: errors }];

    return this.error(res, message, 422, formattedErrors, {
      type: 'validation_error'
    });
  }

  // Not found error formatı
  static notFound(res, resource = 'Resource', message = null) {
    const defaultMessage = `${resource} not found`;
    return this.error(res, message || defaultMessage, 404, null, {
      type: 'not_found',
      resource
    });
  }

  // Unauthorized error formatı
  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401, null, {
      type: 'unauthorized'
    });
  }

  // Forbidden error formatı
  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, 403, null, {
      type: 'forbidden'
    });
  }

  // Conflict error formatı
  static conflict(res, message = 'Resource conflict', field = null) {
    return this.error(res, message, 409, null, {
      type: 'conflict',
      field
    });
  }

  // Too many requests error formatı
  static tooManyRequests(res, message = 'Too many requests', retryAfter = null) {
    if (retryAfter) {
      res.set('Retry-After', retryAfter);
    }
    
    return this.error(res, message, 429, null, {
      type: 'rate_limit',
      retryAfter
    });
  }

  // Server error formatı
  static serverError(res, message = 'Internal server error', error = null) {
    // Production'da hata detaylarını gizle
    const errorDetails = process.env.NODE_ENV === 'production' 
      ? null 
      : {
          stack: error?.stack,
          details: error?.message
        };

    return this.error(res, message, 500, errorDetails, {
      type: 'server_error'
    });
  }

  // Pagination ile birlikte liste yanıtı
  static list(res, data, pagination, message = 'Data retrieved successfully') {
    return this.success(res, data, message, 200, {
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        totalPages: pagination.totalPages || 0,
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false
      }
    });
  }

  // Create yanıtı
  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201, {
      type: 'created'
    });
  }

  // Update yanıtı
  static updated(res, data, message = 'Resource updated successfully') {
    return this.success(res, data, message, 200, {
      type: 'updated'
    });
  }

  // Delete yanıtı
  static deleted(res, message = 'Resource deleted successfully') {
    return this.success(res, null, message, 200, {
      type: 'deleted'
    });
  }

  // No content yanıtı
  static noContent(res) {
    return res.status(204).send();
  }

  // Health check yanıtı
  static health(res, status, details = {}) {
    const statusCode = status === 'healthy' ? 200 : 503;
    
    return res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      details
    });
  }

  // File upload yanıtı
  static fileUploaded(res, fileInfo, message = 'File uploaded successfully') {
    return this.success(res, {
      filename: fileInfo.filename,
      originalName: fileInfo.originalname,
      size: fileInfo.size,
      mimetype: fileInfo.mimetype,
      url: fileInfo.url || `/uploads/${fileInfo.filename}`
    }, message, 201, {
      type: 'file_upload'
    });
  }

  // Bulk operation yanıtı
  static bulkOperation(res, results, message = 'Bulk operation completed') {
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

    return this.success(res, {
      summary,
      results: process.env.NODE_ENV === 'development' ? results : undefined
    }, message, 200, {
      type: 'bulk_operation'
    });
  }

  // Export yanıtı
  static exportData(res, data, format, filename) {
    const contentTypes = {
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
      json: 'application/json'
    };

    res.setHeader('Content-Type', contentTypes[format] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    return res.send(data);
  }

  // Cache yanıtı
  static cached(res, data, cacheInfo, message = 'Data retrieved from cache') {
    return this.success(res, data, message, 200, {
      cache: {
        hit: true,
        ttl: cacheInfo.ttl,
        key: cacheInfo.key,
        cachedAt: cacheInfo.cachedAt
      }
    });
  }

  // Async operation yanıtı
  static asyncOperation(res, operationId, message = 'Operation started') {
    return this.success(res, {
      operationId,
      status: 'pending',
      checkUrl: `/api/operations/${operationId}/status`
    }, message, 202, {
      type: 'async_operation'
    });
  }
}

// Error handler middleware
ResponseFormatter.errorHandler = (error, req, res, next) => {
  logger.logError(error, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return ResponseFormatter.validationError(res, errors);
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return ResponseFormatter.conflict(res, `${field} already exists`, field);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return ResponseFormatter.unauthorized(res, 'Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return ResponseFormatter.unauthorized(res, 'Token expired');
  }

  // Cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return ResponseFormatter.error(res, 'Invalid ID format', 400);
  }

  // Default server error
  return ResponseFormatter.serverError(res, undefined, error);
};

module.exports = ResponseFormatter;
