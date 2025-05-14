/**
 * API endpoint for trips
 * Retrieves trip data from MongoDB
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';

// Dynamically import model to prevent schema registration errors during hot reloads
async function getTripModel(): Promise<mongoose.Model<any>> {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Use existing model if it exists
    if (mongoose.models.Trip) {
      return mongoose.models.Trip;
    }
    
    // Import and create model if it doesn't exist
    const { default: Model } = await import('@/models/Trip');
    return Model;
  } catch (error) {
    console.error('Error loading Trip model:', error);
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
    
    // Get query for search functionality
    const search = url.searchParams.get('search') || '';

    // Get model
    const Trip = await getTripModel();
    
    // Build query
    const query: any = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
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
        { name: { $regex: search, $options: 'i' } },
        { tripNumber: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { departureLocation: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total for pagination
    const total = await Trip.countDocuments(query);
    
    // Fetch trips with pagination and sorting
    const trips = await Trip.find(query as mongoose.FilterQuery<any>)
      .sort({ [sort]: sort === 'startDate' ? -1 : 1 }) // Most recent trips first by default
      .skip(skip)
      .limit(limit)
      .populate('driverId busId'); // Populate related documents
    
    // Return data with pagination info
    return NextResponse.json({
      data: trips,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit
      }
    });
  } catch (error) {
    console.error('Error fetching trips from MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip data' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const data = await request.json();
    
    // Get model
    const Trip = await getTripModel();
    
    // Create new trip
    const newTrip = await Trip.create(data);
    
    // Return the created trip
    return NextResponse.json(newTrip, { status: 201 });
  } catch (error) {
    console.error('Error creating trip in MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' }, 
      { status: 500 }
    );
  }
}