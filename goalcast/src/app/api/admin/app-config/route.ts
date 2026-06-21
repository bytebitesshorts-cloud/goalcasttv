export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const store = await Store.findOne({ key: 'app_config' });
    const config = {
      adEnabled: body.adEnabled ?? false,
      adImageUrl: body.adImageUrl || '',
      adLinkUrl: body.adLinkUrl || '',
      adDuration: body.adDuration || 15,
      appName: 'GoalCast',
      baseUrl: 'https://goalcast-tv.vercel.app',
    };
    if (store) {
      store.data = config;
      store.markModified('data');
      await store.save();
    } else {
      await Store.create({ key: 'app_config', data: config });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
