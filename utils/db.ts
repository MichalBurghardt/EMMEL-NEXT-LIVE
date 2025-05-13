/**
 * Database Connection Utility
 * Handles MongoDB connection using Mongoose
 */

import mongoose from 'mongoose';

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

interface ConnectionState {
  isConnected: number;
}

/**
 * Global connection state
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */
const globalConnectionState: ConnectionState = { isConnected: 0 };

/**
 * Connect to MongoDB
 * Returns established connection or creates a new one
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (globalConnectionState.isConnected === 1) {
    console.log('Using existing database connection');
    return mongoose;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI as string, {
      // Set default max listeners to avoid memory leak warnings
      maxPoolSize: 10, // Keep connection pool not too big
    });

    globalConnectionState.isConnected = db.connection.readyState;
    console.log('New database connection established');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

/**
 * Disconnect from MongoDB
 * Used mainly for testing and when shutting down the app
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    if (globalConnectionState.isConnected === 0) {
      return;
    }

    await mongoose.disconnect();
    globalConnectionState.isConnected = 0;
    console.log('Database connection closed');
  } else {
    // In production, don't disconnect as connections are reused
    console.log('Keeping database connection alive in production');
  }
}

/**
 * Initialize models and database connection
 * Call this function when your application starts
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await connectToDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Create a database utility object before exporting
const dbUtils = { 
  connectToDatabase, 
  disconnectFromDatabase, 
  initializeDatabase 
};

export default dbUtils;