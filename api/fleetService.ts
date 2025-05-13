import ApiClient from './apiClient';

export interface Bus {
  id?: string;
  registrationNumber: string;
  model: string;
  brand: string;
  capacity: number;
  productionYear: number;
  technicalInspectionDate?: string;
  insuranceExpiryDate?: string;
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
  features?: string[];
  imageUrl?: string;
  description?: string;
  mileage?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Define API response interface for bus endpoints
interface BusApiResponse {
  success: boolean;
  count: number;
  data: Bus[];
}

interface Maintenance {
  id?: string;
  busId: string;
  type: 'scheduled' | 'repair' | 'inspection';
  description: string;
  startDate: string;
  endDate?: string;
  cost?: number;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  serviceProvider?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

class FleetService {
  static baseEndpoint = 'fleet';

  // Metody dla autobusów
  static async getAllBuses(): Promise<Bus[]> {
    const response = await ApiClient.get<BusApiResponse>(`${this.baseEndpoint}/buses`);
    // Check if the response has a data property with an array
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    // If the response is already an array, return it
    if (Array.isArray(response)) {
      return response;
    }
    // If no valid data found, return empty array
    return [];
  }

  static async getBusById(id: string): Promise<Bus> {
    return ApiClient.get(`${this.baseEndpoint}/buses/${id}`);
  }

  static async createBus(busData: Omit<Bus, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bus> {
    return ApiClient.post(`${this.baseEndpoint}/buses`, busData);
  }

  static async updateBus(id: string, busData: Partial<Bus>): Promise<Bus> {
    return ApiClient.put(`${this.baseEndpoint}/buses/${id}`, busData);
  }

  static async deleteBus(id: string): Promise<{ success: boolean }> {
    return ApiClient.delete(`${this.baseEndpoint}/buses/${id}`);
  }

  static async updateBusStatus(id: string, status: Bus['status']): Promise<Bus> {
    return ApiClient.put(`${this.baseEndpoint}/buses/${id}/status`, { status });
  }

  static async updateBusMileage(id: string, mileage: number): Promise<Bus> {
    return ApiClient.put(`${this.baseEndpoint}/buses/${id}/mileage`, { mileage });
  }

  static async getAvailableBuses(startDate: string, endDate: string): Promise<Bus[]> {
    return ApiClient.get(`${this.baseEndpoint}/buses/available`, {
      headers: {
        'X-Start-Date': startDate,
        'X-End-Date': endDate,
      }
    });
  }

  static async uploadBusImage(id: string, imageFile: File): Promise<{ imageUrl: string }> {
    return ApiClient.uploadFile(`${this.baseEndpoint}/buses/${id}/image`, imageFile, 'image');
  }

  // Metody dla konserwacji
  static async getAllMaintenance(): Promise<Maintenance[]> {
    return ApiClient.get(`${this.baseEndpoint}/maintenance`);
  }

  static async getMaintenanceById(id: string): Promise<Maintenance> {
    return ApiClient.get(`${this.baseEndpoint}/maintenance/${id}`);
  }

  static async getBusMaintenance(busId: string): Promise<Maintenance[]> {
    return ApiClient.get(`${this.baseEndpoint}/buses/${busId}/maintenance`);
  }

  static async createMaintenance(maintenanceData: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Maintenance> {
    return ApiClient.post(`${this.baseEndpoint}/maintenance`, maintenanceData);
  }

  static async updateMaintenance(id: string, maintenanceData: Partial<Maintenance>): Promise<Maintenance> {
    return ApiClient.put(`${this.baseEndpoint}/maintenance/${id}`, maintenanceData);
  }

  static async deleteMaintenance(id: string): Promise<{ success: boolean }> {
    return ApiClient.delete(`${this.baseEndpoint}/maintenance/${id}`);
  }

  static async updateMaintenanceStatus(id: string, status: Maintenance['status']): Promise<Maintenance> {
    return ApiClient.put(`${this.baseEndpoint}/maintenance/${id}/status`, { status });
  }

  static async getMaintenanceSchedule(startDate: string, endDate: string): Promise<Maintenance[]> {
    return ApiClient.get(`${this.baseEndpoint}/maintenance/schedule`, {
      headers: {
        'X-Start-Date': startDate,
        'X-End-Date': endDate,
      }
    });
  }

  // Metody analityczne
  static async getBusStatistics(id: string): Promise<{
    totalTrips: number;
    totalDistance: number;
    maintenanceCosts: number;
    availabilityPercentage: number;
  }> {
    return ApiClient.get(`${this.baseEndpoint}/buses/${id}/statistics`);
  }

  static async getFleetStatistics(): Promise<{
    totalBuses: number;
    availableBuses: number;
    maintenanceCosts: number;
    averageAge: number;
    totalCapacity: number;
  }> {
    return ApiClient.get(`${this.baseEndpoint}/statistics`);
  }
}

export default FleetService;