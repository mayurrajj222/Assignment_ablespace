import { prisma } from '../config/database';
import { Task, Priority, Status } from '@prisma/client';
import { TaskWithRelations } from '../types';
import { CreateTaskDtoType, UpdateTaskDtoType, TaskQueryDtoType } from '../dtos/task.dto';

/**
 * Repository class for Task data access operations
 * Handles all database interactions related to tasks
 */
export class TaskRepository {
  /**
   * Create a new task
   */
  async create(taskData: CreateTaskDtoType & { creatorId: string }): Promise<TaskWithRelations> {
    const task = await prisma.task.create({
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    return task;
  }

  /**
   * Find task by ID with relations
   */
  async findById(id: string): Promise<TaskWithRelations | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  /**
   * Find tasks with filtering, sorting, and pagination
   */
  async findMany(query: TaskQueryDtoType): Promise<{
    tasks: TaskWithRelations[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { status, priority, assignedToId, creatorId, sortBy, sortOrder, page, limit } = query;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (creatorId) where.creatorId = creatorId;

    const orderBy: any = {};
    if (sortBy === 'priority') {
      // Custom priority ordering: URGENT > HIGH > MEDIUM > LOW
      orderBy.priority = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update task
   */
  async update(id: string, data: UpdateTaskDtoType): Promise<TaskWithRelations> {
    const updateData: any = { ...data };
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    return prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  /**
   * Delete task
   */
  async delete(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id },
    });
  }

  /**
   * Get overdue tasks for a user
   */
  async getOverdueTasks(userId: string): Promise<TaskWithRelations[]> {
    return prisma.task.findMany({
      where: {
        assignedToId: userId,
        dueDate: {
          lt: new Date(),
        },
        status: {
          not: Status.COMPLETED,
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }
}