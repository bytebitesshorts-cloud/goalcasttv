export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

// PUT update match
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const store = await Store.findOne({ key: 'app_matches' });
    if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const matches = (store.data || []) as Record<string, unknown>[];
    const idx = matches.findIndex((m) => m.id === params.id);
    if (idx === -1) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    matches[idx] = { ...matches[idx], ...body, id: params.id };
    store.data = matches;
    store.markModified('data');
    await store.save();

    return NextResponse.json(matches[idx]);
  } catch {
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
  }
}

// DELETE match
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const store = await Store.findOne({ key: 'app_matches' });
    if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const matches = (store.data || []) as Record<string, unknown>[];
    store.data = matches.filter((m) => m.id !== params.id);
    store.markModified('data');
    await store.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 });
  }
}
