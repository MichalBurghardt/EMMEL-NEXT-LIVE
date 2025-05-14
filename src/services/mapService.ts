import axios from 'axios';

// Map service types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface RouteStep {
  distance: number;
  duration: number;
  instructions: string;
  startLocation: Coordinates;
  endLocation?: Coordinates;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  startLocation: Location;
  endLocation: Location;
  steps: RouteStep[];
  polyline: string;
  provider: string;
}

export interface TripPrice {
  distanceCost: number;
  driverCost: number;
  baseCost: number;
  subtotal: number;
  vat: number;
  total: number;
  deposit: number;
  pricePerKm: number;
  distance: number;
  duration: number;
  busType: string;
  days: number;
  hours: number;
}

export interface StopInfo {
  id: string;
  name: string;
  location: Coordinates;
  distance?: number;
}

export type BusType = 'SMALL' | 'MEDIUM' | 'LARGE';
export type RouteType = 'fastest' | 'shortest' | 'economic' | 'scenic';
export type MapProvider = 'google' | 'mapbox';

// Configuration settings from environment variables
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Preferred map provider
const PREFERRED_PROVIDER = (process.env.NEXT_PUBLIC_MAP_PROVIDER || 'google') as MapProvider;

// Dodaję interfejsy dla typów danych z Google Maps API
interface GoogleMapsStep {
  distance: { value: number };
  duration: { value: number };
  html_instructions: string;
  start_location: { lat: number; lng: number };
  end_location: { lat: number; lng: number };
}

// Dodaję interfejs dla typów danych z Mapbox API
interface MapboxStep {
  distance: number;
  duration: number;
  maneuver: {
    instruction: string;
    location: [number, number]; // [lng, lat]
  };
}

/**
 * Calculate route between two points
 * 
 * @param origin Starting point (address, coordinates)
 * @param destination End point (address, coordinates)
 * @param waypoints Intermediate points
 * @param routeType Route type (fastest, shortest, economic, scenic)
 * @param provider Map provider (google, mapbox)
 * @returns Information about the route
 */
export async function calculateRoute(
  origin: string,
  destination: string,
  waypoints: string[] = [],
  routeType: RouteType = 'fastest',
  provider: MapProvider = PREFERRED_PROVIDER
): Promise<RouteInfo> {
  if (!origin || !destination) {
    throw new Error('Origin and destination are required');
  }
  
  try {
    // Choose appropriate map provider
    if (provider === 'google' && GOOGLE_MAPS_API_KEY) {
      return await calculateRouteWithGoogle(origin, destination, waypoints, routeType);
    } else if (provider === 'mapbox' && MAPBOX_ACCESS_TOKEN) {
      return await calculateRouteWithMapbox(origin, destination, waypoints, routeType);
    } else {
      throw new Error('No valid map provider configured');
    }
  } catch (error) {
    console.error(`Error calculating route:`, error);
    throw new Error(`Failed to calculate route: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Calculate route using Google Maps API
 * 
 * @param origin Starting point
 * @param destination End point
 * @param waypoints Intermediate points
 * @param routeType Route type
 * @returns Information about the route
 */
const calculateRouteWithGoogle = async (
  origin: string,
  destination: string,
  waypoints: string[] = [],
  routeType: RouteType = 'fastest'
): Promise<RouteInfo> => {
  try {
    // Map route types to Google Maps parameters
    const routeTypeParams: Record<RouteType, {
      mode: string;
      avoidTolls: boolean;
      avoidHighways: boolean;
      optimize?: boolean;
    }> = {
      'fastest': {
        mode: 'driving',
        avoidTolls: false,
        avoidHighways: false
      },
      'shortest': {
        mode: 'driving',
        avoidTolls: false,
        avoidHighways: false,
        optimize: true
      },
      'economic': {
        mode: 'driving',
        avoidTolls: true,
        avoidHighways: false
      },
      'scenic': {
        mode: 'driving',
        avoidTolls: false,
        avoidHighways: true
      }
    };

    if (!routeTypeParams[routeType]) {
      console.warn(`Unsupported route type: ${routeType}. Defaulting to 'fastest'.`);
    }
    
    // Prepare waypoints
    const waypointsParam = waypoints.length > 0 
      ? `&waypoints=${waypoints.join('|')}`
      : '';
    
    // Route parameters
    const routeParams = routeTypeParams[routeType] || routeTypeParams.fastest;
    
    // API URL
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypointsParam}&mode=${routeParams.mode}&avoid=${routeParams.avoidTolls ? 'tolls' : ''}${routeParams.avoidHighways ? '|highways' : ''}&key=${GOOGLE_MAPS_API_KEY}`;
    
    // Make the request
    const response = await axios.get(url);
    
    // Check response status
    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }
    
    // Process results
    const route = response.data.routes[0];
    const leg = route.legs[0];
    
    return {
      distance: leg.distance.value / 1000, // convert from meters to kilometers
      duration: leg.duration.value / 60, // convert from seconds to minutes
      startLocation: {
        address: leg.start_address,
        lat: leg.start_location.lat,
        lng: leg.start_location.lng
      },
      endLocation: {
        address: leg.end_address,
        lat: leg.end_location.lat,
        lng: leg.end_location.lng
      },
      steps: leg.steps.map((step: GoogleMapsStep) => ({
        distance: step.distance.value / 1000,
        duration: step.duration.value / 60,
        instructions: step.html_instructions.replace(/<[^>]*>/g, ' '), // remove HTML tags
        startLocation: {
          lat: step.start_location.lat,
          lng: step.start_location.lng
        },
        endLocation: {
          lat: step.end_location.lat,
          lng: step.end_location.lng
        }
      })),
      polyline: route.overview_polyline.points,
      provider: 'google'
    };
  } catch (error) {
    console.error(`Error calculating route with Google Maps:`, error);
    throw new Error(`Failed to calculate route with Google Maps: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Calculate route using Mapbox API
 * 
 * @param origin Starting point
 * @param destination End point
 * @param waypoints Intermediate points
 * @param routeType Route type
 * @returns Information about the route
 */
const calculateRouteWithMapbox = async (
  origin: string,
  destination: string,
  waypoints: string[] = [],
  routeType: RouteType = 'fastest'
): Promise<RouteInfo> => {
  try {
    // Map route types to Mapbox parameters
    const routeTypeParams: Record<RouteType, string> = {
      'fastest': 'driving',
      'shortest': 'driving-traffic',
      'economic': 'driving',
      'scenic': 'driving-traffic'
    };
    
    // Convert points to coordinate format (longitude,latitude)
    // In a real implementation, addresses would need to be converted to coordinates
    // using a geocoding service
    const originCoords = await geocodeAddress(origin);
    const destinationCoords = await geocodeAddress(destination);
    
    // Prepare waypoints
    let waypointsCoords: Coordinates[] = [];
    if (waypoints.length > 0) {
      waypointsCoords = await Promise.all(waypoints.map(geocodeAddress));
    }
    
    // Combine all route points
    const allPoints = [originCoords, ...waypointsCoords, destinationCoords];
    const coordinatesParam = allPoints.map(point => `${point.lng},${point.lat}`).join(';');
    
    // Route parameters
    const profile = routeTypeParams[routeType] || 'driving';
    
    // API URL
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinatesParam}?alternatives=false&geometries=polyline&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`;
    
    // Make the request
    const response = await axios.get(url);
    
    // Check response status
    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('No routes found by Mapbox');
    }
    
    // Process results
    const route = response.data.routes[0];
    
    return {
      distance: route.distance / 1000, // convert from meters to kilometers
      duration: route.duration / 60, // convert from seconds to minutes
      startLocation: {
        address: origin,
        lat: originCoords.lat,
        lng: originCoords.lng
      },
      endLocation: {
        address: destination,
        lat: destinationCoords.lat,
        lng: destinationCoords.lng
      },
      steps: route.legs[0].steps.map((step: MapboxStep) => ({
        distance: step.distance / 1000,
        duration: step.duration / 60,
        instructions: step.maneuver.instruction,
        startLocation: {
          lat: step.maneuver.location[1],
          lng: step.maneuver.location[0]
        }
      })),
      polyline: route.geometry,
      provider: 'mapbox'
    };
  } catch (error) {
    console.error(`Error calculating route with Mapbox:`, error);
    throw new Error(`Failed to calculate route with Mapbox: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Temporary function simulating geocoding (use real API in production implementation)
 * 
 * @param address Address to geocode
 * @returns Geographic coordinates
 */
const geocodeAddress = async (address: string): Promise<Coordinates> => {
  // In a real implementation, call a geocoding API
  // This is just a simulation for testing
  
  // Sample coordinates for a few cities
  const exampleCoordinates: Record<string, Coordinates> = {
    'Alzenau': { lat: 50.0767, lng: 9.0731 },
    'Frankfurt': { lat: 50.1109, lng: 8.6821 },
    'Berlin': { lat: 52.5200, lng: 13.4050 },
    'München': { lat: 48.1351, lng: 11.5820 },
    'Hamburg': { lat: 53.5511, lng: 9.9937 }
  };
  
  // Check if address is in sample coordinates database
  for (const [city, coords] of Object.entries(exampleCoordinates)) {
    if (address.includes(city)) {
      return coords;
    }
  }
  
  // Default coordinates for Germany
  return { lat: 51.1657, lng: 10.4515 };
};

/**
 * Calculate static map image with route
 * 
 * @param polyline Encoded route line
 * @param width Image width
 * @param height Image height
 * @param provider Map provider
 * @returns URL to map image
 */
export async function getStaticMapUrl(
  polyline: string,
  width = 600,
  height = 400,
  provider: MapProvider = PREFERRED_PROVIDER
): Promise<string> {
  try {
    if (provider === 'google' && GOOGLE_MAPS_API_KEY) {
      // Google static map URL
      return `https://maps.googleapis.com/maps/api/staticmap?size=${width}x${height}&path=enc:${encodeURIComponent(polyline)}&key=${GOOGLE_MAPS_API_KEY}`;
    } else if (provider === 'mapbox' && MAPBOX_ACCESS_TOKEN) {
      // Mapbox static map URL
      const geoJSON = decodePolylineToGeoJSON(polyline);
      const geoJSONString = encodeURIComponent(JSON.stringify(geoJSON));
      return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/geojson(${geoJSONString})/auto/${width}x${height}?access_token=${MAPBOX_ACCESS_TOKEN}`;
    } else {
      throw new Error('No valid map provider configured');
    }
  } catch (error) {
    console.error(`Error generating static map URL:`, error);
    throw new Error(`Failed to generate static map URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Calculate estimated trip cost based on route
 * 
 * @param routeInfo Route information
 * @param busType Bus type
 * @param days Number of days
 * @param hours Number of hours
 * @returns Cost calculation
 */
export async function calculateTripPrice(
  routeInfo: Pick<RouteInfo, 'distance' | 'duration'>,
  busType: BusType = 'MEDIUM',
  days = 1,
  hours = 8
): Promise<TripPrice> {
  try {
    if (!routeInfo || typeof routeInfo.distance !== 'number' || typeof routeInfo.duration !== 'number') {
      throw new Error('Invalid routeInfo object');
    }

    if (!['SMALL', 'MEDIUM', 'LARGE'].includes(busType)) {
      throw new Error('Invalid busType');
    }

    if (days <= 0 || hours <= 0) {
      throw new Error('Days and hours must be greater than 0');
    }

    // Constants for price calculation
    const PRICE_PER_KM: Record<BusType, number> = {
      'SMALL': 1.8,   // small bus (up to 30 seats)
      'MEDIUM': 2.2,  // medium bus (31-50 seats)
      'LARGE': 2.8    // large bus (more than 50 seats)
    };
    
    const DRIVER_COST_PER_DAY = 320; // driver cost per day (€)
    const DRIVER_COST_PER_HOUR = 40; // driver cost per hour (€)
    const BASE_COST = 150; // base cost (€)
    const MINIMUM_PRICE = 300; // minimum price (€)
    const DEPOSIT_PERCENTAGE = 30; // deposit percentage
    
    // Cost for kilometers
    const distanceCost = routeInfo.distance * PRICE_PER_KM[busType];
    
    // Driver cost (daily or hourly, whichever is larger)
    const driverDailyCost = days * DRIVER_COST_PER_DAY;
    const driverHourlyCost = hours * DRIVER_COST_PER_HOUR;
    const driverCost = Math.max(driverDailyCost, driverHourlyCost);
    
    // Subtotal
    let subtotal = distanceCost + driverCost + BASE_COST;
    
    // Ensure minimum price
    subtotal = Math.max(subtotal, MINIMUM_PRICE);
    
    // VAT (19%)
    const vat = subtotal * 0.19;
    
    // Final price
    const total = subtotal + vat;
    
    // Deposit calculation
    const deposit = Math.round(total * (DEPOSIT_PERCENTAGE / 100));
    
    return {
      distanceCost: Math.round(distanceCost),
      driverCost: Math.round(driverCost),
      baseCost: BASE_COST,
      subtotal: Math.round(subtotal),
      vat: Math.round(vat),
      total: Math.round(total),
      deposit,
      pricePerKm: PRICE_PER_KM[busType],
      distance: routeInfo.distance,
      duration: routeInfo.duration,
      busType,
      days,
      hours
    };
  } catch (error) {
    console.error(`Error calculating trip price:`, error);
    throw new Error(`Failed to calculate trip price: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Find the nearest stop for a given location
 * 
 * @param location Coordinates (lat, lng)
 * @param stops List of available stops
 * @returns Nearest stop
 */
export async function findNearestStop(
  location: Coordinates,
  stops: StopInfo[]
): Promise<StopInfo> {
  try {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      throw new Error('Invalid location object');
    }

    if (!Array.isArray(stops) || stops.length === 0) {
      throw new Error('Stops must be a non-empty array');
    }
    
    // Calculate distance to each stop
    const stopsWithDistance = stops.map(stop => {
      const distance = calculateHaversineDistance(
        location.lat, location.lng,
        stop.location.lat, stop.location.lng
      );
      
      return {
        ...stop,
        distance
      };
    });
    
    // Sort stops by distance
    stopsWithDistance.sort((a, b) => a.distance! - b.distance!);
    
    // Return the closest one
    return stopsWithDistance[0];
  } catch (error) {
    console.error(`Error finding nearest stop:`, error);
    throw new Error(`Failed to find nearest stop: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Calculate distance between two points on Earth using the Haversine formula
 * 
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in kilometers
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

/**
 * Decode an encoded polyline to an array of coordinates
 * 
 * @param encoded Encoded polyline
 * @returns Array of coordinates [lat, lng]
 */
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;

    // Decode latitude change
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    // Decode longitude change
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    // Add point to array
    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

/**
 * Decode an encoded polyline to GeoJSON format
 * 
 * @param encoded Encoded polyline
 * @returns GeoJSON object
 */
const decodePolylineToGeoJSON = (encoded: string): { type: string; coordinates: number[][] } => {
  const coordinates = decodePolyline(encoded).map(([lat, lng]) => [lng, lat]);
  return {
    type: 'LineString',
    coordinates
  };
};

export {
  calculateRouteWithGoogle,
  calculateRouteWithMapbox,
};

export const mapService = {
  calculateRoute,
  getStaticMapUrl,
  calculateTripPrice,
  findNearestStop,
  decodePolyline,
};

export default mapService;