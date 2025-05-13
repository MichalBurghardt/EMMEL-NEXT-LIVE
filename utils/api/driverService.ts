import ApiClient from './apiClient';

interface Driver {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  status: 'active' | 'on-leave' | 'inactive';
  notes?: string;
  imageUrl?: string;
  employmentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DriverTimeEntry {
  id?: string;
  driverId: string;
  date: string;
  startTime: string;
  endTime?: string;
  breakDuration?: number; // w minutach
  status: 'driving' | 'resting' | 'standby' | 'other';
  notes?: string;
  tripId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DriverAvailability {
  driverId: string;
  driverName: string;
  availableDate: string;
  hoursLeft: number; // pozostałe godziny pracy w danym dniu
  status: 'available' | 'limited' | 'unavailable';
}

class DriverService {
  static baseEndpoint = 'drivers';

  // Podstawowe operacje CRUD dla kierowców
  static async getAllDrivers(): Promise<Driver[]> {
    return ApiClient.get(this.baseEndpoint);
  }

  static async getDriverById(id: string): Promise<Driver> {
    return ApiClient.get(`${this.baseEndpoint}/${id}`);
  }

  static async createDriver(driverData: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver> {
    return ApiClient.post(this.baseEndpoint, driverData);
  }

  static async updateDriver(id: string, driverData: Partial<Driver>): Promise<Driver> {
    return ApiClient.put(`${this.baseEndpoint}/${id}`, driverData);
  }

  static async deleteDriver(id: string): Promise<{ success: boolean }> {
    return ApiClient.delete(`${this.baseEndpoint}/${id}`);
  }

  static async updateDriverStatus(id: string, status: Driver['status']): Promise<Driver> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/status`, { status });
  }

  static async uploadDriverImage(id: string, imageFile: File): Promise<{ imageUrl: string }> {
    return ApiClient.uploadFile(`${this.baseEndpoint}/${id}/image`, imageFile, 'image');
  }

  // Metody dla czasu pracy kierowców
  static async getDriverTimeEntries(driverId: string, startDate: string, endDate: string): Promise<DriverTimeEntry[]> {
    return ApiClient.get(`${this.baseEndpoint}/${driverId}/time`, {
      headers: {
        'X-Start-Date': startDate,
        'X-End-Date': endDate,
      }
    });
  }

  static async createTimeEntry(timeEntry: Omit<DriverTimeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DriverTimeEntry> {
    return ApiClient.post(`${this.baseEndpoint}/${timeEntry.driverId}/time`, timeEntry);
  }

  static async updateTimeEntry(driverId: string, entryId: string, timeEntry: Partial<DriverTimeEntry>): Promise<DriverTimeEntry> {
    return ApiClient.put(`${this.baseEndpoint}/${driverId}/time/${entryId}`, timeEntry);
  }

  static async deleteTimeEntry(driverId: string, entryId: string): Promise<{ success: boolean }> {
    return ApiClient.delete(`${this.baseEndpoint}/${driverId}/time/${entryId}`);
  }

  // Metody do zarządzania dostępnością kierowców
  static async getAvailableDrivers(startDate: string, endDate: string): Promise<DriverAvailability[]> {
    return ApiClient.get(`${this.baseEndpoint}/available`, {
      headers: {
        'X-Start-Date': startDate,
        'X-End-Date': endDate,
      }
    });
  }

  static async getDriverAvailability(driverId: string, startDate: string, endDate: string): Promise<DriverAvailability[]> {
    return ApiClient.get(`${this.baseEndpoint}/${driverId}/availability`, {
      headers: {
        'X-Start-Date': startDate,
        'X-End-Date': endDate,
      }
    });
  }

  static async getDriverTrips(driverId: string, startDate?: string, endDate?: string): Promise<{ tripId: string; startLocation: string; endLocation: string; startTime: string; endTime: string; }[]> {
    const headers: Record<string, string> = {};
    
    if (startDate) headers['X-Start-Date'] = startDate;
    if (endDate) headers['X-End-Date'] = endDate;
    
    return ApiClient.get(`${this.baseEndpoint}/${driverId}/trips`, { headers });
  }

  // Metody analityczne
  static async getDriverStatistics(driverId: string): Promise<{
    totalTrips: number;
    totalDrivingHours: number;
    averageDrivingHoursPerDay: number;
    restCompliancePercentage: number;
  }> {
    return ApiClient.get(`${this.baseEndpoint}/${driverId}/statistics`);
  }

  static async exportDriverTimeSheet(driverId: string, month: number, year: number): Promise<{ fileUrl: string }> {
    return ApiClient.get(`${this.baseEndpoint}/${driverId}/timesheet/export`, {
      headers: {
        'X-Month': month.toString(),
        'X-Year': year.toString()
      }
    });
  }
}

export default DriverService;