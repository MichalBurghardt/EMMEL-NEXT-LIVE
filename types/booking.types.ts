/**
 * Booking related types
 */

import { BusinessCustomer, IndividualCustomer } from '@/models';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum BookingType {
  ONE_WAY = 'ONE_WAY',
  ROUND_TRIP = 'ROUND_TRIP',
  MULTI_STOP = 'MULTI_STOP',
  CHARTER = 'CHARTER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  CASH = 'CASH',
  INVOICE = 'INVOICE',
}

export interface BookingLocation {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface BookingCustomer {
  individualCustomer?: InstanceType<typeof IndividualCustomer>;
  businessCustomer?: InstanceType<typeof BusinessCustomer>;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface BookingFilters {
  startDate?: Date;
  endDate?: Date;
  status?: BookingStatus[];
  type?: BookingType[];
  customerId?: string;
  vehicleId?: string;
  driverId?: string;
}

export interface CalendarBookingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: BookingStatus;
  customerName: string;
  resourceId?: string;
  color?: string;
}