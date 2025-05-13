/**
 * API endpoint for bookings
 * Retrieves booking data from MongoDB
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';

// Dynamically import model to prevent schema registration errors during hot reloads
async function getBookingModel(): Promise<mongoose.Model<any>> {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Use existing model if it exists
    if (mongoose.models.Booking) {
      return mongoose.models.Booking;
    }
    
    // Import and create model if it doesn't exist
    const { default: Model } = await import('@/models/Booking');
    return Model;
  } catch (error) {
    console.error('Error loading Booking model:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    // Get the URL object to parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const sort = url.searchParams.get('sort') || 'startDate';
    const status = url.searchParams.get('status') || null;
    const startDate = url.searchParams.get('startDate') || null;
    const endDate = url.searchParams.get('endDate') || null;
    const busId = url.searchParams.get('busId') || null;
    const driverId = url.searchParams.get('driverId') || null;
    const customerId = url.searchParams.get('customerId') || null;
    
    // Get query for search functionality
    const search = url.searchParams.get('search') || '';

    // Get model
    const Booking = await getBookingModel();
    
    // Build query
    const query: any = {};
    
    // Add filters if provided
    if (status) {
      query.status = status;
    }
    
    if (busId) {
      query.busId = busId;
    }
    
    if (driverId) {
      query.driverId = driverId;
    }
    
    if (customerId) {
      query.customerId = customerId;
    }
    
    // Add date range if provided
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    } else if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.endDate = { $lte: new Date(endDate) };
    }
    
    // Add search if provided
    if (search) {
      query.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { departureLocation: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total for pagination
    const total = await Booking.countDocuments(query);
    
    // Fetch bookings with pagination and sorting
    const bookings = await Booking.find(query)
      .sort({ [sort]: sort === 'startDate' ? -1 : 1 }) // Most recent bookings first by default
      .skip(skip)
      .limit(limit)
      // Populate related documents with only necessary fields
      .populate('busId', 'name licensePlate')
      .populate('driverId', 'firstName lastName')
      .populate({
        path: 'customerId',
        select: 'name firstName lastName companyName'
      });
    
    // Return data with pagination info
    return NextResponse.json({
      data: bookings,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit
      }
    });
  } catch (error) {
    console.error('Error fetching bookings from MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking data' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const data = await request.json();
    
    // Get model
    const Booking = await getBookingModel();
    
    // Create new booking
    const newBooking = await Booking.create(data);
    
    // Return the created booking
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking in MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' }, 
      { status: 500 }
    );
  }
}