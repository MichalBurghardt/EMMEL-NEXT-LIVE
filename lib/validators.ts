import { VALIDATION_MESSAGES } from './constants';
import { isValid, isPast, isFuture } from 'date-fns';

// Define interfaces for the entity types
interface BookingValidationInput {
  bookingType?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  customer?: unknown;
  bus?: unknown;
  driver?: unknown;
  price?: {
    base?: number;
    discount?: number;
    total?: number;
    additionalServices?: Array<{name: string; price: number}>;
  };
}

interface BusValidationInput {
  name?: string;
  licensePlate?: string;
  model?: string;
  manufacturer?: string;
  year?: number;
  seats?: number;
  busType?: string;
  nextHUDate?: Date | string;
  nextSPDate?: Date | string;
}

interface DriverValidationInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  licenseExpiry?: Date | string;
  qualificationExpiry?: Date | string;
  dateOfBirth?: Date | string;
}

interface CustomerValidationInput {
  email?: string;
  phone?: string;
  companyName?: string;
  contactPerson?: string;
  taxId?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Phone number validation
 * Validates various German phone number formats
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+49|0)[1-9][0-9]{1,14}$/;
  return phoneRegex.test(phone);
};

/**
 * License plate validation for German license plates
 */
export const isValidLicensePlate = (plate: string): boolean => {
  // Format: 1-3 letters, 1-2 letters, 1-4 numbers
  const plateRegex = /^[A-ZÖÄÜ]{1,3}-[A-Z]{1,2}-[1-9][0-9]{0,3}$/i;
  return plateRegex.test(plate);
};

/**
 * Password validation
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const isStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  return hasUpperCase && hasLowerCase && hasNumbers;
};

/**
 * Validates a date is a valid date object or string
 */
export const isValidDate = (date: Date | string | undefined): boolean => {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return isValid(d);
};

/**
 * Validates a date is in the future
 */
export const isDateInFuture = (date: Date | string | undefined): boolean => {
  if (!isValidDate(date)) return false;
  const d = typeof date === 'string' ? new Date(date) : date as Date; // Safe cast after isValidDate check
  return isFuture(d);
};

/**
 * Validates a date is in the past
 */
export const isDateInPast = (date: Date | string | undefined): boolean => {
  if (!isValidDate(date)) return false;
  const d = typeof date === 'string' ? new Date(date) : date as Date; // Safe cast after isValidDate check
  return isPast(d);
};

/**
 * Validates a date range
 */
export const isValidDateRange = (
  startDate: Date | string | undefined, 
  endDate: Date | string | undefined
): boolean => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate as Date;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate as Date;
  
  return start <= end;
};

/**
 * Validates a number is positive
 */
export const isPositiveNumber = (num: number): boolean => {
  return typeof num === 'number' && !isNaN(num) && num > 0;
};

/**
 * Validates a number is non-negative (including zero)
 */
export const isNonNegativeNumber = (num: number): boolean => {
  return typeof num === 'number' && !isNaN(num) && num >= 0;
};

/**
 * Validates a value is within a range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validates a string is not empty or only whitespace
 */
export const isNotEmpty = (value: string): boolean => {
  return value !== undefined && value !== null && value.trim() !== '';
};

/**
 * Validates a value is not null or undefined
 */
export const isDefined = (value: unknown): boolean => {
  return value !== undefined && value !== null;
};

/**
 * Validates an array has at least one element
 */
export const hasItems = (arr: unknown[]): boolean => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * Validates an object has a specific property
 */
export const hasProperty = (obj: unknown, prop: string): boolean => {
  return obj !== null && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, prop);
};

/**
 * Form validators (with error messages)
 */
export const formValidators = {
  required: (value: unknown) => 
    isDefined(value) && (typeof value !== 'string' || isNotEmpty(value)) 
      ? undefined 
      : VALIDATION_MESSAGES.REQUIRED,
    
  email: (value: string) => 
    !value || isValidEmail(value) 
      ? undefined 
      : VALIDATION_MESSAGES.INVALID_EMAIL,
    
  phone: (value: string) => 
    !value || isValidPhone(value) 
      ? undefined 
      : VALIDATION_MESSAGES.INVALID_PHONE,
    
  minLength: (min: number) => (value: string) => 
    !value || value.length >= min 
      ? undefined 
      : `Muss mindestens ${min} Zeichen lang sein`,
    
  maxLength: (max: number) => (value: string) => 
    !value || value.length <= max 
      ? undefined 
      : `Darf maximal ${max} Zeichen lang sein`,
    
  password: (value: string) => 
    !value || isStrongPassword(value) 
      ? undefined 
      : VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
    
  passwordMatch: (compareValue: string) => (value: string) => 
    value === compareValue 
      ? undefined 
      : VALIDATION_MESSAGES.PASSWORD_MISMATCH,
    
  date: (value: string | Date) => 
    !value || isValidDate(value) 
      ? undefined 
      : VALIDATION_MESSAGES.INVALID_DATE,
    
  futureDate: (value: string | Date) => 
    !value || (isValidDate(value) && isDateInFuture(value)) 
      ? undefined 
      : VALIDATION_MESSAGES.FUTURE_DATE,
    
  positiveNumber: (value: number) => 
    value === undefined || isPositiveNumber(value) 
      ? undefined 
      : VALIDATION_MESSAGES.POSITIVE_NUMBER,
    
  min: (min: number) => (value: number) => 
    value === undefined || value >= min 
      ? undefined 
      : VALIDATION_MESSAGES.MIN_VALUE(min),
    
  max: (max: number) => (value: number) => 
    value === undefined || value <= max 
      ? undefined 
      : VALIDATION_MESSAGES.MAX_VALUE(max),
    
  licensePlate: (value: string) => 
    !value || isValidLicensePlate(value) 
      ? undefined 
      : 'Ungültiges Kennzeichen',
    
  dateRange: (startDate: string | Date, endDate: string | Date) => 
    !startDate || !endDate || isValidDateRange(startDate, endDate) 
      ? undefined 
      : 'Das Enddatum muss nach dem Startdatum liegen',
};

/**
 * Validation for a booking object
 */
export const validateBooking = (booking: BookingValidationInput): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Required fields
  if (!booking.bookingType) errors.bookingType = VALIDATION_MESSAGES.REQUIRED;
  if (!booking.startDate) errors.startDate = VALIDATION_MESSAGES.REQUIRED;
  if (!booking.endDate) errors.endDate = VALIDATION_MESSAGES.REQUIRED;
  if (!booking.customer) errors.customer = VALIDATION_MESSAGES.REQUIRED;
  if (!booking.bus) errors.bus = VALIDATION_MESSAGES.REQUIRED;
  if (!booking.driver) errors.driver = VALIDATION_MESSAGES.REQUIRED;
  
  // Date validations
  if (booking.startDate && !isValidDate(booking.startDate)) {
    errors.startDate = VALIDATION_MESSAGES.INVALID_DATE;
  }
  
  if (booking.endDate && !isValidDate(booking.endDate)) {
    errors.endDate = VALIDATION_MESSAGES.INVALID_DATE;
  }
  
  if (booking.startDate && booking.endDate && 
      isValidDate(booking.startDate) && isValidDate(booking.endDate) &&
      !isValidDateRange(booking.startDate, booking.endDate)) {
    errors.dateRange = 'Das Enddatum muss nach dem Startdatum liegen';
  }
  
  // Price validations
  if (booking.price) {
    if (!isPositiveNumber(booking.price.base as number)) {
      errors['price.base'] = VALIDATION_MESSAGES.POSITIVE_NUMBER;
    }
    if (!isNonNegativeNumber(booking.price.discount as number)) {
      errors['price.discount'] = 'Der Rabatt darf nicht negativ sein';
    }
    if (!isPositiveNumber(booking.price.total as number)) {
      errors['price.total'] = VALIDATION_MESSAGES.POSITIVE_NUMBER;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validation for a bus object
 */
export const validateBus = (bus: BusValidationInput): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Required fields
  if (!isNotEmpty(bus.name as string)) errors.name = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(bus.licensePlate as string)) errors.licensePlate = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(bus.model as string)) errors.model = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(bus.manufacturer as string)) errors.manufacturer = VALIDATION_MESSAGES.REQUIRED;
  if (!isDefined(bus.year)) errors.year = VALIDATION_MESSAGES.REQUIRED;
  if (!isDefined(bus.seats)) errors.seats = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(bus.busType as string)) errors.busType = VALIDATION_MESSAGES.REQUIRED;
  if (!isValidDate(bus.nextHUDate)) errors.nextHUDate = VALIDATION_MESSAGES.REQUIRED;
  if (!isValidDate(bus.nextSPDate)) errors.nextSPDate = VALIDATION_MESSAGES.REQUIRED;
  
  // Specific validations
  if (bus.licensePlate && !isValidLicensePlate(bus.licensePlate)) {
    errors.licensePlate = 'Ungültiges Kennzeichen';
  }
  
  if (bus.year && !isInRange(bus.year, 1950, new Date().getFullYear() + 1)) {
    errors.year = `Baujahr muss zwischen 1950 und ${new Date().getFullYear() + 1} liegen`;
  }
  
  if (bus.seats && !isInRange(bus.seats, 1, 100)) {
    errors.seats = 'Die Anzahl der Sitzplätze muss zwischen 1 und 100 liegen';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validation for a driver object
 */
export const validateDriver = (driver: DriverValidationInput): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Required fields
  if (!isNotEmpty(driver.firstName as string)) errors.firstName = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(driver.lastName as string)) errors.lastName = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(driver.email as string)) errors.email = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(driver.phone as string)) errors.phone = VALIDATION_MESSAGES.REQUIRED;
  
  // Specific validations
  if (driver.email && !isValidEmail(driver.email)) {
    errors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
  }
  
  if (driver.phone && !isValidPhone(driver.phone)) {
    errors.phone = VALIDATION_MESSAGES.INVALID_PHONE;
  }
  
  if (driver.licenseExpiry && !isValidDate(driver.licenseExpiry)) {
    errors.licenseExpiry = VALIDATION_MESSAGES.INVALID_DATE;
  }
  
  if (driver.qualificationExpiry && !isValidDate(driver.qualificationExpiry)) {
    errors.qualificationExpiry = VALIDATION_MESSAGES.INVALID_DATE;
  }
  
  if (driver.dateOfBirth) {
    if (!isValidDate(driver.dateOfBirth)) {
      errors.dateOfBirth = VALIDATION_MESSAGES.INVALID_DATE;
    } else if (!isDateInPast(driver.dateOfBirth)) {
      errors.dateOfBirth = 'Das Geburtsdatum muss in der Vergangenheit liegen';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validation for a customer object (both business and individual)
 */
export const validateCustomer = (customer: CustomerValidationInput, type: 'business' | 'individual'): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Common required fields
  if (!isNotEmpty(customer.email as string)) errors.email = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(customer.phone as string)) errors.phone = VALIDATION_MESSAGES.REQUIRED;
  
  // Type-specific validations
  if (type === 'business') {
    if (!isNotEmpty(customer.companyName as string)) errors.companyName = VALIDATION_MESSAGES.REQUIRED;
    if (!isNotEmpty(customer.contactPerson as string)) errors.contactPerson = VALIDATION_MESSAGES.REQUIRED;
    if (!isNotEmpty(customer.taxId as string)) errors.taxId = 'Steuernummer ist erforderlich';
  } else {
    if (!isNotEmpty(customer.firstName as string)) errors.firstName = VALIDATION_MESSAGES.REQUIRED;
    if (!isNotEmpty(customer.lastName as string)) errors.lastName = VALIDATION_MESSAGES.REQUIRED;
  }
  
  // Format validations
  if (customer.email && !isValidEmail(customer.email)) {
    errors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
  }
  
  if (customer.phone && !isValidPhone(customer.phone)) {
    errors.phone = VALIDATION_MESSAGES.INVALID_PHONE;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validation for user login
 */
export const validateLogin = (data: { email: string; password: string }): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!isNotEmpty(data.email)) errors.email = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(data.password)) errors.password = VALIDATION_MESSAGES.REQUIRED;
  
  if (data.email && !isValidEmail(data.email)) {
    errors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validation for user registration
 */
export const validateRegistration = (data: { 
  email: string; 
  password: string; 
  confirmPassword: string; 
  firstName: string; 
  lastName: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!isNotEmpty(data.email)) errors.email = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(data.password)) errors.password = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(data.confirmPassword)) errors.confirmPassword = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(data.firstName)) errors.firstName = VALIDATION_MESSAGES.REQUIRED;
  if (!isNotEmpty(data.lastName)) errors.lastName = VALIDATION_MESSAGES.REQUIRED;
  
  if (data.email && !isValidEmail(data.email)) {
    errors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
  }
  
  if (data.password && !isStrongPassword(data.password)) {
    errors.password = VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
  }
  
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = VALIDATION_MESSAGES.PASSWORD_MISMATCH;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};