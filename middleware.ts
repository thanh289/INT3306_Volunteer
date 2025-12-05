// Global CSRF Protection Middleware
// middleware.ts (root level)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

function getCsrfTokenFromRequest(request: NextRequest): string | null {
    return request.headers.get(CSRF_HEADER_NAME);
}

function getCsrfTokenFromCookie(request: NextRequest): string | null {
    return request.cookies.get(CSRF_COOKIE_NAME)?.value || null;
}

async function hashToken(token: string): Promise<string> {
    // Use Web Crypto API (available in Edge Runtime)
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyCsrfToken(submittedToken: string | null, cookieToken: string | null): Promise<boolean> {
    if (!submittedToken || !cookieToken) return false;

    // cookie stores hashed token, so we need to hash submitted token and compare
    const hashedSubmitted = await hashToken(submittedToken);
    return hashedSubmitted === cookieToken;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const method = request.method.toUpperCase();

    // Skip CSRF for:
    //  Non-API routes
    //  GET/HEAD/OPTIONS methods
    //  NextAuth routes (they have their own CSRF)
    //  CSRF token endpoint itself
    if (
        !pathname.startsWith('/api') ||
        ['GET', 'HEAD', 'OPTIONS'].includes(method) ||
        pathname.startsWith('/api/auth') ||
        pathname === '/api/csrf-token'
    ) {
        return NextResponse.next();
    }

    // Verify CSRF token for state-changing requests
    const submittedToken = getCsrfTokenFromRequest(request);
    const cookieToken = getCsrfTokenFromCookie(request);

    if (!verifyCsrfToken(submittedToken, cookieToken)) {
        console.warn(`CSRF validation failed for ${method} ${pathname}`);
        return new NextResponse(
            JSON.stringify({
                error: 'Invalid or missing CSRF token',
                message: 'Your session may have expired. Please refresh the page and try again.'
            }),
            {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    // CSRF token valid, proceed
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',
    ],
};