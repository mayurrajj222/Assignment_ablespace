import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';
import { RegisterDtoType, LoginDtoType, UpdateProfileDtoType } from '../dtos/auth.dto';
import { AuthenticatedUser } from '../types';
import { createError } from '../middleware/errorHandler';

/**
 * Service class for authentication business logic
 * Handles user registration, login, and profile management
 */
export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Register a new user
   * Validates email uniqueness and hashes password
   */
  async register(userData: RegisterDtoType): Promise<{ user: AuthenticatedUser; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw createError('User with this email already exists', 409);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = this.generateToken(user.id);

    return { user, token };
  }

  /**
   * Login user
   * Validates credentials and returns user data with token
   */
  async login(credentials: LoginDtoType): Promise<{ user: AuthenticatedUser; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = this.generateToken(user.id);

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileDtoType): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    return this.userRepository.updateProfile(userId, data);
  }

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }
    return user;
  }

  /**
   * Generate JWT token for user
   */
  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
  }
}