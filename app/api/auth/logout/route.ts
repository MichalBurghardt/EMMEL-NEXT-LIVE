import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Remove the authentication token cookie
    cookieStore.delete('token');

    return NextResponse.json({
      success: true,
      message: 'Erfolgreich abgemeldet',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}