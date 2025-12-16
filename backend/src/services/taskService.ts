import { TaskRepository } from '../repositories/taskRepository';
import { UserRepository } from '../repositories/userRepository';
import { CreateTaskDtoType, UpdateTaskDtoType, TaskQueryDtoType } from '../dtos/task.dto';
import { TaskWithRelations } from '../types';
import { createError } from '../middleware/errorHandler';

/**
 * Service class for task business logic
 * Handles task CRUD operations and business rules
 */
export class TaskService {
  private taskRepository: TaskRepository;
  private userRepository: UserRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Create a new task
   * Validates assignee exists if provided
   */
  async createTask(taskData: CreateTaskDtoType, creatorId: string): Promise<TaskWithRelations> {
    // Validate assignee exists if provided
    if (taskData.assignedToId) {
      const assignee = await this.userRepository.findById(taskData.assignedToId);
      if (!assignee) {
        throw createError('Assigned user not found', 404);
      }
    }

    const task = await this.taskRepository.create({ ...taskData, creatorId });

    // Emit real-time event
    if (global.socketHandler) {
      global.socketHandler.taskCreated(task);
    }

    return task;
  }

  /**
   * Get task by ID
   * Validates task exists
   */
  async getTaskById(id: string): Promise<TaskWithRelations> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw createError('Task not found', 404);
    }
    return task;
  }

  /**
   * Get tasks with filtering and pagination
   */
  async getTasks(query: TaskQueryDtoType): Promise<{
    tasks: TaskWithRelations[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.taskRepository.findMany(query);
  }

  /**
   * Update task
   * Validates task exists and assignee exists if provided
   */
  async updateTask(id: string, data: UpdateTaskDtoType, userId: string): Promise<TaskWithRelations> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      throw createError('Task not found', 404);
    }

    // Validate assignee exists if provided
    if (data.assignedToId !== undefined && data.assignedToId !== null) {
      const assignee = await this.userRepository.findById(data.assignedToId);
      if (!assignee) {
        throw createError('Assigned user not found', 404);
      }
    }

    const previousAssigneeId = existingTask.assignedToId;
    const updatedTask = await this.taskRepository.update(id, data);

    // Emit real-time event
    if (global.socketHandler) {
      global.socketHandler.taskUpdated(updatedTask, previousAssigneeId);
    }

    return updatedTask;
  }

  /**
   * Delete task
   * Only creator can delete their tasks
   */
  async deleteTask(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw createError('Task not found', 404);
    }

    // Only creator can delete the task
    if (task.creatorId !== userId) {
      throw createError('You can only delete tasks you created', 403);
    }

    await this.taskRepository.delete(id);

    // Emit real-time event
    if (global.socketHandler) {
      global.socketHandler.taskDeleted(id);
    }
  }

  /**
   * Get dashboard data for a user
   */
  async getDashboardData(userId: string): Promise<{
    assignedTasks: TaskWithRelations[];
    createdTasks: TaskWithRelations[];
    overdueTasks: TaskWithRelations[];
  }> {
    const [assignedTasks, createdTasks, overdueTasks] = await Promise.all([
      this.taskRepository.findMany({
        assignedToId: userId,
        sortBy: 'dueDate',
        sortOrder: 'asc',
        page: 1,
        limit: 50,
      }),
      this.taskRepository.findMany({
        creatorId: userId,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 50,
      }),
      this.taskRepository.getOverdueTasks(userId),
    ]);

    return {
      assignedTasks: assignedTasks.tasks,
      createdTasks: createdTasks.tasks,
      overdueTasks,
    };
  }

  /**
   * Get all users for task assignment
   */
  async getUsers() {
    return this.userRepository.findAll();
  }
}