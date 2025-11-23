// Middleware to verify CSRF token in API routes
// lib/with-csrf.ts

import { NextResponse } from 'next/server';
import { getCsrfTokenFromRequest, verifyCsrfToken } from './csrf';

type ApiHandler = (request: Request, context?: unknown) => Promise<Response>;

/**
 * Wrapper to add CSRF protection to API routes
 * Usage: export const POST = withCsrf(async (request) => { ... });
 */
export function withCsrf(handler: ApiHandler): ApiHandler {
    return async (request: Request, context?: unknown) => {
        const method = request.method.toUpperCase();

        // Skip CSRF check for safe methods
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            return handler(request, context);
        }

        // Get CSRF token from request header
        const csrfToken = getCsrfTokenFromRequest(request);

        // Verify CSRF token
        const isValid = await verifyCsrfToken(csrfToken);

        if (!isValid) {
            return new NextResponse(
                JSON.stringify({ error: 'Invalid CSRF token' }),
                {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Token is valid, proceed with the request
        return handler(request, context);
    };
}