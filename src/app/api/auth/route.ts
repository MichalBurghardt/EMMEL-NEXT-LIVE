/**
 * Auth API Base Route
 * Provides information about available auth endpoints
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // This is a simple info endpoint that returns information about available auth endpoints
  return NextResponse.json({
    status: 'success',
    message: 'Emmel Reisen Auth API',
    endpoints: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      register: '/api/auth/register',
      me: '/api/auth/me',
      refresh: '/api/auth/refresh'
    },
    version: '1.0'
  });
}