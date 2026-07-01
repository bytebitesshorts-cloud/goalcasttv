import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface SessionData {
  isAdmin: boolean;
  username: string;
}

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'default-secret-change-me-in-production-32chars!';

export const sessionOptions: SessionOptions = {
  password: SESSION_SECRET,
  cookieName: 'goalcast_admin_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  },
};

/**
 * Get the current session from cookies (for use in Server Components / Route Handlers)
 */
export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

/**
 * Check if the current request is from an authenticated admin.
 * Works with both the new iron-session AND the legacy plain cookie for backwards compatibility.
 */
export async function isAuthenticated(req: NextRequest): Promise<boolean> {
  // Try iron-session first
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    if (session.isAdmin) return true;
  } catch {
    // iron-session not available or failed — fall through
  }

  // Legacy fallback: check for old-style cookie
  if (req.cookies.get('admin_session')?.value === 'authenticated') {
    return true;
  }

  return false;
}
