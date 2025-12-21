// CSRF protection
// lib/csrf.ts

import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash a CSRF token for storage
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Set CSRF token in cookie (server-side)
 */
export async function setCsrfToken(): Promise<string> {
  const token = generateCsrfToken();
  const hashedToken = hashToken(token);

  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, hashedToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token; // Return unhashed token to send to client
}

/**
 * Verify CSRF token (server-side)
 */
export async function verifyCsrfToken(token: string | null): Promise<boolean> {
  if (!token) return false;

  const cookieStore = await cookies();
  const storedHashedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!storedHashedToken) return false;

  const hashedSubmittedToken = hashToken(token);

  return storedHashedToken === hashedSubmittedToken;
}

/**
 * Get CSRF token from request headers
 */
export function getCsrfTokenFromRequest(request: Request): string | null {
  return request.headers.get(CSRF_HEADER_NAME);
}

/**
 * Client-side: Get CSRF token from cookie
 */
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export const CSRF_CONFIG = {
  COOKIE_NAME: CSRF_COOKIE_NAME,
  HEADER_NAME: CSRF_HEADER_NAME,
};
