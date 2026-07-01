import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';
import { sessionOptions, SessionData } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { username, password } = await req.json();
    
    const settingsStore = await Store.findOne({ key: 'settings' });
    const settings = settingsStore?.data || {};
    
    const expectedUsername = process.env.ADMIN_USERNAME || settings.adminUsername || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || settings.adminPassword || 'admin';

    if (username === expectedUsername && password === expectedPassword) {
      // Create encrypted iron-session
      const cookieStore = await cookies();
      const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
      session.isAdmin = true;
      session.username = username;
      await session.save();

      // Also set legacy cookie for backwards compatibility during migration
      const res = NextResponse.json({ success: true });
      res.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 8,
        path: '/',
      });
      return res;
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  // Destroy iron-session
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.destroy();

  // Also delete legacy cookie
  const res = NextResponse.json({ success: true });
  res.cookies.delete('admin_session');
  res.cookies.delete('goalcast_admin_session');
  return res;
}
