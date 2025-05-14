import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { getUser } from '@/utils/api';
import Trip from '@/models/Trip';
import Booking from '@/models/Booking';
import Bus from '@/models/Bus';
import Maintenance from '@/models/Maintenance';

/**
 * GET /api/reports/dashboard-summary - Get dashboard summary data
 * @access Private (admin, manager, dispatcher)
 */
export async function GET() {
  try {
    // Get user and check permissions manually instead of using withAuth
    const user = await getUser();
    const allowedRoles = ['admin', 'manager', 'dispatcher'];
    
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Keine Berechtigung für diese Aktion' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get current date for calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Query for active bookings (bookings with status 'confirmed' or 'in-progress')
    const activeBookings = await Booking.countDocuments({
      $or: [{ status: 'CONFIRMED' }, { status: 'PAID' }]
    });

    // Query for upcoming trips (trips with departure date in the future)
    const upcomingTrips = await Trip.countDocuments({
      departureDate: { $gt: now }
    });

    // Query for available buses (buses with status 'available')
    const availableBuses = await Bus.countDocuments({
      status: 'AVAILABLE'
    });

    // Query for total buses to calculate fleet utilization
    const totalBuses = await Bus.countDocuments({});
    const fleetUtilization = totalBuses > 0 
      ? Math.round((totalBuses - availableBuses) / totalBuses * 100) 
      : 0;

    // Query for pending maintenance
    const pendingMaintenance = await Maintenance.countDocuments({
      status: 'SCHEDULED'
    });

    // Calculate total revenue (simplified for demo)
    // In a real app, would sum up all confirmed booking payments
    const bookings = await Booking.find({ status: { $in: ['CONFIRMED', 'COMPLETED'] } });
    const totalRevenue = bookings.reduce((sum, booking) => {
      // Access the price.total field based on the schema
      return sum + (booking.price?.total || 0);
    }, 0);

    // Generate monthly comparison data for the past 6 months
    const monthlyComparison = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const endOfMonth = new Date(currentYear, currentMonth - i + 1, 0);
      
      // Month name (e.g., "Jan", "Feb", etc.)
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      // Count bookings in this month
      const monthBookings = await Booking.countDocuments({
        createdAt: { $gte: month, $lte: endOfMonth }
      });
      
      // Count trips in this month
      const monthTrips = await Trip.countDocuments({
        departureDate: { $gte: month, $lte: endOfMonth }
      });
      
      // Calculate revenue for this month (simplified)
      const monthBookingsData = await Booking.find({
        createdAt: { $gte: month, $lte: endOfMonth },
        status: { $in: ['CONFIRMED', 'COMPLETED'] }
      });
      
      const monthRevenue = monthBookingsData.reduce((sum, booking) => {
        return sum + (booking.price?.total || 0);
      }, 0);
      
      monthlyComparison.push({
        month: monthName,
        revenue: monthRevenue,
        bookings: monthBookings,
        trips: monthTrips
      });
    }

    // Return dashboard summary data
    const dashboardSummary = {
      totalRevenue,
      activeBookings,
      upcomingTrips,
      availableBuses,
      fleetUtilization,
      pendingMaintenance,
      monthlyComparison
    };

    return NextResponse.json(dashboardSummary);
    
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Fehler beim Abrufen der Dashboard-Daten' 
      },
      { status: 500 }
    );
  }
}