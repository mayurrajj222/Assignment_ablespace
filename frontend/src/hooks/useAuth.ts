import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import useSWR, { mutate } from 'swr';
import { authApi } from '@/lib/api';
import { socketManager } from '@/lib/socket';
import { User, LoginData, RegisterData } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch current user
  const { data, error, isLoading } = useSWR(
    'auth/me',
    () => authApi.getCurrentUser(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        if (data.user) {
          // Connect socket when user is authenticated
          const token = localStorage.getItem('auth_token');
          if (token) {
            socketManager.connect(token);
          }
        }
      },
      onError: () => {
        // Clear any stored token on auth error
        localStorage.removeItem('auth_token');
        socketManager.disconnect();
      },
    }
  );

  const user = data?.user || null;
  const isAuthenticated = !!user && !error;

  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  const login = async (loginData: LoginData): Promise<void> => {
    try {
      const response = await authApi.login(loginData);
      
      // Store token for socket connection
      // Note: In a real app, you might get the token from the response
      // For now, we'll use a placeholder since we're using HTTP-only cookies
      localStorage.setItem('auth_token', 'placeholder-token');
      
      // Revalidate auth data
      await mutate('auth/me');
      
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (registerData: RegisterData): Promise<void> => {
    try {
      const response = await authApi.register(registerData);
      
      // Store token for socket connection
      localStorage.setItem('auth_token', 'placeholder-token');
      
      // Revalidate auth data
      await mutate('auth/me');
      
      toast.success('Registration successful!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
      
      // Clear stored token
      localStorage.removeItem('auth_token');
      
      // Disconnect socket
      socketManager.disconnect();
      
      // Clear auth data
      await mutate('auth/me', null, false);
      
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('auth_token');
      socketManager.disconnect();
      await mutate('auth/me', null, false);
    }
  };

  const updateProfile = async (data: { name: string }): Promise<void> => {
    try {
      const response = await authApi.updateProfile(data);
      
      // Revalidate auth data
      await mutate('auth/me');
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: !isInitialized,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}