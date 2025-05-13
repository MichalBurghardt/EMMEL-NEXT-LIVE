'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useBaseAuth } from '@/context/AuthContext';

/**
 * Enhanced hook that extends the base authentication functionality
 * with additional utility functions for auth management
 */
export function useAuth() {
  const auth = useBaseAuth();
  const router = useRouter();
  
  /**
   * Check if the user has a specific role
   */
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!auth.user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(auth.user.role);
    }
    
    return auth.user.role === role;
  }, [auth.user]);

  /**
   * Check if the user is authenticated
   */
  const isAuthenticated = useCallback((): boolean => {
    return !!auth.user;
  }, [auth.user]);

  /**
   * Navigate to protected route if authenticated, otherwise redirect to login
   */
  const goToProtectedRoute = useCallback((route: string): void => {
    if (isAuthenticated()) {
      router.push(route);
    } else {
      router.push(`/login?from=${encodeURIComponent(route)}`);
    }
  }, [isAuthenticated, router]);

  /**
   * Get user initials for avatar display
   */
  const getUserInitials = useCallback((): string => {
    if (!auth.user) return '?';
    
    const { firstName, lastName } = auth.user;
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    
    return firstName ? firstName.substring(0, 2).toUpperCase() : '?';
  }, [auth.user]);

  // Additional helper for updating user profile
  const updateProfile = useCallback(async (profileData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    [key: string]: unknown;
  }>) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      // Refresh auth state to get updated user info
      await auth.checkAuth();
      
      return await response.json();
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  }, [auth]);

  // Helper for changing password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }

      return await response.json();
    } catch (err) {
      console.error('Error changing password:', err);
      throw err;
    }
  }, []);

  // Helper for refreshing the authentication token
  const refreshToken = useCallback(async () => {
    try {
      // Use the checkAuth method from the auth context to refresh authentication
      return await auth.checkAuth();
    } catch (err) {
      console.error('Error refreshing token:', err);
      return false;
    }
  }, [auth]);

  // Return all the auth functionality including our additional helpers
  return {
    // Original context values
    ...auth,
    
    // Additional helper functions
    isAuthenticated,
    hasRole,
    goToProtectedRoute,
    getUserInitials,
    updateProfile,
    changePassword,
    refreshToken,
  };
}

// Default export for simpler imports
export default useAuth;