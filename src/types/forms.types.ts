/**
 * Forms Type Definitions
 * Contains interfaces and types for form-related data in the Emmel application
 */

// Generic form field state
export interface FormFieldState<T = unknown> {
    value: T;
    touched: boolean;
    error?: string;
    isValid: boolean;
}

// Generic form state
export interface FormState {
    isValid: boolean;
    isSubmitting: boolean;
    submitError?: string;
    submitCount: number;
}

// Form validation result
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

// Form submission status
export enum FormSubmissionStatus {
    IDLE = 'IDLE',
    SUBMITTING = 'SUBMITTING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}

// Driver form specific types
export interface DriverFormData {
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    employmentDate?: Date;
    status: string;
    licenseTypes: string[];
    licenseExpiry?: Date;
    contact: {
        phone: string;
        email?: string;
        emergencyContact?: string;
    };
    address?: {
        street: string;
        houseNumber: string;
        city: string;
        zipCode: string;
        country: string;
    };
    notes?: string;
    profileImage?: File | string;
}

// Vehicle form specific types
export interface VehicleFormData {
    licensePlate: string;
    type: string;
    make: string;
    model: string;
    year: number;
    capacity: number;
    status: string;
    fuelType: string;
    odometer: number;
    vin: string;
    registrationDate?: Date;
    nextMaintenanceDate?: Date;
    notes?: string;
    images?: File[] | string[];
}

// Form field definition for dynamic form generation
export interface FormFieldDefinition {
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
    placeholder?: string;
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
    validation?: {
        required?: boolean;
        min?: number;
        max?: number;
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
        customValidator?: (value: unknown) => string | undefined;
    };
    defaultValue?: unknown;
}

// Form definition for dynamic form generation
export interface FormDefinition {
    id: string;
    title: string;
    fields: FormFieldDefinition[];
    onSubmit?: (data: unknown) => Promise<void>;
}