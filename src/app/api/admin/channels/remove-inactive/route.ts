import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

export const dynamic = 'force-dynamic';

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const channelsStore = await Store.findOne({ key: 'channels' });

    if (!channelsStore) {
      return NextResponse.json({ error: 'No channels store found' }, { status: 404 });
    }

    const raw = (channelsStore.data || {}) as Record<string, any[]>;
    let totalRemoved = 0;
    const filtered: Record<string, any[]> = {};

    for (const [country, channels] of Object.entries(raw)) {
      if (!Array.isArray(channels)) continue;
      
      const activeChannels = channels.filter(ch => ch.active !== false);
      const removedCount = channels.length - activeChannels.length;
      totalRemoved += removedCount;

      if (activeChannels.length > 0) {
        filtered[country] = activeChannels;
      }
    }

    channelsStore.data = filtered;
    channelsStore.markModified('data');
    await channelsStore.save();

    return NextResponse.json({
      success: true,
      removed: totalRemoved,
      message: `Successfully removed ${totalRemoved} inactive channel(s).`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
