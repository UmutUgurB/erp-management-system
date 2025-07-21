const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Import utilities
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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('MongoDB bağlantısı başarılı');
  console.log('MongoDB bağlantısı başarılı');
})
.catch(err => {
  logger.error('MongoDB bağlantı hatası', { error: err.message });
  console.error('MongoDB bağlantı hatası:', err);
});

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
app.use('/api/backup', apiRateLimitMiddleware, require('./routes/backup'));
app.use('/api/metrics', apiRateLimitMiddleware, require('./routes/metrics'));

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

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketManager.initialize(server);

server.listen(PORT, () => {
  logger.info(`Sunucu başlatıldı`, { port: PORT });
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 