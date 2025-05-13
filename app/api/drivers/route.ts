/**
 * API endpoint for drivers
 * Retrieves driver data from MongoDB
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';

// Dynamically import model to prevent schema registration errors during hot reloads
import { Model } from 'mongoose';

// Type for the model's return value
async function getDriverModel(): Promise<Model<any>> {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Use existing model if it exists
    if (mongoose.models.Driver) {
      return mongoose.models.Driver;
    }
    
    // Import and create model if it doesn't exist
    const { default: Model } = await import('@/models/Driver');
    return Model;
  } catch (error) {
    console.error('Error loading Driver model:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    // Get the URL object to parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const sort = url.searchParams.get('sort') || 'lastName';
    const status = url.searchParams.get('status') || null;
    const isActive = url.searchParams.get('isActive') !== 'false'; // Default to active drivers
    
    // Get query for search functionality
    const search = url.searchParams.get('search') || '';

    // Get model
    const Driver = await getDriverModel();
    
    // Build query
    const query: any = { isActive };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add search if provided
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { driverLicenseNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total for pagination
    const total = await Driver.countDocuments(query);
    
    // Fetch drivers with pagination and sorting
    const drivers = await Driver.find(query)
      .sort({ [sort]: 1 })
      .skip(skip)
      .limit(limit);
    
    // Return data with pagination info
    return NextResponse.json({
      data: drivers,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit
      }
    });
  } catch (error) {
    console.error('Error fetching drivers from MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver data' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const data = await request.json();
    
    // Get model
    const Driver = await getDriverModel();
    
    // Create new driver
    const newDriver = await Driver.create(data);
    
    // Return the created driver
    return NextResponse.json(newDriver, { status: 201 });
  } catch (error) {
    console.error('Error creating driver in MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to create driver' }, 
      { status: 500 }
    );
  }
}