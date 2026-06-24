export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

// GET all matches
export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const store = await Store.findOne({ key: 'app_matches' });
    return NextResponse.json(store?.data || []);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

// POST create match
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const store = await Store.findOne({ key: 'app_matches' });
    const matches: object[] = store?.data || [];

    const newMatch = {
      id: `match_${Date.now()}`,
      title: body.title || '',
      sport: body.sport || 'Football',
      league: body.league || '',
      isTemporary: !!body.isTemporary,
      endsAt: body.endsAt || '',
      teamA: body.teamA || { name: '', logo: '' },
      teamB: body.teamB || { name: '', logo: '' },
      thumbnail: body.thumbnail || '',
      isLive: body.isLive !== false,
      streams: body.streams || [],
      createdAt: new Date().toISOString(),
    };

    matches.unshift(newMatch);

    if (store) {
      store.data = matches;
      store.markModified('data');
      await store.save();
    } else {
      await Store.create({ key: 'app_matches', data: matches });
    }

    return NextResponse.json(newMatch, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
  }
}
