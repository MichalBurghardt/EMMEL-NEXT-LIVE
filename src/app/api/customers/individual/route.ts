/**
 * API endpoint for individual customers
 * Retrieves individual customer data from MongoDB
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';

// Dynamically import model to prevent schema registration errors during hot reloads
async function getIndividualCustomerModel(): Promise<mongoose.Model<any>> {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Use existing model if it exists
    if (mongoose.models.IndividualCustomer) {
      return mongoose.models.IndividualCustomer;
    }
    
    // Import and create model if it doesn't exist
    const { default: Model } = await import('@/models/IndividualCustomer');
    return Model;
  } catch (error) {
    console.error('Error loading IndividualCustomer model:', error);
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
    const isActive = url.searchParams.get('isActive') !== 'false'; // Default to active customers
    
    // Get query for search functionality
    const search = url.searchParams.get('search') || '';

    // Get model
    const IndividualCustomer = await getIndividualCustomerModel();
    
    // Build query
    const query: any = { isActive };
    
    // Add search if provided
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total for pagination
    const total = await IndividualCustomer.countDocuments(query);
    
    // Fetch customers with pagination and sorting
    const customers = await IndividualCustomer.find(query)
      .sort({ [sort]: 1 })
      .skip(skip)
      .limit(limit);
    
    // Return data with pagination info
    return NextResponse.json({
      data: customers,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit
      }
    });
  } catch (error) {
    console.error('Error fetching individual customers from MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch individual customer data' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const data = await request.json();
    
    // Get model
    const IndividualCustomer = await getIndividualCustomerModel();
    
    // Create new customer
    const newCustomer = await IndividualCustomer.create(data);
    
    // Return the created customer
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Error creating individual customer in MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to create individual customer' }, 
      { status: 500 }
    );
  }
}