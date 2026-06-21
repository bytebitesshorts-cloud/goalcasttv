export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

// Public API — used by the GoalCast Android app to get app config (ads etc)
export async function GET() {
  try {
    await connectDB();
    const store = await Store.findOne({ key: 'app_config' });
    const config = store?.data || {
      adEnabled: false,
      adWebUrl: '',
      adDuration: 15,
      appName: 'Goal Cast',
      baseUrl: 'https://goalcast-tv.vercel.app',
    };
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}
