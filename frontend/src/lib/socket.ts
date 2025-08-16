import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second
  private isConnecting = false;

  connect(token: string) {
    if (this.socket && this.isConnected) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      // Check if backend is available before connecting
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      this.socket = io(backendUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 10000, // 10 second timeout
        forceNew: true,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Socket connection failed:', error);
      this.isConnecting = false;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('Max reconnection attempts reached, stopping reconnection');
        this.socket?.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.isConnecting = false;
    });

    this.socket.on('reconnect_error', (error) => {
      console.warn('Socket reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.warn('Socket reconnection failed, giving up');
      this.isConnecting = false;
    });

    // Add error handler for general socket errors
    this.socket.on('error', (error) => {
      console.warn('Socket error:', error);
    });
  }

  // Listen for system notifications
  onSystemNotification(callback: (notification: any) => void) {
    if (!this.socket) return;
    
    this.socket.on('system-notification', (notification) => {
      console.log('System notification received:', notification);
      callback(notification);
    });
  }

  // Listen for order updates
  onOrderUpdate(callback: (update: any) => void) {
    if (!this.socket) return;
    
    this.socket.on('order-update', (update) => {
      console.log('Order update received:', update);
      callback(update);
    });
  }

  // Listen for stock alerts (admin only)
  onStockAlert(callback: (alert: any) => void) {
    if (!this.socket) return;
    
    this.socket.on('stock-alert', (alert) => {
      console.log('Stock alert received:', alert);
      callback(alert);
    });
  }

  // Listen for new orders (admin only)
  onNewOrder(callback: (order: any) => void) {
    if (!this.socket) return;
    
    this.socket.on('new-order', (order) => {
      console.log('New order received:', order);
      callback(order);
    });
  }

  // Listen for user activity (admin only)
  onUserActivity(callback: (activity: any) => void) {
    if (!this.socket) return;
    
    this.socket.on('user-activity', (activity) => {
      console.log('User activity received:', activity);
      callback(activity);
    });
  }

  // Join a specific room
  joinRoom(room: string) {
    if (!this.socket) return;
    
    this.socket.emit('join-room', room);
  }

  // Leave a specific room
  leaveRoom(room: string) {
    if (!this.socket) return;
    
    this.socket.emit('leave-room', room);
  }

  // Send custom event
  emit(event: string, data: any) {
    if (!this.socket) return;
    
    this.socket.emit(event, data);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if connected
  get connected() {
    return this.isConnected;
  }

  // Get socket instance
  get socketInstance() {
    return this.socket;
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient; 