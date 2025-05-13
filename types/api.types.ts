/**
 * API Types for Emmel Reisen Management System
 * This file contains TypeScript interfaces and types for API requests and responses
 */

// Common Types
export type ID = string;
export type ISO8601Date = string;

// API Response Status
export type ApiStatus = 'success' | 'error';

// API Response Base Interface
export interface ApiResponse<T = unknown> {
  status: ApiStatus;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Pagination Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Date Range Parameters
export interface DateRangeParams {
  startDate: ISO8601Date;
  endDate: ISO8601Date;
}

// Common Filters
export interface CommonFilters extends PaginationParams {
  search?: string;
  status?: string;
  startDate?: ISO8601Date;
  endDate?: ISO8601Date;
}

// Fleet API Types
export interface FleetFilters extends CommonFilters {
  busType?: 'SMALL' | 'MEDIUM' | 'LARGE';
  status?: 'available' | 'driving' | 'maintenance' | 'repair' | 'outOfService';
  minSeats?: number;
  maxSeats?: number;
  features?: string[];
}

export interface MaintenanceFilters extends CommonFilters {
  vehicleId?: ID;
  priority?: 'low' | 'medium' | 'high';
  type?: string;
}

// Trip API Types
export interface TripFilters extends CommonFilters {
  tripType?: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_DAY_TOUR' | 'SHUTTLE' | 'REGULAR';
  startLocation?: string;
  endLocation?: string;
  isPublic?: boolean;
  busId?: ID;
  driverId?: ID;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

// Booking API Types
export interface BookingFilters extends CommonFilters {
  customerType?: 'IndividualCustomer' | 'BusinessCustomer';
  customerId?: ID;
  bookingType?: 'FULL_BUS' | 'INDIVIDUAL_SEATS';
  busId?: ID;
  driverId?: ID;
  tripId?: ID;
}

// Customer API Types
export interface CustomerFilters extends CommonFilters {
  type?: 'individual' | 'business';
  city?: string;
  country?: string;
  hasActiveBookings?: boolean;
}

export interface BusinessCustomerFilters extends CustomerFilters {
  organizationType?: 'SCHOOL' | 'COMPANY' | 'ASSOCIATION' | 'GOVERNMENT' | 'OTHER';
}

// Driver API Types
export interface DriverFilters extends CommonFilters {
  status?: 'available' | 'driving' | 'vacation' | 'sick' | 'training' | 'inactive';
  licenseTypes?: string[];
  languages?: string[];
}

// Report API Types
export interface ReportOptions {
  format?: 'json' | 'csv' | 'pdf' | 'excel';
  groupBy?: string;
  includeDetails?: boolean;
}

// API Error Response
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: ID;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}