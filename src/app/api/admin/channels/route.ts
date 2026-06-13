import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const CHANNELS_PATH = path.join(process.cwd(), 'src/data/channels.json');

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

function getChannels() {
  return JSON.parse(readFileSync(CHANNELS_PATH, 'utf-8'));
}

function saveChannels(channels: Record<string, unknown[]>) {
  writeFileSync(CHANNELS_PATH, JSON.stringify(channels, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const channels = getChannels();
  // channels.json is an object keyed by country — flatten to a single array
  const flat = Object.values(channels).flat();
  return NextResponse.json(flat);
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const raw = getChannels() as Record<string, unknown[]>;

    const newChannel: Record<string, unknown> = {
      id: `ch_${Date.now()}`,
      name: body.name || '',
      code: body.code || '',
      category: body.category || 'Sports',
      country: body.country || 'Unknown',
      countryCode: body.countryCode || 'UN',
      logo: body.logo || '',
      stream: body.stream || '',
      languages: body.languages ? [body.languages] : [],
      active: body.active !== false,
      is_nsfw: false,
    };

    // raw is an object keyed by country — flatten, append, then re-save as object
    const flat = Object.values(raw).flat() as Record<string, unknown>[];
    flat.push(newChannel);

    // Re-group by country
    const grouped: Record<string, unknown[]> = {};
    for (const ch of flat) {
      const key = (ch.country as string) || 'Unknown';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ch);
    }
    saveChannels(grouped);

    return NextResponse.json(newChannel, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}
