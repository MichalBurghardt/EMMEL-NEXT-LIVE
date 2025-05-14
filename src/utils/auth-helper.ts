/**
 * Auth Helper Functions
 * Utility functions to help with authentication flow
 */

// Check if we're running in a browser environment
export const isBrowser = typeof window !== 'undefined';

// Create a demo user for development purposes
export const createDemoUser = () => {
  return {
    id: 'demo-user',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'USER',
    isActive: true
  };
};

// Check if a token exists in localStorage
export const hasAuthToken = (): boolean => {
  if (!isBrowser) return false;
  return !!localStorage.getItem('auth_token');
};

// Get the auth token from localStorage
export const getAuthToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem('auth_token');
};

// Save auth token to localStorage
export const saveAuthToken = (token: string): void => {
  if (isBrowser && token) {
    localStorage.setItem('auth_token', token);
  }
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  if (isBrowser) {
    localStorage.removeItem('auth_token');
  }
};

// Redirect to login page
export const redirectToLogin = (returnUrl?: string): void => {
  if (isBrowser) {
    const url = returnUrl 
      ? `/login?redirect=${encodeURIComponent(returnUrl)}`
      : '/login';
    window.location.href = url;
  }
};
