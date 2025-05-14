import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';
import { getUser } from '@/utils/api';

// Helper function to get BusinessCustomer model dynamically
async function getBusinessCustomerModel() {
  await connectToDatabase();
  return mongoose.models.BusinessCustomer || 
    (await import('@/models/BusinessCustomer')).default;
}

// Helper function to check if ID is valid
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// Auth check middleware function
async function checkAuth() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  return null; // No error, continue
}

// @ts-ignore
export async function GET(request: any, context: any) {
  // Check authentication first
  const authError = await checkAuth();
  if (authError) return authError;
  
  try {
    const id = context.params.id;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    const BusinessCustomer = await getBusinessCustomerModel();
    
    const customer = await BusinessCustomer.findById(id);
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Business customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching business customer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch business customer';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// @ts-ignore
export async function PUT(request: any, context: any) {
  // Check authentication first
  const authError = await checkAuth();
  if (authError) return authError;
  
  try {
    const id = context.params.id;
    const body = await request.json();

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    const BusinessCustomer = await getBusinessCustomerModel();
    
    const customer = await BusinessCustomer.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Business customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error updating business customer:', error);
    
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const errors: Record<string, string> = {};
      
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors },
        { status: 400 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to update business customer';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// @ts-ignore
export async function DELETE(request: any, context: any) {
  // Check authentication first
  const authError = await checkAuth();
  if (authError) return authError;
  
  try {
    const id = context.params.id;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    const BusinessCustomer = await getBusinessCustomerModel();
    
    const customer = await BusinessCustomer.findByIdAndDelete(id);
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Business customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Business customer deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting business customer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete business customer';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}