/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    ME: '/api/auth/me',
  },
  BOOKINGS: {
    BASE: '/api/bookings',
    BY_ID: (id: string) => `/api/bookings/${id}`,
    CALENDAR: '/api/bookings/calendar',
    GENERATE_TICKETS: (id: string) => `/api/bookings/${id}/tickets`,
    AVAILABILITY: '/api/bookings/availability',
    PAYMENTS: (id: string) => `/api/bookings/${id}/payments`,
  },
  CUSTOMERS: {
    INDIVIDUAL: {
      BASE: '/api/customers/individual',
      BY_ID: (id: string) => `/api/customers/individual/${id}`,
    },
    BUSINESS: {
      BASE: '/api/customers/business',
      BY_ID: (id: string) => `/api/customers/business/${id}`,
    },
  },
  FLEET: {
    BASE: '/api/fleet',
    BY_ID: (id: string) => `/api/fleet/${id}`,
    BUSES: '/api/fleet/buses',
    MAINTENANCE: '/api/fleet/maintenance',
    AVAILABILITY: '/api/fleet/availability',
  },
  DRIVERS: {
    BASE: '/api/drivers',
    BY_ID: (id: string) => `/api/drivers/${id}`,
    DOCUMENTS: '/api/drivers/documents',
    AVAILABILITY: '/api/drivers/availability',
    TIMESHEETS: '/api/drivers/time',
  },
  TRIPS: {
    BASE: '/api/trips',
    BY_ID: (id: string) => `/api/trips/${id}`,
    ROUTES: '/api/trips/routes',
  },
  REPORTS: {
    BASE: '/api/reports',
    FINANCIAL: '/api/reports/financial',
    UTILIZATION: '/api/reports/utilization',
    PERFORMANCE: '/api/reports/performance',
  },
  DASHBOARD: '/api/dashboard',
};

/**
 * Status constants for different entities
 */
export const STATUS = {
  BOOKING: {
    INQUIRY: 'INQUIRY',
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PAID: 'PAID',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  PAYMENT: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
  },
  BUS: {
    AVAILABLE: 'available',
    DRIVING: 'driving',
    MAINTENANCE: 'maintenance',
    REPAIR: 'repair',
    OUT_OF_SERVICE: 'outOfService',
  },
  DRIVER: {
    AVAILABLE: 'available',
    ON_DUTY: 'onDuty',
    OFF_DUTY: 'offDuty',
    ON_LEAVE: 'onLeave',
    SICK: 'sick',
  },
};

/**
 * Payment methods
 */
export const PAYMENT_METHODS = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  PAYPAL: 'PAYPAL',
  INVOICE: 'INVOICE',
};

/**
 * Booking types
 */
export const BOOKING_TYPES = {
  FULL_BUS: 'FULL_BUS',
  INDIVIDUAL_SEATS: 'INDIVIDUAL_SEATS',
  TOUR: 'TOUR',
};

/**
 * Customer types
 */
export const CUSTOMER_TYPES = {
  INDIVIDUAL: 'IndividualCustomer',
  BUSINESS: 'BusinessCustomer',
};

/**
 * Bus types and features
 */
export const BUS = {
  TYPES: {
    SMALL: 'SMALL',
    MEDIUM: 'MEDIUM',
    LARGE: 'LARGE',
  },
  FEATURES: {
    WIFI: 'WIFI',
    TOILET: 'TOILET',
    AIR_CONDITIONING: 'AIR_CONDITIONING',
    TV: 'TV',
    COFFEE_MACHINE: 'COFFEE_MACHINE',
    WHEELCHAIR_ACCESS: 'WHEELCHAIR_ACCESS',
    USB_PORTS: 'USB_PORTS',
    RECLINING_SEATS: 'RECLINING_SEATS',
    TABLE: 'TABLE',
  },
  FUEL_TYPES: {
    DIESEL: 'DIESEL',
    PETROL: 'PETROL',
    ELECTRIC: 'ELECTRIC',
    HYBRID: 'HYBRID',
    GAS: 'GAS',
  },
  MAINTENANCE: {
    HU: 'HU', // Hauptuntersuchung (main inspection)
    SP: 'SP', // Sicherheitsprüfung (safety inspection)
  },
};

/**
 * Route types
 */
export const ROUTE_TYPES = {
  FASTEST: 'FASTEST',
  SHORTEST: 'SHORTEST',
  ECONOMIC: 'ECONOMIC',
  SCENIC: 'SCENIC',
};

/**
 * Document types
 */
export const DOCUMENT_TYPES = {
  CONTRACT: 'CONTRACT',
  INVOICE: 'INVOICE',
  OTHER: 'OTHER',
  DRIVER_LICENSE: 'DRIVER_LICENSE',
  QUALIFICATION_CARD: 'QUALIFICATION_CARD',
  MEDICAL_CERTIFICATE: 'MEDICAL_CERTIFICATE',
};

/**
 * Date formats
 */
export const DATE_FORMATS = {
  DEFAULT: 'dd.MM.yyyy',
  WITH_TIME: 'dd.MM.yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  MONTH_YEAR: 'MM/yyyy',
  DAY_MONTH: 'dd.MM',
  TIME_ONLY: 'HH:mm',
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  OPTIONS: [10, 25, 50, 100],
};

/**
 * Theme constants
 */
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'emmel_auth_token',
  REFRESH_TOKEN: 'emmel_refresh_token',
  USER: 'emmel_user',
  THEME: 'emmel_theme',
  FILTER_PREFERENCES: 'emmel_filter_preferences',
  DASHBOARD_LAYOUT: 'emmel_dashboard_layout',
};

/**
 * Form field validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Dieses Feld ist erforderlich',
  INVALID_EMAIL: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
  INVALID_PHONE: 'Bitte geben Sie eine gültige Telefonnummer ein',
  PASSWORD_MIN_LENGTH: 'Passwort muss mindestens 8 Zeichen lang sein',
  PASSWORD_MISMATCH: 'Passwörter stimmen nicht überein',
  INVALID_DATE: 'Bitte geben Sie ein gültiges Datum ein',
  FUTURE_DATE: 'Datum muss in der Zukunft liegen',
  POSITIVE_NUMBER: 'Bitte geben Sie eine positive Zahl ein',
  MIN_VALUE: (min: number) => `Wert muss mindestens ${min} sein`,
  MAX_VALUE: (max: number) => `Wert darf maximal ${max} sein`,
};

/**
 * Application specific defaults
 */
export const DEFAULTS = {
  CURRENCY: 'EUR',
  LANGUAGE: 'de',
  TIMEZONE: 'Europe/Berlin',
  WORKDAY_START: '08:00',
  WORKDAY_END: '18:00',
  DAILY_REST_PERIOD: 11, // hours
  MAX_DRIVING_TIME: 9, // hours
  DATE_RANGE: {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year',
    CUSTOM: 'custom',
  },
};