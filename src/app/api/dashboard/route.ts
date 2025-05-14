import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Bus from '@/models/Bus';
import Booking from '@/models/Booking';
import Driver from '@/models/Driver';
import IndividualCustomerModel from '@/models/IndividualCustomer';
import BusinessCustomerModel from '@/models/BusinessCustomer';
import mongoose from 'mongoose';

// Define TypeScript interfaces for customer types
interface IndividualCustomer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface BusinessCustomer {
  _id: string;
  companyName: string;
  email: string;
}

// Standard route handler without using the withAuth wrapper
export async function GET() {
  try {
    // Connect to MongoDB Atlas - this must succeed for real data
    await connectToDatabase();
    
    // Verify we're actually connected to MongoDB
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      throw new Error(`MongoDB not connected. Connection state: ${mongoose.connection.readyState}`);
    }
    
    console.log('MongoDB connected successfully, fetching dashboard data...');
    
    // Get current date
    const currentDate = new Date();
    const thirtyDaysLater = new Date(currentDate);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    
    // Zoptymalizowane zapytania do bazy danych - pobieranie tylko potrzebnych pól
    const [
      busCount,
      busesWithMaintenance,
      availableBusCount,
      bookingCount,
      upcomingBookingCount,
      recentBookings,
      driverCount,
      availableDriverCount,
      individualCustomerCount,
      businessCustomerCount
    ] = await Promise.all([
      // Liczba wszystkich autobusów
      Bus.countDocuments({}).exec(),
      
      // Pobranie autobusów z nadchodzącym przeglądem
      Bus.find({
        'maintenanceSchedule': {
          $elemMatch: {
            'dueDate': { $gte: currentDate, $lte: thirtyDaysLater },
            'completed': false
          }
        }
      }).select('manufacturer model licensePlate maintenanceSchedule').limit(10).exec(),
      
      // Liczba dostępnych autobusów
      Bus.countDocuments({ status: 'available' }).exec(),
      
      // Liczba wszystkich rezerwacji
      Booking.countDocuments({}).exec(),
      
      // Liczba nadchodzących rezerwacji
      Booking.countDocuments({ startDate: { $gt: currentDate } }).exec(),
      
      // Ostatnie rezerwacje (3)
      Booking.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .populate([
          {
            path: 'customer',
            model: 'IndividualCustomer',
            select: 'firstName lastName email'
          },
          {
            path: 'customer',
            model: 'BusinessCustomer',
            select: 'companyName email'
          }
        ])
        .select('customerType customer startDate endDate status route')
        .exec(),
      
      // Liczba wszystkich kierowców
      Driver.countDocuments({}).exec(),
      
      // Liczba dostępnych kierowców
      Driver.countDocuments({ status: 'available' }).exec(),
      
      // Liczba klientów indywidualnych
      IndividualCustomerModel.countDocuments({}).exec(),
      
      // Liczba klientów biznesowych
      BusinessCustomerModel.countDocuments({}).exec()
    ]);
    
    console.log('Dashboard data query results:', { 
      busCount, 
      busesWithMaintenance: busesWithMaintenance.length,
      availableBusCount,
      bookingCount,
      upcomingBookingCount,
      recentBookings: recentBookings.length,
      driverCount,
      availableDriverCount,
      individualCustomerCount,
      businessCustomerCount
    });
    
    // Obliczenie statystyk
    const totalBuses = busCount;
    const availableBuses = availableBusCount;
    const totalBookings = bookingCount;
    const upcomingBookings = upcomingBookingCount;
    const totalDrivers = driverCount;
    const availableDrivers = availableDriverCount;
    const totalCustomers = individualCustomerCount + businessCustomerCount;
    
    // Przetwarzanie danych ostatnich rezerwacji
    const recentBookingsData = recentBookings.map(booking => {
      // Znajdź informacje o kliencie na podstawie typu
      let customerName = 'Klient';
      
      if (booking.customer) {
        if (booking.customerType === 'IndividualCustomer') {
          // Using type assertion with unknown as intermediate step to avoid TypeScript error
          const customer = booking.customer as unknown as IndividualCustomer;
          if (customer.firstName && customer.lastName) {
            customerName = `${customer.firstName} ${customer.lastName}`;
          }
        } else if (booking.customerType === 'BusinessCustomer') {
          // Using type assertion with unknown as intermediate step to avoid TypeScript error
          const customer = booking.customer as unknown as BusinessCustomer;
          if (customer.companyName) {
            customerName = customer.companyName;
          }
        }
      }
      
      // Dla przypadków z danymi pasażerów, użyj pierwszego pasażera jako rezerwy
      if (customerName === 'Klient' && booking.passengers && booking.passengers.length > 0) {
        const firstPassenger = booking.passengers[0];
        customerName = `${firstPassenger.firstName} ${firstPassenger.lastName}`;
      }
        
      return {
        _id: booking._id,
        customer: { name: customerName },
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        destination: booking.route?.endLocation || 'Brak'
      };
    });
    
    // Przetwarzanie nadchodzących przeglądów
    const upcomingMaintenanceData = [];
    
    // Szukaj wpisów przeglądów w modelach autobusów
    for (const bus of busesWithMaintenance) {
      if (bus.maintenanceSchedule && bus.maintenanceSchedule.length > 0) {
        // Filtruj przyszłe przeglądy
        const futureMaintenance = bus.maintenanceSchedule
          .filter(maintenance => 
            new Date(maintenance.dueDate) >= currentDate &&
            new Date(maintenance.dueDate) <= thirtyDaysLater &&
            !maintenance.completed
          )
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
        // Dodaj każdy nadchodzący przegląd
        for (const maintenance of futureMaintenance) {
          upcomingMaintenanceData.push({
            _id: maintenance._id,
            busName: `${bus.manufacturer || ''} ${bus.model || ''}`.trim(),
            licensePlate: bus.licensePlate,
            maintenanceDate: maintenance.dueDate,
            type: maintenance.type === 'HU' ? 'Hauptuntersuchung' : 'Sicherheitsprüfung',
            status: 'planned'
          });
          
          // Zatrzymaj po zebraniu wystarczającej ilości wpisów
          if (upcomingMaintenanceData.length >= 2) break;
        }
      }
      
      // Zatrzymaj po zebraniu wystarczającej ilości wpisów
      if (upcomingMaintenanceData.length >= 2) break;
    }
    
    // Przygotowanie odpowiedzi
    const dashboardData = {
      stats: {
        totalBuses,
        availableBuses,
        totalBookings,
        upcomingBookings,
        totalDrivers,
        availableDrivers,
        totalCustomers
      },
      recentBookings: recentBookingsData,
      upcomingMaintenance: upcomingMaintenanceData
    };
    
    return NextResponse.json(dashboardData);
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Get MongoDB connection info for diagnostics
    let connectionInfo = {};
    try {
      connectionInfo = {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        mongodbUriSet: !!process.env.MONGODB_URI
      };
    } catch {
      // Intentionally ignoring the error
      connectionInfo = { error: 'Could not get connection info' };
    }
    
    // Return error info and empty data
    return NextResponse.json({
      error: 'Nie udało się pobrać danych z bazy MongoDB Atlas',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
      connectionInfo,
      stats: {
        totalBuses: 0,
        availableBuses: 0,
        totalBookings: 0,
        upcomingBookings: 0,
        totalDrivers: 0,
        availableDrivers: 0,
        totalCustomers: 0
      },
      recentBookings: [],
      upcomingMaintenance: []
    }, { status: 500 });
  }
}