const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
let MongoMemoryServer; // Lazy-required if needed
const path = require('path');
const http = require('http');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();


const { logger, logRequest, logError } = require('./utils/logger');
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

// Security and performance middleware
app.use(securityHeaders);
app.use(compressionMiddleware);
app.use(cors(corsOptions));
app.use(rateLimitMiddleware);
app.use(performanceMiddleware);
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// MongoDB connection with in-memory fallback for local dev
async function connectDatabase() {
  const explicitUri = process.env.MONGODB_URI;
  const allowInMemory = (process.env.USE_IN_MEMORY_DB || 'true').toLowerCase() !== 'false';

  if (explicitUri) {
    try {
      await mongoose.connect(explicitUri, { useNewUrlParser: true, useUnifiedTopology: true });
      logger.info('MongoDB bağlantısı başarılı (env URI)');
      console.log('MongoDB bağlantısı başarılı (env URI)');
      return;
    } catch (err) {
      logger.error('MongoDB bağlantı hatası (env URI)', { error: err.message });
      console.error('MongoDB bağlantı hatası (env URI):', err);
      if (!allowInMemory) throw err;
    }
  }

  // Try local default if no env URI provided
  try {
    await mongoose.connect('mongodb://localhost:27017/erp_db', { useNewUrlParser: true, useUnifiedTopology: true });
    logger.info('MongoDB bağlantısı başarılı (localhost)');
    console.log('MongoDB bağlantısı başarılı (localhost)');
    return;
  } catch (err) {
    logger.warn('Yerel MongoDB yok veya bağlanılamadı, in-memory denenecek', { error: err.message });
    console.warn('Yerel MongoDB yok veya bağlanılamadı, in-memory denenecek');
  }

  if (!allowInMemory) {
    throw new Error('MongoDB bağlantısı kurulamadı ve in-memory devre dışı');
  }

  // Start in-memory MongoDB for development
  try {
    ({ MongoMemoryServer } = require('mongodb-memory-server'));
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    logger.info('In-memory MongoDB başlatıldı', { uri });
    console.log('In-memory MongoDB başlatıldı');
  } catch (err) {
    logger.error('In-memory MongoDB başlatılamadı', { error: err.message });
    console.error('In-memory MongoDB başlatılamadı:', err);
    throw err;
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
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use(errorHandler);
app.use(logError);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'ERP API çalışıyor!' });
});

async function start() {
  try {
    await connectDatabase();
  } catch (err) {
    // If DB cannot be connected, we still start the server to serve health/static, but most APIs will fail
    logger.error('Veritabanı bağlantısı olmadan başlatılıyor', { error: err.message });
    console.error('Veritabanı bağlantısı olmadan başlatılıyor');
  }

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.IO
  socketManager.initialize(server);

  server.listen(PORT, () => {
    logger.info(`Sunucu başlatıldı`, { port: PORT });
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
  });
}

start();