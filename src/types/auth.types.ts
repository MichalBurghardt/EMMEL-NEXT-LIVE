/**
 * Authentication Type Definitions
 * Contains interfaces and types related to user authentication and authorization
 */

import { ID } from './api.types';

// Roles
export type UserRole = 
  | 'admin' 
  | 'manager' 
  | 'dispatcher' 
  | 'driver' 
  | 'individual_customer'
  | 'business_customer';

// Auth User
export interface AuthUser {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  profileImage?: string;
}

// JWT Payload
export interface JwtPayload {
  userId: ID;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Auth Context State
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Auth Context Actions
export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>; // Zwraca boolean informujący o sukcesie/porażce autoryzacji
  updateProfile: (data: Partial<AuthUser>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  clearErrors: () => void;
}

// Register Data
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

// Auth Settings
export interface AuthSettings {
  tokenExpiry: string;
  refreshTokenExpiry: string;
  passwordStrengthRegex: RegExp;
  passwordMinLength: number;
  maxLoginAttempts: number;
  lockoutTime: number; // in minutes
}

// Default auth settings
export const DEFAULT_AUTH_SETTINGS: AuthSettings = {
  tokenExpiry: '1d',
  refreshTokenExpiry: '7d',
  passwordStrengthRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
  passwordMinLength: 8,
  maxLoginAttempts: 5,
  lockoutTime: 15
};