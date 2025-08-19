const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const database = require('./config/database');
const logger = require('./utils/logger');
const ResponseFormatter = require('./utils/responseFormatter');
const WebSocketServer = require('./utils/websocketServer');

// Import routes
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(logger.httpLogger);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    const memoryUsage = process.memoryUsage();
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealth,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
      },
      environment: process.env.NODE_ENV || 'development'
    };
    
    ResponseFormatter.health(res, healthData);
  } catch (error) {
    logger.system.error('Health check failed', { error: error.message });
    ResponseFormatter.serverError(res, 'Health check failed');
  }
});

// API routes
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  ResponseFormatter.success(res, 'ERP Backend API', {
    version: process.env.API_VERSION || '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  ResponseFormatter.notFound(res, 'Route not found');
});

// Global error handler
app.use(ResponseFormatter.errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await database.initializeDatabase();
    logger.system.info('Database initialized successfully');
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.system.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    });
    
    // Initialize WebSocket server
    const wsServer = new WebSocketServer(server, {
      path: '/ws',
      verifyClient: true
    });
    wsServer.initialize();
    
    // Store WebSocket server instance for external access
    app.set('wsServer', wsServer);
    
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.system.info(`Received ${signal}, starting graceful shutdown...`);
      
      // Close WebSocket server
      if (wsServer) {
        wsServer.shutdown();
      }
      
      // Close HTTP server
      server.close(() => {
        logger.system.info('HTTP server closed');
      });
      
      // Close database connection
      await database.disconnect();
      logger.system.info('Database connection closed');
      
      process.exit(0);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Memory monitoring
    setInterval(() => {
      const memUsage = process.memoryUsage();
      if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB threshold
        logger.system.warn('High memory usage detected', {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
        });
      }
    }, 60000); // Check every minute
    
  } catch (error) {
    logger.system.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();