import ApiClient from './apiClient';
import { RouteInfo } from '../services/mapService';

export interface Trip {
  id?: string;
  title: string;
  description?: string;
  bookingId: string;
  startDate: string;
  endDate: string;
  startLocation: string;
  destination: string;
  distance?: number;
  busId?: string;
  driverId?: string;
  participants?: number;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  itinerary?: TripItineraryItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TripItineraryItem {
  id?: string;
  tripId: string;
  day: number;
  time: string;
  location: string;
  description: string;
  duration?: number;
  type: 'departure' | 'arrival' | 'stop' | 'activity' | 'overnight';
}

class TripService {
  static baseEndpoint = 'trips';

  // Podstawowe operacje CRUD dla wycieczek
  static async getAllTrips(): Promise<Trip[]> {
    return ApiClient.get(this.baseEndpoint);
  }

  static async getTripById(id: string): Promise<Trip> {
    return ApiClient.get(`${this.baseEndpoint}/${id}`);
  }

  static async createTrip(tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    return ApiClient.post(this.baseEndpoint, tripData);
  }

  static async updateTrip(id: string, tripData: Partial<Trip>): Promise<Trip> {
    return ApiClient.put(`${this.baseEndpoint}/${id}`, tripData);
  }

  static async deleteTrip(id: string): Promise<{ success: boolean }> {
    return ApiClient.delete(`${this.baseEndpoint}/${id}`);
  }

  static async updateTripStatus(id: string, status: Trip['status']): Promise<Trip> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/status`, { status });
  }

  static async assignBusToTrip(id: string, busId: string): Promise<Trip> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/bus`, { busId });
  }

  static async assignDriverToTrip(id: string, driverId: string): Promise<Trip> {
    return ApiClient.put(`${this.baseEndpoint}/${id}/driver`, { driverId });
  }

  // Operacje dla itinerarium wycieczki
  static async getItinerary(tripId: string): Promise<TripItineraryItem[]> {
    return ApiClient.get(`${this.baseEndpoint}/${tripId}/itinerary`);
  }

  static async addItineraryItem(tripId: string, item: Omit<TripItineraryItem, 'id'>): Promise<TripItineraryItem> {
    return ApiClient.post(`${this.baseEndpoint}/${tripId}/itinerary`, item);
  }

  static async updateItineraryItem(tripId: string, itemId: string, item: Partial<TripItineraryItem>): Promise<TripItineraryItem> {
    return ApiClient.put(`${this.baseEndpoint}/${tripId}/itinerary/${itemId}`, item);
  }

  static async deleteItineraryItem(tripId: string, itemId: string): Promise<{ success: boolean }> {
    return ApiClient.delete(`${this.baseEndpoint}/${tripId}/itinerary/${itemId}`);
  }

  // Metody dodatkowe
  static async getActiveTrips(): Promise<Trip[]> {
    return ApiClient.get(`${this.baseEndpoint}/active`);
  }

  static async getTripsByStatus(status: Trip['status']): Promise<Trip[]> {
    return ApiClient.get(`${this.baseEndpoint}/status/${status}`);
  }

  static async getTripsByDateRange(startDate: string, endDate: string): Promise<Trip[]> {
    return ApiClient.get(`${this.baseEndpoint}/range`, {
      headers: {
        'X-Start-Date': startDate,
        'X-End-Date': endDate,
      }
    });
  }

  static async generateTripDocument(tripId: string, type: 'itinerary' | 'agreement' | 'summary'): Promise<{ fileUrl: string }> {
    return ApiClient.get(`${this.baseEndpoint}/${tripId}/document/${type}`);
  }

  // Metody do zarządzania trasą i odległościami
  static async calculateRoute(startLocation: string, destination: string, waypoints?: string[]): Promise<{
    distance: number;
    duration: number;
    route: RouteInfo; // Replaced 'any' with RouteInfo type
  }> {
    const body = {
      startLocation,
      destination,
      waypoints
    };

    return ApiClient.post(`${this.baseEndpoint}/calculate-route`, body);
  }

  static async updateTripRoute(tripId: string, routeData: RouteInfo): Promise<Trip> {
    return ApiClient.put(`${this.baseEndpoint}/${tripId}/route`, routeData as unknown as Record<string, unknown>);
  }
}

export default TripService;