import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";
import authService from "@/services/authService";
import IndividualCustomer from "@/models/IndividualCustomer";
import BusinessCustomer from "@/models/BusinessCustomer";

// Type definitions for customer data
interface ContactPerson {
  firstName: string;
  lastName: string;
  position: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

interface Address {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

interface BusinessCustomerData {
  companyName: string;
  organizationType: string;
  email: string;
  phone: string;
  vatNumber: string;
  address: Address;
  contactPersons: ContactPerson[];
}

interface IndividualCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
}

interface RegistrationError {
  message: string;
  field?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userData, customerData, customerType } = await req.json();

    // Connect to MongoDB
    await connectToDatabase();

    // Validate input data
    if (!userData || !userData.email || !userData.password) {
      return NextResponse.json({
        success: false,
        message: "Bitte füllen Sie alle erforderlichen Felder aus",
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits",
      }, { status: 400 });
    }

    // Create user with appropriate role based on customer type
    const role = customerType === 'business' ? 'business_customer' : 'individual_customer';
    
    // Ensure phone is always a string
    const userPhone: string = userData.phone || "";

    // Create new user
    const user = await User.create({
      ...userData,
      phone: userPhone,
      role,
    });

    // Create customer profile based on type
    try {
      if (customerType === 'business' && customerData) {
        const businessData = customerData as BusinessCustomerData;
        await BusinessCustomer.create({
          ...businessData,
          userId: user._id,
        });
      } else if (customerType === 'individual' && customerData) {
        const individualData = customerData as IndividualCustomerData;
        await IndividualCustomer.create({
          ...individualData,
          userId: user._id,
        });
      }
    } catch (error) {
      // If customer profile creation fails, delete the user to maintain consistency
      await User.findByIdAndDelete(user._id);
      
      // Log and return specific error
      console.error('Error creating customer profile:', error);
      
      const errorResponse: RegistrationError = {
        message: "Fehler beim Erstellen des Kundenprofils",
      };
      
      return NextResponse.json({
        success: false,
        error: errorResponse,
      }, { status: 500 });
    }

    // Generate authentication tokens
    const { token, refreshToken } = authService.generateTokens(user);

    // Create response with tokens
    const response = NextResponse.json({
      success: true,
      message: "Registrierung erfolgreich",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

    // Set auth cookies
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
    }, { status: 500 });
  }
}