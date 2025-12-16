import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { RegisterDto, LoginDto, UpdateProfileDto } from '../dtos/auth.dto';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', validate(RegisterDto), authController.register);
router.post('/login', validate(LoginDto), authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/profile', authenticateToken, validate(UpdateProfileDto), authController.updateProfile);

export default router;