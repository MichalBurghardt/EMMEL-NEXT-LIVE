/**
 * API endpoint for business customers
 * Retrieves business customer data from MongoDB
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';

// Dynamically import model to prevent schema registration errors during hot reloads
async function getBusinessCustomerModel(): Promise<mongoose.Model<any>> {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Use existing model if it exists
    if (mongoose.models.BusinessCustomer) {
      return mongoose.models.BusinessCustomer;
    }
    
    // Import and create model if it doesn't exist
    const { default: Model } = await import('@/models/BusinessCustomer');
    return Model;
  } catch (error) {
    console.error('Error loading BusinessCustomer model:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    // Get the URL object to parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const sort = url.searchParams.get('sort') || 'name';
    const isActive = url.searchParams.get('isActive') !== 'false'; // Default to active customers
    
    // Get query for search functionality
    const search = url.searchParams.get('search') || '';

    // Get model
    const BusinessCustomer = await getBusinessCustomerModel();
    
    // Build query
    const query: any = { isActive };
    
    // Add search if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
        { taxId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total for pagination
    const total = await BusinessCustomer.countDocuments(query);
    
    // Fetch customers with pagination and sorting
    const customers = await BusinessCustomer.find(query)
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
    console.error('Error fetching business customers from MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business customer data' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const data = await request.json();
    
    // Get model
    const BusinessCustomer = await getBusinessCustomerModel();
    
    // Create new business customer
    const newCustomer = await BusinessCustomer.create(data as any);
    
    // Return the created customer
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Error creating business customer in MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to create business customer' }, 
      { status: 500 }
    );
  }
}