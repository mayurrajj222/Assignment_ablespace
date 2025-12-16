import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { RegisterDtoType, LoginDtoType, UpdateProfileDtoType } from '../dtos/auth.dto';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Controller for authentication endpoints
 * Handles HTTP requests and responses for auth operations
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: RegisterDtoType = req.body;
      const { user, token } = await this.authService.register(userData);

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.status(201).json({
        message: 'User registered successfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const credentials: LoginDtoType = req.body;
      const { user, token } = await this.authService.login(credentials);

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.json({
        message: 'Login successful',
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
  };

  /**
   * Get current user
   */
  getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.getCurrentUser(req.user!.id);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: UpdateProfileDtoType = req.body;
      const user = await this.authService.updateProfile(req.user!.id, data);
      
      res.json({
        message: 'Profile updated successfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  };
}