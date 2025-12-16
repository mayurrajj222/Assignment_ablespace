export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum Status {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  assignedToId?: string;
  creator: User;
  assignedTo?: User;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  assignedToId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
  status?: Status;
  assignedToId?: string;
}

export interface TaskFilters {
  status?: Status;
  priority?: Priority;
  assignedToId?: string;
  creatorId?: string;
  sortBy?: 'dueDate' | 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardData {
  assignedTasks: Task[];
  createdTasks: Task[];
  overdueTasks: Task[];
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}