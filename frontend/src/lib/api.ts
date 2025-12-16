import axios from 'axios';
import { 
  AuthResponse, 
  LoginData, 
  RegisterData, 
  User, 
  Task, 
  CreateTaskData, 
  UpdateTaskData, 
  TaskFilters, 
  TasksResponse,
  DashboardData 
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: { name: string }): Promise<AuthResponse> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  getTasks: async (filters: TaskFilters = {}): Promise<TasksResponse> => {
    const response = await api.get('/tasks', { params: filters });
    return response.data;
  },

  getTask: async (id: string): Promise<{ task: Task }> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (data: CreateTaskData): Promise<{ task: Task; message: string }> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  updateTask: async (id: string, data: UpdateTaskData): Promise<{ task: Task; message: string }> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get('/tasks/dashboard');
    return response.data;
  },

  getUsers: async (): Promise<{ users: User[] }> => {
    const response = await api.get('/tasks/users');
    return response.data;
  },
};

export default api;