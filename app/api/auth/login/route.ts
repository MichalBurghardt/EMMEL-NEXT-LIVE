/**
 * Login API Route
 * Handles user authentication and returns a JWT token
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await request.json();
    
    // Check if email and password are provided
    if (!email || !password) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Please provide email and password' 
        }, 
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Invalid credentials' 
        }, 
        { status: 401 }
      );
    }

    // Check if user account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Account is temporarily locked. Please try again later.' 
        },
        { status: 423 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Your account is inactive. Please contact support.' 
        }, 
        { status: 403 }
      );
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts on failed login
      await user.incrementLoginAttempts();
      
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Invalid credentials' 
        }, 
        { status: 401 }
      );
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Return user data and token
    return NextResponse.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'An error occurred while processing your request',
        error: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}