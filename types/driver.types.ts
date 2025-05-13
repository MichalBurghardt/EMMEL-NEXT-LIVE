/**
 * Driver Type Definitions
 * Contains interfaces and types for driver-related data in the Emmel application
 */

// Driver status enum
export type DriverStatus = 'active' | 'inactive' | 'onLeave' | 'terminated';

// Driver license types
export type LicenseType = 'B' | 'C' | 'CE' | 'D' | 'DE';

// Driver statistics interface
export interface DriverStats {
    completedTrips: number;
    totalDistance: number;
    averageRating?: number;
    onTimePercentage?: number;
}

// Driver's contact information
export interface DriverContact {
    phone: string;
    email?: string;
    emergencyContact?: string;
}

// Driver's address information
export interface DriverAddress {
    street: string;
    houseNumber: string;
    city: string;
    zipCode: string;
    country: string;
}

// Main Driver interface
export interface Driver {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string; // Optional computed property
    dateOfBirth?: Date;
    employmentDate?: Date;
    status: DriverStatus;
    licenseTypes: LicenseType[];
    licenseExpiry?: Date;
    contact: DriverContact;
    address?: DriverAddress;
    profileImage?: string;
    notes?: string;
    stats?: DriverStats;
}

// Driver creation input
export type CreateDriverInput = Omit<Driver, 'id' | 'stats'>;

// Driver update input
export type UpdateDriverInput = Partial<CreateDriverInput> & { id: string };