import { prisma } from '../config/database';
import { User } from '@prisma/client';
import { AuthenticatedUser } from '../types';

/**
 * Repository class for User data access operations
 * Handles all database interactions related to users
 */
export class UserRepository {
  /**
   * Create a new user
   */
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuthenticatedUser> {
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  /**
   * Find user by email (includes password for authentication)
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID (excludes password)
   */
  async findById(id: string): Promise<AuthenticatedUser | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get all users (for task assignment dropdown)
   */
  async findAll(): Promise<AuthenticatedUser[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, data: { name: string }): Promise<AuthenticatedUser> {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}