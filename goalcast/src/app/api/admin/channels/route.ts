export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Channel } from '@/lib/models/Channel';
import { isAuthenticated } from '@/lib/session';
import { revalidateTag } from 'next/cache';



export async function GET(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await connectDB();
    const channels = await Channel.find({}).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json(channels.map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      code: ch.code || '',
      category: ch.category || 'Sports',
      country: ch.country,
      countryCode: ch.countryCode || '',
      logo: ch.logo || '',
      stream: ch.stream || '',
      embedCode: ch.embedCode || '',
      languages: ch.languages || [],
      active: ch.active !== false,
      quality: ch.quality || '',
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();

    const newChannel = await Channel.create({
      id: `ch_${Date.now()}`,
      name: body.name || '',
      code: body.code || '',
      category: body.category || 'Sports',
      country: body.country || 'Unknown',
      countryCode: body.countryCode || '',
      logo: body.logo || '',
      stream: body.stream || '',
      embedCode: body.embedCode || '',
      languages: body.languages ? [body.languages] : [],
      active: body.active !== false,
      is_nsfw: false,
    });

    revalidateTag('channels');

    return NextResponse.json({
      id: newChannel.id,
      name: newChannel.name,
      code: newChannel.code,
      category: newChannel.category,
      country: newChannel.country,
      countryCode: newChannel.countryCode,
      logo: newChannel.logo,
      stream: newChannel.stream,
      embedCode: newChannel.embedCode,
      languages: newChannel.languages,
      active: newChannel.active,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}
