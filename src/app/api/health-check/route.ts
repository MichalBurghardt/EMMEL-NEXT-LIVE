/**
 * API Health Check Endpoint
 * Used to verify that the API is functioning correctly
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';

export async function GET() {
  try {
    // Check database connection
    const mongoose = await connectToDatabase();
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get environment information
    const environment = process.env.NODE_ENV || 'development';
    const apiVersion = process.env.API_VERSION || '1.0.0';
    
    // Return health status
    return NextResponse.json({
      status: 'success',
      data: {
        service: 'Emmel Reisen API',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment,
        apiVersion,
        database: {
          status: dbStatus
        }
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Service is experiencing issues',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}