import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Trip from '@/models/Trip';
import mongoose from 'mongoose';

// GET a trip by ID
export async function GET(request: Request, context: any) {
  try {
    await connectToDatabase();

    const tripId: string = context.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return NextResponse.json(
        { error: 'Invalid trip ID format' },
        { status: 400 }
      );
    }

    const trip = await Trip.findById(tripId)
      .populate('assignedBus')
      .populate('assignedDriver')
      .populate({
        path: 'assignedBookings',
        populate: {
          path: 'customer'
        }
      });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trip);
  } catch (error: unknown) {
    console.error(`Error fetching trip: ${error}`);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

// PUT update a trip
// @ts-ignore
export async function PUT(request: Request, context: any) {
  try {
    await connectToDatabase();

    const tripId: string = context.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return NextResponse.json(
        { error: 'Invalid trip ID format' },
        { status: 400 }
      );
    }

    const tripData: Record<string, any> = await request.json();

    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { $set: tripData },
      { new: true, runValidators: true }
    );

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trip);
  } catch (error: unknown) {
    console.error(`Error updating trip: ${error}`);
    return NextResponse.json(
      { error: 'Failed to update trip', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE a trip
// @ts-ignore
export async function DELETE(request: Request, context: any) {
  try {
    await connectToDatabase();

    const tripId: string = context.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return NextResponse.json(
        { error: 'Invalid trip ID format' },
        { status: 400 }
      );
    }

    // Check if trip has any bookings that are not cancelled
    const trip = await Trip.findById(tripId).populate('assignedBookings');
    
    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }
    
    // If there are active bookings, don't allow deletion - just mark as inactive
    if (trip.assignedBookings && trip.assignedBookings.length > 0) {
      trip.isActive = false;
      trip.status = 'CANCELLED';
      await trip.save();
      
      return NextResponse.json({ 
        message: 'Trip has existing bookings. Marked as inactive instead of deleting.',
        trip 
      });
    }

    // Otherwise, proceed with actual deletion
    const deletedTrip = await Trip.findByIdAndDelete(tripId);

    if (!deletedTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Trip successfully deleted',
      deleted: true,
      trip: deletedTrip
    });
  } catch (error: unknown) {
    console.error(`Error deleting trip: ${error}`);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}