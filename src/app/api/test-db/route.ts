import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Try to connect to the database
    await connectToDatabase();
    
    // Check if we're actually connected
    const isConnected = mongoose.connection.readyState === 1;
    
    // Get database info for debugging
    const dbInfo = {
      connected: isConnected,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      connectionString: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/mongodb:\/\/(.*):(.*)@/, 'mongodb://***:***@') : 
        'Not set'
    };
    
    return NextResponse.json({
      success: isConnected,
      message: isConnected ? 'Connected to MongoDB' : 'Not connected to MongoDB',
      dbInfo
    });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Error connecting to MongoDB',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}