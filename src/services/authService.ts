import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import User, { IUser } from '@/models/User';
import { connectToDatabase } from '@/utils/db';

// Define a more explicit type for JWT options to avoid using 'any'
interface JwtOptions {
  expiresIn: string | number;
  algorithm: string;
}

interface AuthTokenPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

/**
 * Get current authenticated user from token
 */
export const getCurrentUser = async (req: NextRequest) => {
  const token = req.cookies.get('token')?.value || '';
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as AuthTokenPayload;
    
    // Connect to MongoDB
    await connectToDatabase();

    // Get user excluding password
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null; // Return null instead of undefined when there's an error
  }
};

/**
 * Generate JWT token and refresh token
 */
export const generateTokens = (user: IUser) => {
  // Get JWT secret from environment variables
  const jwtSecret = process.env.JWT_SECRET || '';
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  // Initialize token version if needed
  const tokenVersion = user.tokenVersion || 0;

  // Token signing options with explicit interface
  const accessTokenOptions: JwtOptions = {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    algorithm: 'HS256'
  };

  // Create access token with enhanced payload
  const token = jwt.sign(
    { 
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    accessTokenOptions as jwt.SignOptions
  );

  // Refresh token options with explicit interface
  const refreshTokenOptions: JwtOptions = {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
    algorithm: 'HS256'
  };

  // Create refresh token with longer expiration
  const refreshToken = jwt.sign(
    {
      userId: user._id,
      tokenVersion: tokenVersion,
    },
    jwtSecret,
    refreshTokenOptions as jwt.SignOptions
  );

  return { token, refreshToken };
};

/**
 * Set auth cookies in response
 */
export const setAuthCookies = (token: string, refreshToken: string) => {
  // Calculate cookie max ages in seconds
  const tokenMaxAge = parseInt(process.env.JWT_COOKIE_EXPIRE || '7') * 24 * 60 * 60;
  const refreshTokenMaxAge = parseInt(process.env.JWT_REFRESH_EXPIRE || '30') * 24 * 60 * 60;
  
  const response = NextResponse.next();
  
  // Set access token cookie
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: tokenMaxAge,
    path: '/',
  });

  // Set refresh token cookie
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: refreshTokenMaxAge,
    path: '/',
  });
  
  return response;
};

/**
 * Refresh the access token using the refresh token
 */
export const refreshAccessToken = async (req: NextRequest) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return null;
    }
    
    // Get JWT secret
    const jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, jwtSecret) as RefreshTokenPayload;
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Find the user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return null;
    }
    
    // Check if token version matches to prevent refresh token reuse after logout
    const tokenVersion = user.tokenVersion || 0;
    if (decoded.tokenVersion !== tokenVersion) {
      return null;
    }
    
    // Generate new tokens
    const tokens = generateTokens(user);
    
    // Remove password from response - create a new object without the password
    const userObj = user.toObject();
    const userObjWithoutPassword = Object.fromEntries(
      Object.entries(userObj).filter(([key]) => key !== 'password')
    );
    
    return { tokens, user: userObjWithoutPassword };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

/**
 * Clear auth cookies
 */
export const clearAuthCookies = () => {
  const response = NextResponse.next();
  response.cookies.delete('token');
  response.cookies.delete('refreshToken');
  return response;
};

/**
 * Verify JWT token
 */
export const verifyToken = async (token: string) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const secretKey = new TextEncoder().encode(jwtSecret);
    await jwtVerify(token, secretKey);
    return true;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

/**
 * Middleware to protect API routes
 */
export const withAuth = async (req: NextRequest) => {
  try {
    // Get token from cookies
    const token = req.cookies.get('token')?.value;

    if (!token) {
      // If no token, try to refresh
      const refreshResult = await refreshAccessToken(req);
      
      if (!refreshResult) {
        // If refresh failed, return unauthorized
        return NextResponse.json(
          { message: 'Unauthorized - No token provided' },
          { status: 401 }
        );
      }
      
      // Set new cookies on the response
      const response = NextResponse.next();
      
      // Calculate cookie max ages in seconds
      const tokenMaxAge = parseInt(process.env.JWT_COOKIE_EXPIRE || '7') * 24 * 60 * 60;
      const refreshTokenMaxAge = parseInt(process.env.JWT_REFRESH_EXPIRE || '30') * 24 * 60 * 60;
      
      response.cookies.set('token', refreshResult.tokens.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: tokenMaxAge,
        path: '/',
      });
      
      response.cookies.set('refreshToken', refreshResult.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: refreshTokenMaxAge,
        path: '/',
      });
      
      // Continue with request - token has been refreshed
      return response;
    }
    
    // Verify token
    const isValid = await verifyToken(token);
    
    if (!isValid) {
      // If token is invalid, try to refresh
      const refreshResult = await refreshAccessToken(req);
      
      if (!refreshResult) {
        // If refresh failed, return unauthorized
        return NextResponse.json(
          { message: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      }
      
      // Set new cookies on the response
      const response = NextResponse.next();
      
      // Calculate cookie max ages in seconds
      const tokenMaxAge = parseInt(process.env.JWT_COOKIE_EXPIRE || '7') * 24 * 60 * 60;
      const refreshTokenMaxAge = parseInt(process.env.JWT_REFRESH_EXPIRE || '30') * 24 * 60 * 60;
      
      response.cookies.set('token', refreshResult.tokens.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: tokenMaxAge,
        path: '/',
      });
      
      response.cookies.set('refreshToken', refreshResult.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: refreshTokenMaxAge,
        path: '/',
      });
      
      return response;
    }
    
    // Token is valid, continue with request
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
};

// Create object before export to fix the warning
const authService = {
  getCurrentUser,
  generateTokens,
  setAuthCookies,
  refreshAccessToken,
  clearAuthCookies,
  verifyToken,
  withAuth,
};

export default authService;