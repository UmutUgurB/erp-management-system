const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path'); // Added missing import

// Import utilities
const { logger } = require('./utils/logger');
const { ResponseFormatter } = require('./utils/responseFormatter');
const { connectDB, disconnectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const exportRoutes = require('./routes/export');

// Import chat manager
const ChatManager = require('./utils/chatManager');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize chat manager
const chatManager = new ChatManager();
chatManager.initialize();

// Middleware
app.use(helmet());
app.use(compression());
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

// Static files for exports
app.use('/exports', express.static(path.join(__dirname, 'exports')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected', // You can add actual DB health check here
    chat: {
      activeChats: chatManager.activeChats.size,
      waitingChats: chatManager.chatQueue.length,
      onlineAgents: Array.from(chatManager.agents.values()).filter(a => a.status === 'online').length
    }
  };
  
  res.json(ResponseFormatter.success('Server is healthy', health));
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  logger.info('New WebSocket connection established');
  
  let userId = null;
  let userType = null; // 'user' or 'agent'
  let chatId = null;

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'auth':
          // Authenticate user and establish connection
          userId = data.userId;
          userType = data.userType;
          logger.info(`WebSocket authenticated: ${userType} ${userId}`);
          
          // Send connection confirmation
          ws.send(JSON.stringify({
            type: 'auth_success',
            userId,
            userType
          }));
          
          // If user, check for existing chat or create new one
          if (userType === 'user') {
            let chat = chatManager.getUserChat(userId);
            if (!chat) {
              chat = chatManager.createChat(userId, data.userInfo);
            }
            chatId = chat.id;
            
            ws.send(JSON.stringify({
              type: 'chat_status',
              chatId,
              status: chat.status,
              agentId: chat.agentId,
              messages: chat.messages
            }));
          }
          break;

        case 'chat_message':
          if (!chatId) break;
          
          // Add message to chat
          const newMessage = chatManager.addMessage(chatId, {
            text: data.text,
            sender: userType,
            attachments: data.attachments || []
          });
          
          if (newMessage) {
            // Broadcast message to all connected clients for this chat
            wss.clients.forEach((client) => {
              if (client.chatId === chatId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'new_message',
                  chatId,
                  message: newMessage
                }));
              }
            });
          }
          break;

        case 'agent_status_update':
          if (userType === 'agent') {
            chatManager.updateAgentStatus(userId, data.status);
            
            // Broadcast agent status update
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'agent_status_update',
                  agentId: userId,
                  status: data.status
                }));
              }
            });
          }
          break;

        case 'chat_end':
          if (chatId) {
            chatManager.endChat(chatId, data.rating, data.feedback);
            
            // Broadcast chat end
            wss.clients.forEach((client) => {
              if (client.chatId === chatId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'chat_ended',
                  chatId
                }));
              }
            });
          }
          break;

        case 'typing_start':
          if (chatId) {
            wss.clients.forEach((client) => {
              if (client.chatId === chatId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'typing_start',
                  chatId,
                  userId,
                  userType
                }));
              }
            });
          }
          break;

        case 'typing_stop':
          if (chatId) {
            wss.clients.forEach((client) => {
              if (client.chatId === chatId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'typing_stop',
                  chatId,
                  userId,
                  userType
                }));
              }
            });
          }
          break;

        default:
          logger.warn(`Unknown WebSocket message type: ${data.type}`);
      }
    } catch (error) {
      logger.error('Error processing WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    logger.info(`WebSocket connection closed: ${userType} ${userId}`);
    
    // If agent disconnected, update their status
    if (userType === 'agent' && userId) {
      chatManager.updateAgentStatus(userId, 'offline');
    }
    
    // Process chat queue when agents disconnect
    chatManager.processQueue();
  });

  // Store user info in WebSocket object for easy access
  ws.userId = userId;
  ws.userType = userType;
  ws.chatId = chatId;
});

// Process chat queue periodically
setInterval(() => {
  chatManager.processQueue();
}, 5000); // Every 5 seconds

// Cleanup old chats periodically
setInterval(() => {
  chatManager.cleanup();
}, 60 * 60 * 1000); // Every hour

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json(ResponseFormatter.notFound('Endpoint not found'));
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json(ResponseFormatter.error('Internal server error', error.message));
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Close WebSocket connections
  wss.clients.forEach((client) => {
    client.close();
  });
  wss.close();
  
  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // Disconnect database
  await disconnectDB();
  
  // Exit process
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    await connectDB();
    logger.info(`Server running on port ${PORT}`);
    logger.info('WebSocket server ready for real-time chat');
    
    // Log initial chat manager status
    const stats = chatManager.getStats();
    logger.info('Chat manager initialized:', stats);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Memory monitoring
setInterval(() => {
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
    logger.warn('High memory usage detected:', {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
    });
  }
}, 5 * 60 * 1000); // Every 5 minutes