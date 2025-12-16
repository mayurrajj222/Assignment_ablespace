import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { CreateTaskDtoType, UpdateTaskDtoType, TaskQueryDtoType } from '../dtos/task.dto';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Controller for task endpoints
 * Handles HTTP requests and responses for task operations
 */
export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  /**
   * Create a new task
   */
  createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskData: CreateTaskDtoType = req.body;
      const task = await this.taskService.createTask(taskData, req.user!.id);

      res.status(201).json({
        message: 'Task created successfully',
        task,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get task by ID
   */
  getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id);

      res.json({ task });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get tasks with filtering and pagination
   */
  getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: TaskQueryDtoType = req.query as any;
      const result = await this.taskService.getTasks(query);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update task
   */
  updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateTaskDtoType = req.body;
      const task = await this.taskService.updateTask(id, data, req.user!.id);

      res.json({
        message: 'Task updated successfully',
        task,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete task
   */
  deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.taskService.deleteTask(id, req.user!.id);

      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get dashboard data
   */
  getDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.taskService.getDashboardData(req.user!.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all users for task assignment
   */
  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.taskService.getUsers();
      res.json({ users });
    } catch (error) {
      next(error);
    }
  };
}