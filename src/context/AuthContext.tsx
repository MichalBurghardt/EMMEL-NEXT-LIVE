/**
 * Auth Context Provider
 * Manages authentication state throughout the application
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { AuthState, AuthActions, AuthUser, RegisterData } from '@/types/auth.types';
import AuthService from '@/utils/api/authService';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

// Auth context
const AuthContext = createContext<AuthState & AuthActions>({
  ...initialState,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  checkAuth: async () => false,
  updateProfile: async () => false,
  changePassword: async () => false,
  resetPassword: async () => false,
  clearErrors: () => {}
});

// Action types
type AuthAction =
  | { type: 'LOGIN_START' | 'REGISTER_START' | 'AUTH_CHECK_START' | 'UPDATE_PROFILE_START' }
  | { type: 'LOGIN_SUCCESS' | 'REGISTER_SUCCESS' | 'AUTH_CHECK_SUCCESS' | 'UPDATE_PROFILE_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_FAIL' | 'REGISTER_FAIL' | 'AUTH_CHECK_FAIL' | 'UPDATE_PROFILE_FAIL'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERRORS' };

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
    case 'AUTH_CHECK_START':
    case 'UPDATE_PROFILE_START':
      return {
        ...state,
        loading: true,
        error: null
      };

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'AUTH_CHECK_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };

    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };

    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'AUTH_CHECK_FAIL':
    case 'UPDATE_PROFILE_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case 'LOGOUT':
      return {
        ...initialState,
        loading: false
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Props interface
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  // Check if user is logged in on initial render - only runs on client side
  useEffect(() => {
    if (!isClient) return; // Skip during server-side rendering
    
    const verifyAuth = async () => {
      try {
        // Skip auth check if we're on the login or register pages
        if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          if (path === '/login' || path === '/register') {
            dispatch({ type: 'AUTH_CHECK_FAIL', payload: '' });
            return;
          }
          
          // Check if token exists in localStorage before trying to verify
          const token = localStorage.getItem('auth_token');
          if (!token) {
            // No token found, redirect to login
            console.log('No authentication token found, redirecting to login');
            dispatch({ type: 'AUTH_CHECK_FAIL', payload: 'No authentication token found' });
            window.location.href = '/login';
            return;
          }
        }

        dispatch({ type: 'AUTH_CHECK_START' });
        
        const user = await AuthService.checkAuth();
        
        if (user) {
          // User is authenticated
          dispatch({ type: 'AUTH_CHECK_SUCCESS', payload: user });
        } else {
          // User is not authenticated, but this is not an error
          dispatch({ type: 'AUTH_CHECK_FAIL', payload: '' });
        }
      } catch (err) {
        console.error('Error during auth verification:', err);
        
        if (err instanceof Error && err.message.includes('No authentication token found')) {
          // Redirect to login if there's no token
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        
        dispatch({ 
          type: 'AUTH_CHECK_FAIL', 
          payload: err instanceof Error ? err.message : 'Failed to verify authentication status'
        });
      }
    };

    verifyAuth();
  }, [isClient]); // Only run when isClient changes to true

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const user = await AuthService.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return true;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: error instanceof Error ? error.message : 'Login failed'
      });
      return false;
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      dispatch({ type: 'REGISTER_START' });
      const user = await AuthService.register(userData);
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
      return true;
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: error instanceof Error ? error.message : 'Registration failed'
      });
      return false;
    }
  };

  // Logout function
  const logout = (): void => {
    AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Check Auth function
  const checkAuth = async (): Promise<boolean> => {
    if (!isClient) return false; // Don't attempt to check auth on server
    
    try {
      dispatch({ type: 'AUTH_CHECK_START' });
      const user = await AuthService.checkAuth();
      
      if (user) {
        dispatch({ type: 'AUTH_CHECK_SUCCESS', payload: user });
        return true;
      } else {
        // User is not authenticated, but this is not an error
        dispatch({ type: 'AUTH_CHECK_FAIL', payload: '' });
        return false;
      }
    } catch (error) {
      dispatch({
        type: 'AUTH_CHECK_FAIL',
        payload: error instanceof Error ? error.message : 'Authentication check failed'
      });
      return false;
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<AuthUser>): Promise<boolean> => {
    try {
      dispatch({ type: 'UPDATE_PROFILE_START' });
      const user = await AuthService.updateProfile(data);
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: user });
      return true;
    } catch (error) {
      dispatch({
        type: 'UPDATE_PROFILE_FAIL',
        payload: error instanceof Error ? error.message : 'Profile update failed'
      });
      return false;
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      return await AuthService.changePassword(currentPassword, newPassword);
    } catch (error) {
      dispatch({
        type: 'UPDATE_PROFILE_FAIL',
        payload: error instanceof Error ? error.message : 'Password change failed'
      });
      return false;
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      return await AuthService.resetPassword(email);
    } catch (error) {
      dispatch({
        type: 'UPDATE_PROFILE_FAIL',
        payload: error instanceof Error ? error.message : 'Password reset failed'
      });
      return false;
    }
  };

  // Clear errors
  const clearErrors = (): void => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  // Context value
  const contextValue = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    changePassword,
    resetPassword,
    clearErrors
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;