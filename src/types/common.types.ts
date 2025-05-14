import { ID, ISO8601Date } from './api.types';

/**
 * Common Type Definitions
 * Contains shared interfaces, types, and enums used throughout the Emmel application
 */


// Common Address Type
export interface Address {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
}

// Contact Information
export interface ContactInfo {
    email: string;
    phone: string;
    alternativePhone?: string;
}

// Person Basic Information
export interface PersonBasicInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

// Time Period
export interface TimePeriod {
    startTime: ISO8601Date;
    endTime: ISO8601Date;
}

// Status with History
export interface StatusWithHistory<T> {
    currentStatus: T;
    statusHistory: Array<{
        status: T;
        timestamp: ISO8601Date;
        changedBy?: ID;
        notes?: string;
    }>;
}

// Common UI
export interface SelectOption<T = string> {
    label: string;
    value: T;
    disabled?: boolean;
    description?: string;
}

// General Status
export enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING',
    ARCHIVED = 'ARCHIVED',
}

// Time Units
export enum TimeUnit {
    MINUTE = 'MINUTE',
    HOUR = 'HOUR',
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR',
}

// Currency
export enum Currency {
    EUR = 'EUR',
    USD = 'USD',
    GBP = 'GBP',
    CHF = 'CHF',
}

// Coordinates
export interface GeoCoordinates {
    latitude: number;
    longitude: number;
}

// Distance
export interface Distance {
    value: number;
    unit: 'km' | 'mi';
}

// Duration
export interface Duration {
    value: number;
    unit: TimeUnit;
}

// Pagination Result
export interface PaginatedResult<T> {
    items: T[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Error with Code
export interface ErrorWithCode {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

// Phone Number Type
export interface PhoneNumber {
    countryCode: string;
    nationalNumber: string;
    formatted: string;
}