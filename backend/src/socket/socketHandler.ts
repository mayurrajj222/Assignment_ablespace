import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

/**
 * Socket.io handler for real-time communication
 * Manages task updates and assignment notifications
 */
export class SocketHandler {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware for socket connections
   */
  private setupMiddleware(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.data.user.name} connected`);

      // Join user to their personal room for notifications
      socket.join(`user:${socket.data.user.id}`);

      // Join general tasks room for task updates
      socket.join('tasks');

      socket.on('disconnect', () => {
        console.log(`User ${socket.data.user.name} disconnected`);
      });
    });
  }

  /**
   * Broadcast task creation to all connected clients
   */
  taskCreated(task: any): void {
    this.io.to('tasks').emit('taskCreated', task);
  }

  /**
   * Broadcast task update to all connected clients
   */
  taskUpdated(task: any, previousAssigneeId?: string): void {
    this.io.to('tasks').emit('taskUpdated', task);

    // Send assignment notification if task was assigned to someone new
    if (task.assignedToId && task.assignedToId !== previousAssigneeId) {
      this.io.to(`user:${task.assignedToId}`).emit('taskAssigned', {
        task,
        message: `You have been assigned to task: ${task.title}`,
      });
    }

    // Send unassignment notification if task was unassigned
    if (previousAssigneeId && !task.assignedToId) {
      this.io.to(`user:${previousAssigneeId}`).emit('taskUnassigned', {
        task,
        message: `You have been unassigned from task: ${task.title}`,
      });
    }
  }

  /**
   * Broadcast task deletion to all connected clients
   */
  taskDeleted(taskId: string): void {
    this.io.to('tasks').emit('taskDeleted', { taskId });
  }

  /**
   * Get the Socket.IO instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}

// Export singleton instance
let socketHandlerInstance: SocketHandler | null = null;

export const getSocketHandler = (): SocketHandler | null => {
  return socketHandlerInstance;
};

export const setSocketHandler = (handler: SocketHandler): void => {
  socketHandlerInstance = handler;
};