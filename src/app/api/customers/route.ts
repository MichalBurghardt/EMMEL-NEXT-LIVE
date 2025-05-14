import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';

// Dynamic import for models to avoid issues with NextJS
async function getModels() {
  await connectToDatabase();
  
  // Import models dynamically
  const IndividualCustomer = mongoose.models.IndividualCustomer || 
    (await import('@/models/IndividualCustomer')).default;
  
  const BusinessCustomer = mongoose.models.BusinessCustomer || 
    (await import('@/models/BusinessCustomer')).default;
    
  return { IndividualCustomer, BusinessCustomer };
}

export async function GET(request: NextRequest) {
  try {
    const { IndividualCustomer, BusinessCustomer } = await getModels();
    
    // Get the search params
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const id = searchParams.get('id');
    
    // If an ID is provided, return that specific customer
    if (id) {
      // Try to find in individual customers
      let customer = await IndividualCustomer.findById(id);
      
      // If not found in individual customers, try business customers
      if (!customer) {
        customer = await BusinessCustomer.findById(id);
      }
      
      if (!customer) {
        return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
      }
      
      return NextResponse.json(customer);
    }
    
    // If a search query is provided, filter customers
    if (query) {
      const searchRegex = new RegExp(query, 'i');
      
      // Search in both customer collections
      const individualCustomers = await IndividualCustomer.find({
        $or: [
          { firstName: { $regex: searchRegex } },
          { lastName: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { 'address.city': { $regex: searchRegex } }
        ]
      });
      
      const businessCustomers = await BusinessCustomer.find({
        $or: [
          { companyName: { $regex: searchRegex } },
          { contactPerson: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { 'address.city': { $regex: searchRegex } }
        ]
      });
      
      // Combine the results
      const allCustomers = [...individualCustomers, ...businessCustomers];
      return NextResponse.json(allCustomers);
    }
    
    // Otherwise return all customers (with pagination to avoid large responses)
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    const individualCustomers = await IndividualCustomer.find()
      .limit(limit)
      .skip(skip);
    
    const businessCustomers = await BusinessCustomer.find()
      .limit(limit)
      .skip(skip);
    
    const allCustomers = [...individualCustomers, ...businessCustomers];
    return NextResponse.json(allCustomers);
  } catch (error) {
    console.error('Error in customers API:', error);
    return NextResponse.json(
      { message: 'Database error occurred', error: (error as Error).message }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json();
    const { IndividualCustomer, BusinessCustomer } = await getModels();
    
    let newCustomer;
    
    // Determine which type of customer to create
    if (customerData.type === 'individual') {
      // Create individual customer
      newCustomer = new IndividualCustomer(customerData);
    } else if (customerData.type === 'business') {
      // Create business customer
      newCustomer = new BusinessCustomer(customerData);
    } else {
      return NextResponse.json({ 
        message: 'Customer type is required and must be "individual" or "business"' 
      }, { status: 400 });
    }
    
    // Save the new customer
    await newCustomer.save();
    
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ 
        message: 'Validation error', 
        errors: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      message: 'Error creating customer', 
      error: (error as Error).message 
    }, { status: 500 });
  }
}