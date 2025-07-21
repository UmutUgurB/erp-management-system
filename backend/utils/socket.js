const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { logger } = require('./logger');

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (error) {
        logger.error('Socket authentication error', { error: error.message });
        next(new Error('Authentication error'));
      }
    });

    this.setupEventHandlers();
    logger.info('Socket.IO server initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('User connected to socket', { 
        userId: socket.userId, 
        socketId: socket.id 
      });

      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);

      // Join user to their personal room
      socket.join(`user:${socket.userId}`);

      // Join admin users to admin room
      if (socket.userRole === 'admin') {
        socket.join('admin');
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info('User disconnected from socket', { 
          userId: socket.userId, 
          socketId: socket.id 
        });
        this.connectedUsers.delete(socket.userId);
      });

      // Handle custom events
      socket.on('join-room', (room) => {
        socket.join(room);
        logger.info('User joined room', { 
          userId: socket.userId, 
          room 
        });
      });

      socket.on('leave-room', (room) => {
        socket.leave(room);
        logger.info('User left room', { 
          userId: socket.userId, 
          room 
        });
      });
    });
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      logger.info('Notification sent to user', { 
        userId, 
        event, 
        socketId 
      });
    } else {
      logger.info('User not connected, notification queued', { userId, event });
      // TODO: Queue notification for offline users
    }
  }

  // Send notification to all admin users
  sendToAdmins(event, data) {
    this.io.to('admin').emit(event, data);
    logger.info('Notification sent to admins', { event });
  }

  // Send notification to all connected users
  sendToAll(event, data) {
    this.io.emit(event, data);
    logger.info('Notification sent to all users', { event });
  }

  // Send notification to specific room
  sendToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
    logger.info('Notification sent to room', { room, event });
  }

  // Send system notification
  sendSystemNotification(userId, type, title, message, data = {}) {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      data
    };

    this.sendToUser(userId, 'system-notification', notification);
  }

  // Send order status update
  sendOrderUpdate(userId, orderId, status, orderData) {
    this.sendToUser(userId, 'order-update', {
      orderId,
      status,
      order: orderData,
      timestamp: new Date().toISOString()
    });
  }

  // Send stock alert
  sendStockAlert(productId, productName, currentStock, minStock) {
    this.sendToAdmins('stock-alert', {
      productId,
      productName,
      currentStock,
      minStock,
      timestamp: new Date().toISOString()
    });
  }

  // Send new order notification
  sendNewOrderNotification(orderData) {
    this.sendToAdmins('new-order', {
      order: orderData,
      timestamp: new Date().toISOString()
    });
  }

  // Send user activity
  sendUserActivity(userId, activity) {
    this.sendToAdmins('user-activity', {
      userId,
      activity,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users list
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }
}

// Create singleton instance
const socketManager = new SocketManager();

module.exports = socketManager; 