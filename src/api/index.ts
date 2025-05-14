import ApiClient from './apiClient';
import BookingService from './bookingService';
import CustomerService from './customerService';
import FleetService from './fleetService';
import DriverService from './driverService';
import TripService from './tripService';
import ReportService from './reportService';
import UserService from './userService';

export const apiService = ApiClient;
export const bookingService = BookingService;
export const customerService = CustomerService;
export const fleetService = FleetService;
export const driverService = DriverService;
export const tripService = TripService;
export const reportService = ReportService;
export const userService = UserService;

export { default as ApiClient } from './apiClient';
export { default as BookingService } from './bookingService';
export { default as CustomerService } from './customerService';
export { default as FleetService } from './fleetService';
export { default as DriverService } from './driverService';
export { default as TripService } from './tripService';
export { default as ReportService } from './reportService';
export { default as UserService } from './userService';