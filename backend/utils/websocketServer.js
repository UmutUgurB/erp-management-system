const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

class WebSocketServer {
  constructor(server, options = {}) {
    this.server = server;
    this.options = {
      path: '/ws',
      verifyClient: true,
      ...options,
    };
    
    this.wss = null;
    this.clients = new Map(); // Map<WebSocket, ClientInfo>
    this.channels = new Map(); // Map<string, Set<WebSocket>>
    this.heartbeatInterval = null;
    this.stats = {
      totalConnections: 0,
      currentConnections: 0,
      totalMessages: 0,
      totalErrors: 0,
    };
  }

  initialize() {
    this.wss = new WebSocket.Server({
      server: this.server,
      path: this.options.path,
      verifyClient: this.options.verifyClient ? this.verifyClient.bind(this) : undefined,
    });

    this.setupEventHandlers();
    this.startHeartbeat();
    
    logger.system.info('WebSocket server initialized', {
      path: this.options.path,
      timestamp: new Date().toISOString(),
    });
  }

  setupEventHandlers() {
    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    this.wss.on('error', (error) => {
      logger.system.error('WebSocket server error', { error: error.message });
      this.stats.totalErrors++;
    });
  }

  async verifyClient(info, callback) {
    try {
      const token = this.extractToken(info.req);
      
      if (!token) {
        callback(false, 401, 'Unauthorized: No token provided');
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded) {
        callback(false, 401, 'Unauthorized: Invalid token');
        return;
      }

      // Store user info in request for later use
      info.req.user = decoded;
      callback(true);
    } catch (error) {
      logger.security.warn('WebSocket authentication failed', {
        error: error.message,
        ip: info.req.socket.remoteAddress,
      });
      callback(false, 401, 'Unauthorized: Invalid token');
    }
  }

  extractToken(req) {
    // Try to extract token from query string
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (token) return token;

    // Try to extract from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  handleConnection(ws, request) {
    const clientId = this.generateClientId();
    const user = request.user;
    
    const clientInfo = {
      id: clientId,
      user: user,
      ip: request.socket.remoteAddress,
      userAgent: request.headers['user-agent'],
      connectedAt: new Date(),
      lastActivity: new Date(),
      subscriptions: new Set(),
      isAlive: true,
    };

    this.clients.set(ws, clientInfo);
    this.stats.totalConnections++;
    this.stats.currentConnections++;

    logger.system.info('WebSocket client connected', {
      clientId,
      userId: user?.id,
      ip: clientInfo.ip,
      timestamp: clientInfo.connectedAt.toISOString(),
    });

    // Send welcome message
    this.sendToClient(ws, {
      type: 'connected',
      payload: {
        clientId,
        message: 'Connected to ERP WebSocket server',
        timestamp: new Date().toISOString(),
      },
    });

    ws.on('message', (data) => {
      this.handleMessage(ws, data);
    });

    ws.on('close', (code, reason) => {
      this.handleDisconnection(ws, code, reason);
    });

    ws.on('error', (error) => {
      this.handleError(ws, error);
    });

    ws.on('pong', () => {
      const clientInfo = this.clients.get(ws);
      if (clientInfo) {
        clientInfo.isAlive = true;
        clientInfo.lastActivity = new Date();
      }
    });
  }

  handleMessage(ws, data) {
    try {
      const message = JSON.parse(data);
      const clientInfo = this.clients.get(ws);
      
      if (!clientInfo) return;

      clientInfo.lastActivity = new Date();
      this.stats.totalMessages++;

      logger.system.debug('WebSocket message received', {
        clientId: clientInfo.id,
        messageType: message.type,
        timestamp: new Date().toISOString(),
      });

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(ws, message.payload);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(ws, message.payload);
          break;
        case 'ping':
          this.handlePing(ws, message.payload);
          break;
        case 'notification':
          this.handleNotification(ws, message.payload);
          break;
        default:
          // Handle custom message types
          this.emit('message', ws, message, clientInfo);
      }
    } catch (error) {
      logger.system.error('Error handling WebSocket message', {
        error: error.message,
        data: data.toString(),
      });
      
      this.sendToClient(ws, {
        type: 'error',
        payload: {
          message: 'Invalid message format',
          error: error.message,
        },
      });
    }
  }

  handleSubscribe(ws, payload) {
    const { channel } = payload;
    const clientInfo = this.clients.get(ws);
    
    if (!clientInfo || !channel) return;

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }

    this.channels.get(channel).add(ws);
    clientInfo.subscriptions.add(channel);

    logger.system.info('Client subscribed to channel', {
      clientId: clientInfo.id,
      channel,
      timestamp: new Date().toISOString(),
    });

    this.sendToClient(ws, {
      type: 'subscribed',
      payload: {
        channel,
        message: `Subscribed to ${channel}`,
      },
    });
  }

  handleUnsubscribe(ws, payload) {
    const { channel } = payload;
    const clientInfo = this.clients.get(ws);
    
    if (!clientInfo || !channel) return;

    if (this.channels.has(channel)) {
      this.channels.get(channel).delete(ws);
      
      // Remove empty channels
      if (this.channels.get(channel).size === 0) {
        this.channels.delete(channel);
      }
    }

    clientInfo.subscriptions.delete(channel);

    logger.system.info('Client unsubscribed from channel', {
      clientId: clientInfo.id,
      channel,
      timestamp: new Date().toISOString(),
    });

    this.sendToClient(ws, {
      type: 'unsubscribed',
      payload: {
        channel,
        message: `Unsubscribed from ${channel}`,
      },
    });
  }

  handlePing(ws, payload) {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo) return;

    clientInfo.lastActivity = new Date();
    clientInfo.isAlive = true;

    this.sendToClient(ws, {
      type: 'pong',
      payload: {
        id: payload.id,
        timestamp: Date.now(),
      },
    });
  }

  handleNotification(ws, payload) {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo) return;

    // Process notification and potentially broadcast to other clients
    logger.system.info('Notification received', {
      clientId: clientInfo.id,
      notification: payload,
      timestamp: new Date().toISOString(),
    });

    // Example: Broadcast to all clients subscribed to 'notifications' channel
    this.broadcastToChannel('notifications', {
      type: 'notification',
      payload: {
        ...payload,
        from: clientInfo.user.id,
        timestamp: new Date().toISOString(),
      },
    });
  }

  handleDisconnection(ws, code, reason) {
    const clientInfo = this.clients.get(ws);
    
    if (clientInfo) {
      // Remove from all subscribed channels
      clientInfo.subscriptions.forEach(channel => {
        if (this.channels.has(channel)) {
          this.channels.get(channel).delete(ws);
          
          if (this.channels.get(channel).size === 0) {
            this.channels.delete(channel);
          }
        }
      });

      logger.system.info('WebSocket client disconnected', {
        clientId: clientInfo.id,
        userId: clientInfo.user?.id,
        code,
        reason: reason?.toString(),
        duration: Date.now() - clientInfo.connectedAt.getTime(),
        timestamp: new Date().toISOString(),
      });

      this.clients.delete(ws);
      this.stats.currentConnections--;
    }
  }

  handleError(ws, error) {
    const clientInfo = this.clients.get(ws);
    
    logger.system.error('WebSocket client error', {
      clientId: clientInfo?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    this.stats.totalErrors++;
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const clientInfo = this.clients.get(ws);
        
        if (!clientInfo) return;

        if (clientInfo.isAlive === false) {
          logger.system.warn('Terminating inactive WebSocket connection', {
            clientId: clientInfo.id,
            userId: clientInfo.user?.id,
            lastActivity: clientInfo.lastActivity,
          });
          
          ws.terminate();
          return;
        }

        clientInfo.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  // Public methods for external use
  broadcastToAll(message) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  broadcastToChannel(channel, message) {
    if (!this.channels.has(channel)) return;

    this.channels.get(channel).forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        logger.system.error('Error sending message to client', {
          error: error.message,
          messageType: message.type,
        });
      }
    }
  }

  sendToUser(userId, message) {
    this.wss.clients.forEach((client) => {
      const clientInfo = this.clients.get(client);
      if (clientInfo && clientInfo.user?.id === userId && client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  getStats() {
    return {
      ...this.stats,
      channels: this.channels.size,
      timestamp: new Date().toISOString(),
    };
  }

  getClientInfo(clientId) {
    for (const [ws, info] of this.clients) {
      if (info.id === clientId) {
        return { ...info, ws };
      }
    }
    return null;
  }

  disconnectClient(clientId) {
    const clientInfo = this.getClientInfo(clientId);
    if (clientInfo && clientInfo.ws) {
      clientInfo.ws.close(1000, 'Admin disconnect');
    }
  }

  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.wss.clients.forEach((client) => {
      client.close(1001, 'Server shutdown');
    });

    this.wss.close(() => {
      logger.system.info('WebSocket server shutdown complete');
    });
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = WebSocketServer;
