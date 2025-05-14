import ApiClient from './apiClient';

// Common address interface
export interface Address {
  street: string;
  houseNumber?: string;
  city: string;
  postalCode: string;
  country: string;
  _id?: string; // MongoDB adds this
}

// Base customer interface with MongoDB properties
export interface BaseCustomer {
  id?: string;
  _id?: string; // MongoDB object ID
  name?: string;
  email: string;
  phone?: string;
  address?: string | Address;
  city?: string;
  postalCode?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

// Individual customer with MongoDB fields
export interface IndividualCustomer extends BaseCustomer {
  type: 'individual';
  firstName: string;
  lastName: string;
  fullName?: string;
  hasSpecialNeeds?: boolean;
  customerSince?: string;
  identificationNumber?: string;
  bookingsCount?: number;
  address?: string | Address;
}

// Contact person interface
export interface ContactPerson {
  _id?: string;
  firstName: string;
  lastName: string;
  position?: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
}

// Business customer with MongoDB fields
export interface BusinessCustomer extends BaseCustomer {
  type: 'business';
  companyName: string;
  vatNumber?: string;
  taxId?: string;
  contactPerson?: string;
  contactPersons?: ContactPerson[];
  organizationType?: string;
  billingAddress?: Address;
  customerSince?: string;
  bookingsCount?: number;
}

export type Customer = IndividualCustomer | BusinessCustomer;

// Define a booking type for the getCustomerBookings method
export interface CustomerBooking {
  id?: string;
  _id?: string;
  date?: string;
  destination?: string;
  status?: string;
  totalAmount?: number;
  customerId?: string;
}

class CustomerService {
  static baseEndpoint = 'customers';

  static async getAllCustomers(): Promise<Customer[]> {
    return ApiClient.get(this.baseEndpoint);
  }

  static async getCustomerById(id: string): Promise<Customer> {
    return ApiClient.get(`${this.baseEndpoint}/${id}`);
  }

  static async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    return ApiClient.post(this.baseEndpoint, customerData);
  }

  static async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
    return ApiClient.put(`${this.baseEndpoint}/${id}`, customerData);
  }

  static async deleteCustomer(id: string): Promise<{ success: boolean }> {
    return ApiClient.delete(`${this.baseEndpoint}/${id}`);
  }

  static async searchCustomers(query: string): Promise<Customer[]> {
    return ApiClient.get(`${this.baseEndpoint}/search?q=${encodeURIComponent(query)}`);
  }

  // Methods for individual customers
  static async getIndividualCustomers(): Promise<IndividualCustomer[]> {
    return ApiClient.get(`${this.baseEndpoint}/individual`);
  }

  static async createIndividualCustomer(customerData: Omit<IndividualCustomer, 'id' | 'createdAt' | 'updatedAt'>): Promise<IndividualCustomer> {
    return ApiClient.post(`${this.baseEndpoint}/individual`, customerData);
  }

  // Methods for business customers
  static async getBusinessCustomers(): Promise<BusinessCustomer[]> {
    return ApiClient.get(`${this.baseEndpoint}/business`);
  }

  static async createBusinessCustomer(customerData: Omit<BusinessCustomer, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessCustomer> {
    return ApiClient.post(`${this.baseEndpoint}/business`, customerData);
  }

  // Helper methods
  static async getCustomerBookings(id: string): Promise<CustomerBooking[]> {
    return ApiClient.get(`${this.baseEndpoint}/${id}/bookings`);
  }

  static async getCustomerStatistics(id: string): Promise<{
    totalBookings: number;
    totalSpent: number;
    lastBookingDate: string | null;
  }> {
    return ApiClient.get(`${this.baseEndpoint}/${id}/statistics`);
  }
}

export default CustomerService;