import { io, Socket } from 'socket.io-client';
import { Task, Notification } from '@/types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketManager {
  private socket: Socket | null = null;
  private token: string | null = null;
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Initialize socket connection with authentication token
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      this.disconnect();
    }

    this.token = token;
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      withCredentials: true,
    });

    this.setupEventHandlers();
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  /**
   * Setup default event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Task events
    this.socket.on('taskCreated', (task: Task) => {
      this.emit('taskCreated', task);
    });

    this.socket.on('taskUpdated', (task: Task) => {
      this.emit('taskUpdated', task);
    });

    this.socket.on('taskDeleted', ({ taskId }: { taskId: string }) => {
      this.emit('taskDeleted', taskId);
    });

    // Notification events
    this.socket.on('taskAssigned', ({ task, message }: { task: Task; message: string }) => {
      const notification: Notification = {
        id: `assigned-${task.id}-${Date.now()}`,
        message,
        type: 'info',
        timestamp: new Date(),
        read: false,
      };
      this.emit('notification', notification);
    });

    this.socket.on('taskUnassigned', ({ task, message }: { task: Task; message: string }) => {
      const notification: Notification = {
        id: `unassigned-${task.id}-${Date.now()}`,
        message,
        type: 'warning',
        timestamp: new Date(),
        read: false,
      };
      this.emit('notification', notification);
    });
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketManager = new SocketManager();

// Export types for better TypeScript support
export type SocketEventCallback = (data: any) => void;

export interface SocketEvents {
  taskCreated: (task: Task) => void;
  taskUpdated: (task: Task) => void;
  taskDeleted: (taskId: string) => void;
  notification: (notification: Notification) => void;
}