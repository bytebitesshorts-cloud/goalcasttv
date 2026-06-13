export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await connectDB();
    const channelsStore = await Store.findOne({ key: 'channels' });
    const raw = channelsStore?.data || {};
    
    // Inject country name into each channel object since it's stored implicitly via grouping
    const flat = Object.entries(raw).flatMap(([countryName, channels]: [string, any]) => {
      return channels.map((ch: any) => ({
        ...ch,
        country: countryName,
        countryCode: ch.countryCode || countryName.toLowerCase().replace(/\s+/g, '-'),
      }));
    });
    
    return NextResponse.json(flat);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    
    const channelsStore = await Store.findOne({ key: 'channels' });
    const raw = (channelsStore?.data || {}) as Record<string, unknown[]>;

    const newChannel: Record<string, unknown> = {
      id: `ch_${Date.now()}`,
      name: body.name || '',
      code: body.code || '',
      category: body.category || 'Sports',
      logo: body.logo || '',
      stream: body.stream || '',
      languages: body.languages ? [body.languages] : [],
      active: body.active !== false,
      is_nsfw: false,
    };

    const targetCountry = body.country || 'Unknown';
    if (!raw[targetCountry]) raw[targetCountry] = [];
    raw[targetCountry].push(newChannel);

    await Store.findOneAndUpdate(
      { key: 'channels' },
      { data: raw },
      { upsert: true }
    );

    return NextResponse.json({ ...newChannel, country: targetCountry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}

