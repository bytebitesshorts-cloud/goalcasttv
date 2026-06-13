import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

export const dynamic = 'force-dynamic';

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    await connectDB();
    
    const channelsStore = await Store.findOne({ key: 'channels' });
    const raw = (channelsStore?.data || {}) as Record<string, any[]>;

    let foundCountry = '';
    let foundIdx = -1;

    for (const [countryName, channels] of Object.entries(raw)) {
      const idx = channels.findIndex((c) => c.id === params.id);
      if (idx !== -1) {
        foundCountry = countryName;
        foundIdx = idx;
        break;
      }
    }

    if (foundIdx === -1) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const oldChannel = raw[foundCountry][foundIdx];
    const newCountry = body.country || foundCountry;
    
    // Merge but strip out country/countryCode to avoid data duplication in the DB
    const updatedChannel = { ...oldChannel, ...body };
    delete updatedChannel.country;
    delete updatedChannel.countryCode;

    if (newCountry !== foundCountry) {
      // Move to new country array
      raw[foundCountry].splice(foundIdx, 1);
      if (!raw[newCountry]) raw[newCountry] = [];
      raw[newCountry].push(updatedChannel);
      
      if (raw[foundCountry].length === 0) delete raw[foundCountry];
    } else {
      raw[foundCountry][foundIdx] = updatedChannel;
    }

    await Store.findOneAndUpdate(
      { key: 'channels' },
      { data: raw },
      { upsert: true }
    );

    return NextResponse.json({ ...updatedChannel, country: newCountry });
  } catch {
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const channelsStore = await Store.findOne({ key: 'channels' });
    const raw = (channelsStore?.data || {}) as Record<string, any[]>;

    let foundCountry = '';
    let foundIdx = -1;

    for (const [countryName, channels] of Object.entries(raw)) {
      const idx = channels.findIndex((c) => c.id === params.id);
      if (idx !== -1) {
        foundCountry = countryName;
        foundIdx = idx;
        break;
      }
    }

    if (foundIdx === -1) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    raw[foundCountry].splice(foundIdx, 1);
    if (raw[foundCountry].length === 0) delete raw[foundCountry];

    await Store.findOneAndUpdate(
      { key: 'channels' },
      { data: raw },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
  }
}
