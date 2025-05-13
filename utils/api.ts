import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Type for API error response
export interface ApiError {
  status: number;
  message: string;
  originalError: unknown;
}

// Type for file upload progress
export type ProgressCallback = (percentCompleted: number) => void;

// Define the JWT token structure
export interface DecodedToken {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Type for API route handler with Next.js App Router compatibility
export type ApiRouteHandler<T = unknown> = (
  req: NextRequest, 
  context: { params?: Record<string, string> },
  user?: DecodedToken | null
) => Promise<NextResponse<T>>;

// Function to determine the API base URL
const getBaseUrl = (): string => {
  // Check if we have an environment variable for the backend URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Check if we have an environment variable for the backend port
  const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || '3000';
  
  // In Next.js, we need to handle client vs. server side
  const isServer = typeof window === 'undefined';
  
  // When server-side, use direct backend URL
  if (isServer) {
    return `http://localhost:${backendPort}/api`;
  }
  
  // When client-side, use relative URL to leverage same-origin requests
  return '/api';
};

// Create axios instance with default settings
const api: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased to 30 seconds to handle slower connections
});

// Request interceptor - add token to every request
api.interceptors.request.use(
  (config) => {
    // Only run on client side where localStorage is available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - global error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    // Handle session expiration (401 Unauthorized)
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      // Check if we're not already on the login page
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    
    // Format error for easier handling
    const errorData: ApiError = {
      status: error.response?.status || 0,
      message: 
        error.response?.data && typeof error.response.data === 'object' && 'error' in error.response.data ? 
          String(error.response.data.error) : 
        error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data ? 
          String(error.response.data.message) : 
        error.message || 
        'Unbekannter Fehler',
      originalError: error
    };
    
    // Additional info for developers
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', errorData);
    }
    
    return Promise.reject(errorData);
  }
);

// Helper function to detect current backend port
const detectBackendPort = async (): Promise<number | null> => {
  // Only run on client side
  if (typeof window === 'undefined') return null;
  
  // Try default port
  try {
    const response = await axios.get(`/api/health`, { timeout: 5000 });
    if (response.status === 200) {
      console.log(`Backend connected successfully`);
      return 3000; // Using Next.js API routes
    }
  } catch {
    console.warn("Could not connect to backend, using fallback");
  }
  
  return null;
};

/**
 * Helper function to verify token and get user
 * Returns the decoded user or null if token verification fails
 */
export const getUser = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return null;
    }

    // Check if JWT secret is properly configured
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return null;
    }
    
    try {
      // Explicitly specify algorithm for security
      const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as DecodedToken;
      return decoded;
    } catch {
      // Token verification failed
      return null;
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    return null;
  }
};

/**
 * Auth wrapper for Next.js App Router route handlers
 * This is compatible with the App Router's expected parameter structure
 */
export const withAuth = <T = unknown>(
  handler: ApiRouteHandler<T>, 
  requireAuth = true
): ApiRouteHandler<T> => {
  return async (req: NextRequest, context: { params?: Record<string, string> }) => {
    const user = await getUser();
    
    if (requireAuth && !user) {
      return NextResponse.json(
        { error: 'Authentication required' } as unknown as T,
        { status: 401 }
      );
    }
    
    // Pass the context as second parameter and user as third parameter
    // This matches Next.js App Router's route handler parameter structure
    return handler(req, context, user);
  };
};

/**
 * Auth wrapper for Next.js App Router route handlers
 * This wrapper is compatible with the Next.js App Router's generated types
 */
export const withAppRouterAuth = (
  handler: (
    req: NextRequest,
    params: { params: Record<string, string> }
  ) => Promise<NextResponse>,
  requireAuth = true
) => {
  return async (
    req: NextRequest,
    params: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const user = await getUser();
    
    if (requireAuth && !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Store the user in request headers to pass it through
    // since we can't modify Next.js's type expectations
    const reqWithUser = new NextRequest(req.url, {
      headers: req.headers,
      method: req.method,
      body: req.body,
      signal: req.signal,
      cache: req.cache,
      credentials: req.credentials,
      integrity: req.integrity,
      keepalive: req.keepalive,
      mode: req.mode,
      redirect: req.redirect,
    });
    
    // Add user info to headers for the handler to extract
    reqWithUser.headers.set('x-user-data', user ? JSON.stringify(user) : '');
    
    // Call the handler with Next.js's expected parameter structure
    return handler(reqWithUser, params);
  };
};

// Helper function to extract user from request headers
export const getUserFromRequest = (req: NextRequest): DecodedToken | null => {
  const userData = req.headers.get('x-user-data');
  if (!userData) return null;
  try {
    return JSON.parse(userData) as DecodedToken;
  } catch {
    return null;
  }
};

// Helper functions for each type of HTTP request
export const apiService = {
  // GET request
  get: async <T>(url: string, params = {}): Promise<T> => {
    return api.get<T, T>(url, { params });
  },
  
  // Function to detect current backend port
  detectBackendPort,
  
  // POST request
  post: async <T>(url: string, data = {}, params = {}): Promise<T> => {
    return api.post<T, T>(url, data, { params });
  },
  
  // PUT request
  put: async <T>(url: string, data = {}, params = {}): Promise<T> => {
    return api.put<T, T>(url, data, { params });
  },
  
  // PATCH request
  patch: async <T>(url: string, data = {}, params = {}): Promise<T> => {
    return api.patch<T, T>(url, data, { params });
  },
  
  // DELETE request
  delete: async <T>(url: string, params = {}): Promise<T> => {
    return api.delete<T, T>(url, { params });
  },
  
  // File upload
  uploadFile: async <T>(url: string, file: File, onProgress: ProgressCallback | null = null): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    // Add progress tracking if callback provided
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        onProgress(percentCompleted);
      };
    }
    
    return api.post<T, T>(url, formData, config);
  },
  
  // File download
  downloadFile: async (url: string, filename: string): Promise<Blob> => {
    const response = await api.get(url, {
      responseType: 'blob',
      transformResponse: [(data) => data], // Prevent default transformation
    });
    
    // Create download link
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  }
};

// Export utilities
const apiUtils = {
  api,
  getUser,
  withAuth
};

export default apiUtils;