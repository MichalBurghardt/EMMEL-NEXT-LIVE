/**
 * Trip related types
 */

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELAYED = 'DELAYED',
}

export interface TripLocation {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  arrivalTime?: Date;
  departureTime?: Date;
  notes?: string;
}

export interface TripRoute {
  origin: TripLocation;
  destination: TripLocation;
  stops: TripLocation[];
  distance: number; // in kilometers
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  polyline?: string; // encoded polyline for map
}

export interface TripFilters {
  startDate?: Date;
  endDate?: Date;
  status?: TripStatus[];
  driverId?: string;
  vehicleId?: string;
  bookingId?: string;
}

export interface TripEvent {
  id: string;
  tripId: string;
  type: TripEventType;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  createdBy: string;
}

export enum TripEventType {
  DEPARTURE = 'DEPARTURE',
  ARRIVAL = 'ARRIVAL',
  STOP = 'STOP',
  BREAK = 'BREAK',
  DELAY = 'DELAY',
  INCIDENT = 'INCIDENT',
  ROUTE_CHANGE = 'ROUTE_CHANGE',
  PASSENGER_PICKUP = 'PASSENGER_PICKUP',
  PASSENGER_DROPOFF = 'PASSENGER_DROPOFF',
}

export interface LiveTripData {
  tripId: string;
  status: TripStatus;
  currentLocation: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number; // in km/h
    timestamp: Date;
  };
  nextStop?: TripLocation;
  estimatedArrival?: Date;
  delayInMinutes?: number;
}