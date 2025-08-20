const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// Import utilities
const { logger } = require('./utils/logger');
const { ResponseFormatter } = require('./utils/responseFormatter');
const { connectDB, disconnectDB } = require('./config/database');

// Import middleware
const { security } = require('./middleware/security');
const { global: globalRateLimit } = require('./middleware/rateLimit');

// Import routes
const authRoutes = require('./routes/auth');
const exportRoutes = require('./routes/export');

// Import chat manager
const ChatManager = require('./utils/chatManager');

const app = express();
const server = http.createServer(app);

// Initialize chat manager
const chatManager = new ChatManager();
chatManager.initialize();

// Create WebSocket server with specific path
const wss = new WebSocket.Server({ 
  server, 
  path: '/ws',
  verifyClient: (info) => {
    // Basic verification - you can add more sophisticated auth here
    logger.info(`WebSocket connection attempt from: ${info.req.headers.origin || 'unknown'}`);
    return true;
  }
});

// Apply security middleware
app.use(security);

// Apply rate limiting
app.use(globalRateLimit);

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
  logger.info(`New WebSocket connection established from ${req.socket.remoteAddress}`);
  
  let userId = null;
  let userType = null; // 'user' or 'agent'
  let chatId = null;

  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'connection_established',
    message: 'WebSocket connection established successfully'
  }));

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      // Validate message format
      if (typeof message !== 'string') {
        logger.warn('Received non-string message, converting to string');
        message = message.toString();
      }

      // Check if message is valid JSON
      if (!message.trim().startsWith('{')) {
        logger.warn('Received non-JSON message:', message.substring(0, 100));
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format - expected JSON'
        }));
        return;
      }

      const data = JSON.parse(message);
      
      // Validate message structure
      if (!data.type) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Message must have a type field'
        }));
        return;
      }
      
      switch (data.type) {
        case 'auth':
          // Authenticate user and establish connection
          if (!data.userId || !data.userType) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Auth message must include userId and userType'
            }));
            return;
          }

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
              chat = chatManager.createChat(userId, data.userInfo || {});
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
          if (!chatId) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'No active chat session'
            }));
            return;
          }
          
          if (!data.text || typeof data.text !== 'string') {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Chat message must include text field'
            }));
            return;
          }
          
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
            if (!data.status || !['online', 'away', 'busy', 'offline'].includes(data.status)) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid agent status'
              }));
              return;
            }

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

        case 'ping':
          // Respond to ping with pong
          ws.send(JSON.stringify({ type: 'pong' }));
          break;

        default:
          logger.warn(`Unknown WebSocket message type: ${data.type}`);
          ws.send(JSON.stringify({
            type: 'error',
            message: `Unknown message type: ${data.type}`
          }));
      }
    } catch (error) {
      logger.error('Error processing WebSocket message:', error);
      logger.error('Raw message:', message);
      
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format or processing error'
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', (code, reason) => {
    logger.info(`WebSocket connection closed: ${userType} ${userId} - Code: ${code}, Reason: ${reason}`);
    
    // If agent disconnected, update their status
    if (userType === 'agent' && userId) {
      chatManager.updateAgentStatus(userId, 'offline');
    }
    
    // Process chat queue when agents disconnect
    chatManager.processQueue();
  });

  // Handle WebSocket errors
  ws.on('error', (error) => {
    logger.error(`WebSocket error for ${userType} ${userId}:`, error);
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
    client.close(1000, 'Server shutting down');
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
    logger.info(`WebSocket server ready at ws://localhost:${PORT}/ws`);
    
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