import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'src/data/settings.json');

function getSettings() {
  return JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const settings = getSettings();
    const expectedUsername = settings.adminUsername || 'admin';

    if (username === expectedUsername && password === settings.adminPassword) {
      const res = NextResponse.json({ success: true });
      res.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/',
      });
      return res;
    }

    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('admin_session');
  return res;
}
