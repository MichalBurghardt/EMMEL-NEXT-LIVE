/**
 * Fleet management related types
 */

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_SERVICE = 'IN_SERVICE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export enum VehicleType {
  MINIBUS = 'MINIBUS',
  COACH = 'COACH',
  DOUBLE_DECKER = 'DOUBLE_DECKER',
  SHUTTLE = 'SHUTTLE',
  LUXURY = 'LUXURY',
}

export enum FuelType {
  DIESEL = 'DIESEL',
  GASOLINE = 'GASOLINE',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  CNG = 'CNG',
}

export interface VehicleFilter {
  status?: VehicleStatus[];
  type?: VehicleType[];
  capacity?: {
    min?: number;
    max?: number;
  };
  available?: {
    from: Date;
    to: Date;
  };
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  cost: number;
  date: Date;
  odometer: number;
  provider: string;
  notes?: string;
  attachments?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MaintenanceType {
  SCHEDULED = 'SCHEDULED',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  CLEANING = 'CLEANING',
  TIRE = 'TIRE',
  OTHER = 'OTHER',
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  type: VehicleDocumentType;
  number: string;
  issuedDate: Date;
  expiryDate: Date;
  issuedBy: string;
  documentUrl?: string;
  notes?: string;
}

export enum VehicleDocumentType {
  REGISTRATION = 'REGISTRATION',
  INSURANCE = 'INSURANCE',
  INSPECTION = 'INSPECTION',
  PERMIT = 'PERMIT',
  TAX = 'TAX',
  OTHER = 'OTHER',
}