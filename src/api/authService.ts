/**
 * Auth Service for Emmel Reisen Management System
 * Handles user authentication and authorization
 */

import ApiClient from './apiClient';
import { AuthUser, RegisterData, UserRole } from '@/types/auth.types';
import { LoginRequest, LoginResponse } from '@/types/api.types';

// Dodaję interfejs dla odpowiedzi z serwera
interface AuthResponse {
  user: AuthUser;
  token: string;
  data?: {
    user: AuthUser;
    token: string;
  }
}

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
};

class AuthService {
  static baseEndpoint = 'auth';

  /**
   * Login a user with email and password
   */
  static async login(email: string, password: string): Promise<AuthUser> {
    try {
      const loginData: LoginRequest = { email, password };
      const response = await ApiClient.post<AuthResponse>(
        `${this.baseEndpoint}/login`,
        loginData
      );
      
      // Obsługa różnych formatów odpowiedzi
      const userData = response.data?.user || response.user;
      const authToken = response.data?.token || response.token;
      
      // Store the token in localStorage - use safe localStorage accessor
      if (authToken) {
        safeLocalStorage.setItem('auth_token', authToken);
      }
      
      // Add isActive property and ensure role is of UserRole type
      return {
        ...userData,
        role: userData.role as UserRole,
        isActive: true
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  static async register(userData: RegisterData): Promise<AuthUser> {
    try {
      const response = await ApiClient.post<LoginResponse>(
        `${this.baseEndpoint}/register`, 
        userData
      );
      
      // Store the token in localStorage - use safe localStorage accessor
      if (response.token) {
        safeLocalStorage.setItem('auth_token', response.token);
      }
      
      // Add isActive property and ensure role is of UserRole type
      return {
        ...response.user,
        role: response.user.role as UserRole,
        isActive: true
      };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async checkAuth(): Promise<AuthUser | null> {
    try {
      // Try to fetch user data from the API
      const response = await ApiClient.get<{user: AuthUser}>(
        `${this.baseEndpoint}/user`
      );
      return response.user;
    } catch (error) {
      // If API returns 404, the endpoint might not be implemented yet
      // Use a fallback mechanism to check if we have a valid token
      if (error instanceof Error && error.message.includes('Resource not found')) {
        console.warn('Auth endpoint not available, using fallback authentication check');
        
        // Check if token exists in localStorage - use safe localStorage accessor
        const token = safeLocalStorage.getItem('auth_token');
        if (!token) {
          // Return null instead of throwing error when no token is found
          // This is a normal state for non-authenticated users
          return null;
        }
        
        // For development purposes, decode the JWT to get basic user info
        // In production, this should be replaced with a proper endpoint
        try {
          // Simple JWT token decoding (not validation)
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          
          const payload = JSON.parse(jsonPayload);
          
          // Return minimal user data from token
          return {
            id: payload.sub || payload.id || 'unknown',
            email: payload.email || 'user@example.com',
            firstName: payload.firstName || 'Demo',
            lastName: payload.lastName || 'User',
            role: (payload.role as UserRole) || 'USER',
            isActive: true
          } as AuthUser;
        } catch (decodeError) {
          console.error('Failed to decode token:', decodeError);
          // If token decoding fails, clear it and return null
          safeLocalStorage.removeItem('auth_token');
          return null;
        }
      }
      
      // For other errors, proceed with normal error handling
      console.error('Auth check failed:', error);
      return null; // Return null instead of throwing error
    }
  }

  /**
   * Logout the current user
   */
  static logout(): void {
    safeLocalStorage.removeItem('auth_token');
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    try {
      const response = await ApiClient.patch<{user: AuthUser}>(
        `${this.baseEndpoint}/profile`, 
        data
      );
      return response.user;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      await ApiClient.post(`${this.baseEndpoint}/change-password`, {
        currentPassword,
        newPassword,
      });
      return true;
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  static async resetPassword(email: string): Promise<boolean> {
    try {
      await ApiClient.post(`${this.baseEndpoint}/reset-password`, { email });
      return true;
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  /**
   * Set new password using reset token
   */
  static async setNewPassword(token: string, password: string): Promise<boolean> {
    try {
      await ApiClient.post(`${this.baseEndpoint}/set-password`, { 
        token, 
        password 
      });
      return true;
    } catch (error) {
      console.error('Setting new password failed:', error);
      throw error;
    }
  }
}

export default AuthService;