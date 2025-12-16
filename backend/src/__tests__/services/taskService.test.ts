import { TaskService } from '../../services/taskService';
import { TaskRepository } from '../../repositories/taskRepository';
import { UserRepository } from '../../repositories/userRepository';
import { Priority, Status } from '@prisma/client';

// Mock the repositories
jest.mock('../../repositories/taskRepository');
jest.mock('../../repositories/userRepository');

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockTaskRepository = new TaskRepository() as jest.Mocked<TaskRepository>;
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    
    taskService = new TaskService();
    (taskService as any).taskRepository = mockTaskRepository;
    (taskService as any).userRepository = mockUserRepository;
  });

  describe('createTask', () => {
    it('should create a task successfully when assignee exists', async () => {
      // Arrange
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: Priority.HIGH,
        assignedToId: 'user-2',
      };
      const creatorId = 'user-1';
      
      const mockAssignee = {
        id: 'user-2',
        email: 'assignee@test.com',
        name: 'Assignee',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCreatedTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: null,
        priority: Priority.HIGH,
        status: Status.TODO,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'user-1',
        assignedToId: 'user-2',
        creator: {
          id: 'user-1',
          email: 'creator@test.com',
          name: 'Creator',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        assignedTo: mockAssignee,
      };

      mockUserRepository.findById.mockResolvedValue(mockAssignee);
      mockTaskRepository.create.mockResolvedValue(mockCreatedTask);

      // Act
      const result = await taskService.createTask(taskData, creatorId);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-2');
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...taskData,
        creatorId,
      });
      expect(result).toEqual(mockCreatedTask);
    });

    it('should throw error when assignee does not exist', async () => {
      // Arrange
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: Priority.HIGH,
        assignedToId: 'non-existent-user',
      };
      const creatorId = 'user-1';

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.createTask(taskData, creatorId)).rejects.toThrow('Assigned user not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('non-existent-user');
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    it('should create task without assignee when assignedToId is not provided', async () => {
      // Arrange
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: Priority.MEDIUM,
      };
      const creatorId = 'user-1';

      const mockCreatedTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: null,
        priority: Priority.MEDIUM,
        status: Status.TODO,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'user-1',
        assignedToId: null,
        creator: {
          id: 'user-1',
          email: 'creator@test.com',
          name: 'Creator',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        assignedTo: null,
      };

      mockTaskRepository.create.mockResolvedValue(mockCreatedTask);

      // Act
      const result = await taskService.createTask(taskData, creatorId);

      // Assert
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...taskData,
        creatorId,
      });
      expect(result).toEqual(mockCreatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete task when user is the creator', async () => {
      // Arrange
      const taskId = 'task-1';
      const userId = 'user-1';

      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: null,
        priority: Priority.MEDIUM,
        status: Status.TODO,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'user-1', // Same as userId
        assignedToId: null,
        creator: {
          id: 'user-1',
          email: 'creator@test.com',
          name: 'Creator',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        assignedTo: null,
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.delete.mockResolvedValue(undefined);

      // Act
      await taskService.deleteTask(taskId, userId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
    });

    it('should throw error when user is not the creator', async () => {
      // Arrange
      const taskId = 'task-1';
      const userId = 'user-2';

      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: null,
        priority: Priority.MEDIUM,
        status: Status.TODO,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'user-1', // Different from userId
        assignedToId: null,
        creator: {
          id: 'user-1',
          email: 'creator@test.com',
          name: 'Creator',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        assignedTo: null,
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask);

      // Act & Assert
      await expect(taskService.deleteTask(taskId, userId)).rejects.toThrow('You can only delete tasks you created');
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error when task does not exist', async () => {
      // Arrange
      const taskId = 'non-existent-task';
      const userId = 'user-1';

      mockTaskRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.deleteTask(taskId, userId)).rejects.toThrow('Task not found');
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });
  });
});