export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

// Public API — used by the GoalCast Android app to get live matches
export async function GET() {
  try {
    await connectDB();
    const store = await Store.findOne({ key: 'app_matches' });
    const matches = (store?.data || []) as Record<string, unknown>[];
    // Only return active/live matches
    return NextResponse.json(matches, {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
