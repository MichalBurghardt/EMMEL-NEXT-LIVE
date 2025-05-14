import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/utils/db';
import Bus from '@/models/Bus';
import ErrorResponse from '@/utils/api/errorResponse';

// Define JWT decoded token interface
interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// Helper function to verify token and get user
const getUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    throw ErrorResponse.unauthorized();
  }

  // Check if JWT secret is properly configured
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set');
    throw ErrorResponse.server('Server configuration error');
  }
  
  try {
    // Explicitly specify the algorithm for security
    const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as DecodedToken;
    return decoded;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ErrorResponse.unauthorized('Token abgelaufen. Bitte melden Sie sich erneut an.');
    } else if (err instanceof jwt.JsonWebTokenError) {
      throw ErrorResponse.unauthorized('Ungültiges Token. Bitte melden Sie sich erneut an.');
    } else {
      console.error('JWT verification error:', err);
      throw ErrorResponse.unauthorized('Authentifizierungsfehler. Bitte melden Sie sich erneut an.');
    }
  }
};

/**
 * GET /api/fleet/buses/:id
 * @desc    Get a single bus by ID
 * @access  Private (admin, dispatcher, manager)
 */
// @ts-ignore
export async function GET(request: any, context: any) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Verify user has permission
    const user = await getUser();
    const allowedRoles = ['admin', 'dispatcher', 'manager'];
    
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Keine Berechtigung für diese Aktion' },
        { status: 403 }
      );
    }
    
    // Get bus by ID
    const bus = await Bus.findById(context.params.id);
    
    // Check if bus exists
    if (!bus) {
      return NextResponse.json(
        { success: false, message: `Bus mit der ID ${context.params.id} nicht gefunden` },
        { status: 404 }
      );
    }
    
    // Get the bus data object
    const busObject = bus.toObject();
    
    // Map statuses for display without changing the original status
    let displayStatus: string = busObject.status;
    if (busObject.status === 'driving') displayStatus = 'in-use';
    if (busObject.status === 'repair') displayStatus = 'maintenance';
    if (busObject.status === 'outOfService') displayStatus = 'out-of-service';
    
    // Return data with additional displayStatus field
    return NextResponse.json({
      success: true,
      data: {
        ...busObject,
        model: busObject.model,
        displayStatus
      }
    });
    
  } catch (err) {
    console.error(`Error getting bus ${context.params.id}:`, err);
    const statusCode = err instanceof Error && 'statusCode' in err ? 
      (err.statusCode as number) : 500;
    return NextResponse.json(
      { 
        success: false, 
        message: err instanceof Error ? err.message : 'Beim Abrufen des Busses ist ein Fehler aufgetreten' 
      },
      { status: statusCode }
    );
  }
}

/**
 * PUT /api/fleet/buses/:id
 * @desc    Update a bus
 * @access  Private (admin, manager)
 */
// @ts-ignore
export async function PUT(request: any, context: any) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Verify user has permission
    const user = await getUser();
    const allowedRoles = ['admin', 'manager'];
    
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Keine Berechtigung für diese Aktion' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Find and update bus
    const bus = await Bus.findByIdAndUpdate(
      context.params.id,
      body,
      { new: true, runValidators: true }
    );
    
    // Check if bus exists
    if (!bus) {
      return NextResponse.json(
        { success: false, message: `Bus mit der ID ${context.params.id} nicht gefunden` },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Bus erfolgreich aktualisiert',
      data: bus
    });
    
  } catch (err) {
    console.error(`Error updating bus ${context.params.id}:`, err);
    
    // Define error type guard for validation errors
    const isValidationError = (error: unknown): error is { name: string; errors: Record<string, any> } => 
      typeof error === 'object' && 
      error !== null && 
      'name' in error && 
      error.name === 'ValidationError' &&
      'errors' in error;
      
    const statusCode = err instanceof Error && 'statusCode' in err ? 
      (err.statusCode as number) : 500;
    return NextResponse.json(
      { 
        success: false, 
        message: err instanceof Error ? err.message : 'Beim Aktualisieren des Busses ist ein Fehler aufgetreten',
        error: isValidationError(err) ? err.errors : undefined
      },
      { status: statusCode }
    );
  }
}

/**
 * DELETE /api/fleet/buses/:id
 * @desc    Delete a bus or set it to inactive
 * @access  Private (admin)
 */
// @ts-ignore
export async function DELETE(request: any, context: any) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Verify user has permission
    const user = await getUser();
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Keine Berechtigung für diese Aktion' },
        { status: 403 }
      );
    }
    
    // Get query parameters for hard delete option
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hardDelete') === 'true';
    
    let bus;
    
    if (hardDelete) {
      // Hard delete - remove from database
      bus = await Bus.findByIdAndDelete(context.params.id);
    } else {
      // Soft delete - set to inactive
      bus = await Bus.findByIdAndUpdate(
        context.params.id,
        { isActive: false },
        { new: true }
      );
    }
    
    // Check if bus exists
    if (!bus) {
      return NextResponse.json(
        { success: false, message: `Bus mit der ID ${context.params.id} nicht gefunden` },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: hardDelete 
        ? 'Bus erfolgreich gelöscht' 
        : 'Bus erfolgreich deaktiviert',
      data: {}
    });
    
  } catch (err) {
    console.error(`Error deleting bus ${context.params.id}:`, err);
    const statusCode = err instanceof Error && 'statusCode' in err ? 
      (err.statusCode as number) : 500;
    return NextResponse.json(
      { 
        success: false, 
        message: err instanceof Error ? err.message : 'Beim Löschen des Busses ist ein Fehler aufgetreten'
      },
      { status: statusCode }
    );
  }
}