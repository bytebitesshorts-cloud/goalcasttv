import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store, Channel } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Check if channels already exist
    const existingCount = await Channel.countDocuments();
    if (existingCount > 0) {
      if (req.nextUrl.searchParams.get('force') !== 'true') {
        return NextResponse.json({ 
          status: 'exists', 
          count: existingCount, 
          message: 'Channels already exist. Use ?force=true to clear and re-migrate.' 
        });
      }
      await Channel.deleteMany({});
    }

    const channelsStore = await Store.findOne({ key: 'channels' });
    if (!channelsStore || !channelsStore.data) {
      return NextResponse.json({ message: 'No legacy channels found.' });
    }

    const raw = channelsStore.data;
    const toInsert = [];
    const seenIds = new Set();

    for (const [countryName, channels] of Object.entries(raw)) {
      if (!Array.isArray(channels)) continue;
      for (const ch of channels) {
        if (seenIds.has(ch.id)) continue;
        seenIds.add(ch.id);

        toInsert.push({
          id: ch.id || `ch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: ch.name || 'Unknown',
          code: ch.code || '',
          category: ch.category || 'Sports',
          country: countryName,
          countryCode: ch.countryCode || countryName.toLowerCase().replace(/\s+/g, '-'),
          logo: ch.logo || '',
          stream: ch.stream || '',
          embedCode: ch.embedCode || '',
          languages: Array.isArray(ch.languages) ? ch.languages : [],
          active: ch.active !== false,
          is_nsfw: ch.is_nsfw || false,
          quality: ch.quality || '',
        });
      }
    }

    if (toInsert.length === 0) {
      return NextResponse.json({ message: 'No channels found to migrate.' });
    }

    await Channel.insertMany(toInsert, { ordered: false }).catch(err => console.log('Some duplicates skipped', err));
    
    const finalCount = await Channel.countDocuments();

    return NextResponse.json({
      success: true,
      migrated: finalCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
