interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: Array<{
    type: 'image' | 'file' | 'document';
    name: string;
    url: string;
    size?: string;
  }>;
}

interface ChatStatus {
  chatId: string;
  status: 'waiting' | 'active' | 'ended';
  agentId?: string;
  messages: ChatMessage[];
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

class ChatService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private isConnected = false;
  private userId: string | null = null;
  private userType: 'user' | 'agent' = 'user';
  private chatId: string | null = null;

  // Event listeners
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Handle page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseHeartbeat();
      } else {
        this.resumeHeartbeat();
      }
    });

    // Handle beforeunload
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId: string, userType: 'user' | 'agent' = 'user', userInfo: any = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    this.userId = userId;
    this.userType = userType;

    return new Promise((resolve, reject) => {
      try {
        // Use the correct WebSocket URL with /ws path
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws';
        console.log('Connecting to WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connection opened');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          
          // Authenticate with server
          this.send({
            type: 'auth',
            userId,
            userType,
            userInfo
          });

          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            // Validate incoming data
            if (typeof event.data !== 'string') {
              console.warn('Received non-string WebSocket data:', event.data);
              return;
            }

            // Check if data is HTML (error response)
            if (event.data.trim().startsWith('<!DOCTYPE') || event.data.trim().startsWith('<html')) {
              console.error('Received HTML instead of WebSocket data:', event.data.substring(0, 200));
              this.emit('error', 'Server sent HTML instead of WebSocket data - check WebSocket URL');
              return;
            }

            // Check if data is valid JSON
            if (!event.data.trim().startsWith('{') && !event.data.trim().startsWith('[')) {
              console.warn('Received non-JSON WebSocket data:', event.data.substring(0, 100));
              return;
            }

            const data: WebSocketMessage = JSON.parse(event.data);
            
            // Handle connection established message
            if (data.type === 'connection_established') {
              console.log('WebSocket connection confirmed:', data.message);
              return;
            }
            
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            console.error('Raw message data:', event.data);
            this.emit('error', 'Invalid message format received from server');
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          
          if (!event.wasClean) {
            this.emit('disconnected', event.code, event.reason);
            this.attemptReconnect();
          } else {
            this.emit('disconnected', event.code, event.reason);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    this.isConnected = false;
    this.stopHeartbeat();
    this.emit('disconnected');
  }

  /**
   * Send message to server
   */
  send(message: WebSocketMessage) {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const messageStr = JSON.stringify(message);
        this.ws.send(messageStr);
        console.log('Sent WebSocket message:', message.type);
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        this.emit('error', 'Failed to send message');
      }
    } else {
      // Queue message for later if not connected
      console.log('WebSocket not connected, queuing message:', message.type);
      this.messageQueue.push(message);
    }
  }

  /**
   * Send chat message
   */
  sendChatMessage(text: string, attachments: any[] = []) {
    if (!this.chatId) {
      console.error('No active chat session');
      return;
    }

    this.send({
      type: 'chat_message',
      text,
      attachments
    });
  }

  /**
   * Start typing indicator
   */
  startTyping() {
    if (this.chatId) {
      this.send({
        type: 'typing_start'
      });
    }
  }

  /**
   * Stop typing indicator
   */
  stopTyping() {
    if (this.chatId) {
      this.send({
        type: 'typing_stop'
      });
    }
  }

  /**
   * End chat session
   */
  endChat(rating?: number, feedback?: string) {
    if (this.chatId) {
      this.send({
        type: 'chat_end',
        rating,
        feedback
      });
    }
  }

  /**
   * Update agent status
   */
  updateAgentStatus(status: 'online' | 'away' | 'busy' | 'offline') {
    if (this.userType === 'agent') {
      this.send({
        type: 'agent_status_update',
        status
      });
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: WebSocketMessage) {
    console.log('Received WebSocket message:', data.type);
    
    switch (data.type) {
      case 'auth_success':
        this.emit('auth_success', data);
        break;

      case 'chat_status':
        this.chatId = data.chatId;
        this.emit('chat_status', data);
        break;

      case 'new_message':
        this.emit('new_message', data.message);
        break;

      case 'chat_ended':
        this.emit('chat_ended', data.chatId);
        break;

      case 'typing_start':
        this.emit('typing_start', data);
        break;

      case 'typing_stop':
        this.emit('typing_stop', data);
        break;

      case 'agent_status_update':
        this.emit('agent_status_update', data);
        break;

      case 'error':
        console.error('Server error:', data.message);
        this.emit('error', data.message);
        break;

      case 'pong':
        // Heartbeat response
        break;

      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId, this.userType)
          .catch((error) => {
            console.error('Reconnection failed:', error);
            this.attemptReconnect();
          });
      }
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Pause heartbeat when page is hidden
   */
  private pauseHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Resume heartbeat when page becomes visible
   */
  private resumeHeartbeat() {
    if (this.isConnected && !this.heartbeatInterval) {
      this.startHeartbeat();
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, ...args: any[]) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      chatId: this.chatId,
      userId: this.userId,
      userType: this.userType
    };
  }

  /**
   * Check if connected
   */
  isConnectedToServer() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;
export type { ChatMessage, ChatStatus, WebSocketMessage };
