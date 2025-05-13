import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Logger do śledzenia załadowanych plików
const logFileRequest = (pathname: string) => {
    // Pomijamy żądania API i wewnętrzne pliki Next.js
    if (!pathname.startsWith('/api/') && 
        !pathname.startsWith('/_next/') && 
        !pathname.includes('favicon.ico')) {
        
        const logMessage = `[${new Date().toISOString()}] Requested: ${pathname}\n`;
        
        // W środowisku deweloperskim zapisujemy do konsoli
        if (process.env.NODE_ENV === 'development') {
            console.log('\x1b[36m%s\x1b[0m', `[NextJS] ${logMessage.trim()}`);
        }
    }
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Logujemy żądanie pliku
    logFileRequest(pathname);
    
    // Add security headers to all responses
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Authentication check for protected routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        // Get the auth token from cookies
        const token = request.cookies.get('auth-token')?.value;
        
        // If no token or token is invalid, redirect to login
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
    
    return response;
}

// Configure which paths this middleware will run on
export const config = {
    matcher: [
        // Apply to all paths except static files, api routes, etc.
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};