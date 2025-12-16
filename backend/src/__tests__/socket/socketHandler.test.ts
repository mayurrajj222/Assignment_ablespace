import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { SocketHandler } from '../../socket/socketHandler';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('SocketHandler', () => {
  let httpServer: HTTPServer;
  let socketHandler: SocketHandler;
  let mockSocket: any;

  beforeEach(() => {
    httpServer = new HTTPServer();
    socketHandler = new SocketHandler(httpServer);
    
    // Mock socket object
    mockSocket = {
      handshake: {
        auth: {},
      },
      data: {},
      join: jest.fn(),
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Socket Authentication Middleware', () => {
    it('should authenticate valid token and allow connection', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = { userId: 'user-1' };
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockSocket.handshake.auth.token = mockToken;
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const next = jest.fn();

      // Act
      const middleware = (socketHandler as any).io.use.mock.calls[0][0];
      await middleware(mockSocket, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
      expect(mockSocket.data.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
    });

    it('should reject connection when no token is provided', async () => {
      // Arrange
      mockSocket.handshake.auth = {}; // No token
      const next = jest.fn();

      // Act
      const middleware = (socketHandler as any).io.use.mock.calls[0][0];
      await middleware(mockSocket, next);

      // Assert
      expect(next).toHaveBeenCalledWith(new Error('Authentication error'));
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should reject connection when token is invalid', async () => {
      // Arrange
      const mockToken = 'invalid-jwt-token';
      mockSocket.handshake.auth.token = mockToken;
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const next = jest.fn();

      // Act
      const middleware = (socketHandler as any).io.use.mock.calls[0][0];
      await middleware(mockSocket, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(next).toHaveBeenCalledWith(new Error('Authentication error'));
    });

    it('should reject connection when user is not found', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = { userId: 'non-existent-user' };

      mockSocket.handshake.auth.token = mockToken;
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const next = jest.fn();

      // Act
      const middleware = (socketHandler as any).io.use.mock.calls[0][0];
      await middleware(mockSocket, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-user' },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
      expect(next).toHaveBeenCalledWith(new Error('User not found'));
    });
  });

  describe('Event Broadcasting', () => {
    beforeEach(() => {
      // Mock the io.to method to return an object with emit method
      (socketHandler as any).io.to = jest.fn().mockReturnValue({
        emit: jest.fn(),
      });
    });

    it('should broadcast task creation to all clients', () => {
      // Arrange
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        status: 'TODO',
      };

      // Act
      socketHandler.taskCreated(mockTask);

      // Assert
      expect((socketHandler as any).io.to).toHaveBeenCalledWith('tasks');
      expect((socketHandler as any).io.to().emit).toHaveBeenCalledWith('taskCreated', mockTask);
    });

    it('should broadcast task update and send assignment notification', () => {
      // Arrange
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        assignedToId: 'user-2',
      };
      const previousAssigneeId = 'user-1';

      // Act
      socketHandler.taskUpdated(mockTask, previousAssigneeId);

      // Assert
      expect((socketHandler as any).io.to).toHaveBeenCalledWith('tasks');
      expect((socketHandler as any).io.to).toHaveBeenCalledWith('user:user-2');
      expect((socketHandler as any).io.to().emit).toHaveBeenCalledWith('taskUpdated', mockTask);
      expect((socketHandler as any).io.to().emit).toHaveBeenCalledWith('taskAssigned', {
        task: mockTask,
        message: `You have been assigned to task: ${mockTask.title}`,
      });
    });

    it('should broadcast task deletion', () => {
      // Arrange
      const taskId = 'task-1';

      // Act
      socketHandler.taskDeleted(taskId);

      // Assert
      expect((socketHandler as any).io.to).toHaveBeenCalledWith('tasks');
      expect((socketHandler as any).io.to().emit).toHaveBeenCalledWith('taskDeleted', { taskId });
    });
  });
});