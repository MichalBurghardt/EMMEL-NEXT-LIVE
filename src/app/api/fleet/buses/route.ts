/**
 * API endpoint for fleet/buses
 * Retrieves bus data from MongoDB
 */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import BusModel from '@/models/Bus';

export async function GET() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Fetch all buses from the database
    // Populate could be added if needed for related data
    const buses = await BusModel.find({ isActive: true }).sort({ name: 1 });
    
    // Return the bus data
    return NextResponse.json(buses, { status: 200 });
  } catch (error) {
    console.error('Error fetching buses from MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus data' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Parse request body
    const data = await request.json();
    
    // Create new bus
    const newBus = await BusModel.create(data);
    
    // Return the created bus
    return NextResponse.json(newBus, { status: 201 });
  } catch (error) {
    console.error('Error creating bus in MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to create bus' }, 
      { status: 500 }
    );
  }
}