import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const CHANNELS_PATH = path.join(process.cwd(), 'src/data/channels.json');

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

function getChannels() {
  return JSON.parse(readFileSync(CHANNELS_PATH, 'utf-8')) as Record<string, unknown[]>;
}

function saveChannels(channels: Record<string, unknown[]>) {
  writeFileSync(CHANNELS_PATH, JSON.stringify(channels, null, 2), 'utf-8');
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const raw = getChannels();

    // Flatten to search for the channel
    const flat = Object.values(raw).flat() as Record<string, unknown>[];
    const idx = flat.findIndex((c) => c.id === params.id);

    if (idx === -1) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    flat[idx] = { ...flat[idx], ...body };

    // Re-group by country
    const grouped: Record<string, unknown[]> = {};
    for (const ch of flat) {
      const key = (ch.country as string) || 'Unknown';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ch);
    }
    saveChannels(grouped);

    return NextResponse.json(flat[idx]);
  } catch {
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const raw = getChannels();

    // Flatten, filter out the deleted channel, re-group
    const flat = Object.values(raw).flat() as Record<string, unknown>[];
    const filtered = flat.filter((c) => c.id !== params.id);

    if (filtered.length === flat.length) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Re-group by country
    const grouped: Record<string, unknown[]> = {};
    for (const ch of filtered) {
      const key = (ch.country as string) || 'Unknown';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ch);
    }
    saveChannels(grouped);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
  }
}
