import { EventEmitter } from 'events';

export interface RealtimeMessage {
  type: string;
  payload: any;
  timestamp: number;
  id: string;
}

export interface RealtimeConnection {
  isConnected: boolean;
  reconnectAttempts: number;
  lastPing: number;
  latency: number;
}

class RealtimeService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private url: string;
  private options: {
    autoReconnect: boolean;
    maxReconnectAttempts: number;
    reconnectDelay: number;
    heartbeatInterval: number;
    pingTimeout: number;
  };

  public connection: RealtimeConnection = {
    isConnected: false,
    reconnectAttempts: 0,
    lastPing: 0,
    latency: 0,
  };

  constructor(url: string, options: Partial<RealtimeService['options']> = {}) {
    super();
    this.url = url;
    this.options = {
      autoReconnect: true,
      maxReconnectAttempts: 10,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      pingTimeout: 5000,
      ...options,
    };
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          this.connection.isConnected = true;
          this.connection.reconnectAttempts = 0;
          this.emit('connected');
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: RealtimeMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing realtime message:', error);
          }
        };

        this.ws.onclose = (event) => {
          this.connection.isConnected = false;
          this.stopHeartbeat();
          this.emit('disconnected', event);
          
          if (this.options.autoReconnect && !event.wasClean) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    this.connection.isConnected = false;
  }

  public send(type: string, payload: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    const message: RealtimeMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateMessageId(),
    };

    try {
      this.ws.send(JSON.stringify(message));
      this.emit('sent', message);
      return true;
    } catch (error) {
      console.error('Error sending realtime message:', error);
      this.emit('error', error);
      return false;
    }
  }

  public subscribe(channel: string, callback: (data: any) => void): () => void {
    const eventName = `channel:${channel}`;
    this.on(eventName, callback);
    
    // Send subscription message to server
    this.send('subscribe', { channel });
    
    // Return unsubscribe function
    return () => {
      this.off(eventName, callback);
      this.send('unsubscribe', { channel });
    };
  }

  public unsubscribe(channel: string): void {
    this.send('unsubscribe', { channel });
  }

  public ping(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const pingId = this.generateMessageId();
      const startTime = Date.now();
      
      // Set up ping timeout
      const timeout = setTimeout(() => {
        reject(new Error('Ping timeout'));
      }, this.options.pingTimeout);

      // Listen for pong response
      const handlePong = (message: RealtimeMessage) => {
        if (message.type === 'pong' && message.payload.id === pingId) {
          clearTimeout(timeout);
          this.off('pong', handlePong);
          
          const latency = Date.now() - startTime;
          this.connection.latency = latency;
          this.connection.lastPing = Date.now();
          
          resolve(latency);
        }
      };

      this.on('pong', handlePong);
      
      // Send ping
      this.send('ping', { id: pingId });
    });
  }

  private handleMessage(message: RealtimeMessage): void {
    // Handle system messages
    switch (message.type) {
      case 'pong':
        this.emit('pong', message);
        break;
      case 'error':
        this.emit('error', message.payload);
        break;
      case 'notification':
        this.emit('notification', message.payload);
        break;
      case 'update':
        this.emit('update', message.payload);
        break;
      default:
        // Emit channel-specific messages
        if (message.type.startsWith('channel:')) {
          this.emit(message.type, message.payload);
        } else {
          this.emit('message', message);
        }
    }
  }

  private scheduleReconnect(): void {
    if (this.connection.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    const delay = this.options.reconnectDelay * Math.pow(2, this.connection.reconnectAttempts);
    
    this.reconnectTimer = setTimeout(() => {
      this.connection.reconnectAttempts++;
      this.emit('reconnecting', this.connection.reconnectAttempts);
      
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
        this.scheduleReconnect();
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.connection.isConnected) {
        this.ping().catch((error) => {
          console.warn('Heartbeat ping failed:', error);
          // Force disconnect to trigger reconnection
          if (this.ws) {
            this.ws.close();
          }
        });
      }
    }, this.options.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods
  public isConnected(): boolean {
    return this.connection.isConnected;
  }

  public getConnectionInfo(): RealtimeConnection {
    return { ...this.connection };
  }

  public updateOptions(newOptions: Partial<RealtimeService['options']>): void {
    this.options = { ...this.options, ...newOptions };
  }
}

// Create singleton instance
const realtimeService = new RealtimeService(
  process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
  {
    autoReconnect: true,
    maxReconnectAttempts: 10,
    reconnectDelay: 1000,
    heartbeatInterval: 30000,
    pingTimeout: 5000,
  }
);

export default realtimeService;
