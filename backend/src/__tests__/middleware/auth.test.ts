import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../middleware/auth';
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

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      cookies: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token and attach user to request', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = { userId: 'user-1' };
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.cookies = { token: mockToken };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect((mockRequest as any).user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', async () => {
      // Arrange
      mockRequest.cookies = {};

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      // Arrange
      const mockToken = 'invalid-jwt-token';
      mockRequest.cookies = { token: mockToken };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not found in database', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = { userId: 'non-existent-user' };

      mockRequest.cookies = { token: mockToken };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-user' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});