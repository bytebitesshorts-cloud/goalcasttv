import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

export const dynamic = 'force-dynamic';

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

const KEEP_CATEGORIES = new Set(['sports', 'fifa 2026']);

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
    let totalBefore = 0;
    let totalAfter = 0;
    let countriesDropped = 0;
    const filtered: Record<string, any[]> = {};

    for (const [country, channels] of Object.entries(raw)) {
      if (!Array.isArray(channels)) continue;
      totalBefore += channels.length;

      const kept = channels.filter((ch: any) => {
        const cat = (ch.category || '').toLowerCase().trim();
        return KEEP_CATEGORIES.has(cat);
      });

      totalAfter += kept.length;
      if (kept.length > 0) {
        filtered[country] = kept;
      } else {
        countriesDropped++;
      }
    }

    channelsStore.data = filtered;
    channelsStore.markModified('data');
    await channelsStore.save();

    return NextResponse.json({
      success: true,
      before: totalBefore,
      after: totalAfter,
      removed: totalBefore - totalAfter,
      countriesDropped,
      message: `Cleanup complete! Removed ${totalBefore - totalAfter} channels. Kept ${totalAfter} Sports/FIFA 2026 channels.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const channelsStore = await Store.findOne({ key: 'channels' });
    const raw = (channelsStore?.data || {}) as Record<string, any[]>;

    const stats: Record<string, number> = {};
    let total = 0;

    for (const channels of Object.values(raw)) {
      if (!Array.isArray(channels)) continue;
      for (const ch of channels) {
        const cat = ch.category || 'Unknown';
        stats[cat] = (stats[cat] || 0) + 1;
        total++;
      }
    }

    return NextResponse.json({ total, byCategory: stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
