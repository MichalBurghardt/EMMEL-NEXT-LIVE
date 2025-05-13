import ApiClient from './apiClient';

interface Booking {
  id?: string;
  client: string;
  clientId: string;
  destination: string;
  startDate: string;
  endDate: string;
  passengers: number;
  description?: string;
  status: string;
  busId?: string;
  driverId?: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

class BookingService {
  static baseEndpoint = 'bookings';

  static async getAllBookings(): Promise<Booking[]> {
    return ApiClient.get(this.baseEndpoint);
  }

  static async getBookingById(id: string): Promise<Booking> {
    return ApiClient.get(`${this.baseEndpoint}/${id}`);
  }

  static async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    return ApiClient.post(this.baseEndpoint, bookingData);
  }

  static async updateBooking(id: string, bookingData: Partial<Booking>): Promise<Booking> {
    return ApiClient.put(`${this.baseEndpoint}/${id}`, bookingData);
  }

  static async deleteBooking(id: string): Promise<{ success: boolean }> {
    return ApiClient.delete(`${this.baseEndpoint}/${id}`);
  }

  static async getBookingsByStatus(status: string): Promise<Booking[]> {
    return ApiClient.get(`${this.baseEndpoint}/status/${status}`);
  }

  static async getBookingsByClient(clientId: string): Promise<Booking[]> {
    return ApiClient.get(`${this.baseEndpoint}/client/${clientId}`);
  }

  static async getBookingsCalendar(startDate: string, endDate: string): Promise<Booking[]> {
    return ApiClient.get(`${this.baseEndpoint}/calendar`, {
      headers: {
        'X-Start-Date': startDate,
        'X-End-Date': endDate,
      }
    });
  }

  static async confirmBooking(id: string): Promise<Booking> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/confirm`, {});
  }

  static async cancelBooking(id: string, reason: string): Promise<Booking> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/cancel`, { reason });
  }

  static async assignDriver(id: string, driverId: string): Promise<Booking> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/assign-driver`, { driverId });
  }

  static async assignBus(id: string, busId: string): Promise<Booking> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/assign-bus`, { busId });
  }

  static async updateStatus(id: string, status: string): Promise<Booking> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/status`, { status });
  }

  static async generateInvoice(id: string): Promise<{ url: string }> {
    return ApiClient.post(`${this.baseEndpoint}/${id}/invoice`, {});
  }
}

export default BookingService;