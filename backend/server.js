const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Yeni modüller
const database = require('./config/database');
const logger = require('./utils/logger');
const ResponseFormatter = require('./utils/responseFormatter');
const { uploadsDir } = require('./middleware/upload');
const socketManager = require('./utils/socket');
const swaggerSpecs = require('./utils/swagger');
const {
  rateLimitMiddleware,
  apiRateLimitMiddleware,
  authRateLimitMiddleware,
  securityHeaders,
  compressionMiddleware,
  corsOptions,
  requestLogger,
  errorHandler
} = require('./middleware/security');
const { performanceMiddleware } = require('./utils/performance');

const app = express();
const PORT = process.env.PORT || 5000;

// Request ID middleware
app.use((req, res, next) => {
  res.locals.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  next();
});

// Security and performance middleware
app.use(securityHeaders);
app.use(compressionMiddleware);
app.use(cors(corsOptions));
app.use(rateLimitMiddleware);
app.use(performanceMiddleware);
app.use(logger.httpLogger);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Database initialization
async function initializeDatabase() {
  try {
    await database.connect();
    await database.initializeDatabase();
    logger.system.startup(PORT, process.env.NODE_ENV);
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ERP System API Documentation'
}));

// API Routes with rate limiting
app.use('/api/auth', authRateLimitMiddleware, require('./routes/auth'));
app.use('/api/users', apiRateLimitMiddleware, require('./routes/users'));
app.use('/api/products', apiRateLimitMiddleware, require('./routes/products'));
app.use('/api/orders', apiRateLimitMiddleware, require('./routes/orders'));
app.use('/api/employees', apiRateLimitMiddleware, require('./routes/employees'));
app.use('/api/attendance', apiRateLimitMiddleware, require('./routes/attendance'));
app.use('/api/payroll', apiRateLimitMiddleware, require('./routes/payroll'));
app.use('/api/leave', apiRateLimitMiddleware, require('./routes/leave'));
app.use('/api/performance', apiRateLimitMiddleware, require('./routes/performance'));
app.use('/api/backup', apiRateLimitMiddleware, require('./routes/backup'));
app.use('/api/metrics', apiRateLimitMiddleware, require('./routes/metrics'));
app.use('/api/inventory', apiRateLimitMiddleware, require('./routes/inventory'));
app.use('/api/stockcount', apiRateLimitMiddleware, require('./routes/stockcount'));
app.use('/api/customers', apiRateLimitMiddleware, require('./routes/customers'));
app.use('/api/invoices', apiRateLimitMiddleware, require('./routes/invoices'));
app.use('/api/projects', apiRateLimitMiddleware, require('./routes/projects'));
app.use('/api/tasks', apiRateLimitMiddleware, require('./routes/tasks'));
app.use('/api/assets', apiRateLimitMiddleware, require('./routes/assets'));
app.use('/api/ai-analytics', apiRateLimitMiddleware, require('./routes/aiAnalytics'));
app.use('/api/cache', apiRateLimitMiddleware, require('./routes/cache'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    const memoryUsage = process.memoryUsage();
    
    const health = {
      status: dbHealth.status === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: dbHealth,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
      }
    };
    
    return ResponseFormatter.health(res, health.status, health);
  } catch (error) {
    return ResponseFormatter.health(res, 'unhealthy', { error: error.message });
  }
});

// 404 handler
app.use('*', (req, res) => {
  return ResponseFormatter.notFound(res, 'Endpoint', `Endpoint ${req.originalUrl} not found`);
});

// Error handling middleware
app.use(ResponseFormatter.errorHandler);

// Test route
app.get('/', (req, res) => {
  return ResponseFormatter.success(res, {
    name: 'ERP Management System API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api-docs',
    health: '/health'
  }, 'ERP API çalışıyor!');
});

// Memory monitoring
setInterval(() => {
  logger.system.memoryUsage();
}, 300000); // Her 5 dakikada bir

async function start() {
  try {
    await initializeDatabase();
    logger.info('Database initialized successfully');
  } catch (err) {
    logger.error('Database initialization failed, starting server anyway', { error: err.message });
    console.error('Database initialization failed:', err.message);
  }

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.IO
  socketManager.initialize(server);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.system.shutdown('SIGTERM received');
    await database.disconnect();
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    logger.system.shutdown('SIGINT received');
    await database.disconnect();
    server.close(() => {
      process.exit(0);
    });
  });

  server.listen(PORT, () => {
    logger.system.startup(PORT, process.env.NODE_ENV);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  });
}

start();