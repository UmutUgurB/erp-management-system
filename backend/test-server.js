const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { logger } = require('./utils/logger');
const { ResponseHandler } = require('./utils/responseHandler');

const app = express();
const PORT = process.env.TEST_PORT || 5001;

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test routes
app.get('/test', (req, res) => {
  res.json({
    message: 'Test server is running',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/test/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version
  });
});

app.get('/test/error', (req, res) => {
  return ResponseHandler.error(res, new Error('Test error'), 500);
});

app.get('/test/validation', (req, res) => {
  return ResponseHandler.validationError(res, {
    field: 'Test field is required'
  });
});

app.get('/test/not-found', (req, res) => {
  return ResponseHandler.notFound(res, 'Test resource');
});

app.get('/test/unauthorized', (req, res) => {
  return ResponseHandler.unauthorized(res);
});

app.get('/test/forbidden', (req, res) => {
  return ResponseHandler.forbidden(res);
});

app.get('/test/rate-limit', (req, res) => {
  return ResponseHandler.rateLimit(res);
});

// Performance test route
app.get('/test/performance', async (req, res) => {
  const startTime = Date.now();
  
  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const responseTime = Date.now() - startTime;
  
  res.json({
    message: 'Performance test completed',
    responseTime: `${responseTime}ms`,
    timestamp: new Date().toISOString()
  });
});

// Memory test route
app.get('/test/memory', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    message: 'Memory usage information',
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      arrayBuffers: `${Math.round(memoryUsage.arrayBuffers / 1024 / 1024)} MB`
    },
    timestamp: new Date().toISOString()
  });
});

// Stress test route
app.get('/test/stress', async (req, res) => {
  const { iterations = 1000 } = req.query;
  
  const startTime = Date.now();
  let result = 0;
  
  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
  }
  
  const responseTime = Date.now() - startTime;
  
  res.json({
    message: 'Stress test completed',
    iterations: parseInt(iterations),
    result: result.toFixed(6),
    responseTime: `${responseTime}ms`,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  return ResponseHandler.notFound(res, 'Test endpoint');
});

// Error handler
app.use((error, req, res, next) => {
  logger.error('Test server error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });
  
  return ResponseHandler.error(res, error, 500);
});

// Start test server
app.listen(PORT, () => {
  logger.info(`Test server running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
  
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/test/health`);
  console.log(`⚡ Performance test: http://localhost:${PORT}/test/performance`);
  console.log(`🧠 Memory test: http://localhost:${PORT}/test/memory`);
  console.log(`💪 Stress test: http://localhost:${PORT}/test/stress`);
});

module.exports = app;
