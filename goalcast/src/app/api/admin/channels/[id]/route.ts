import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Channel } from '@/lib/models/Channel';
import { isAuthenticated } from '@/lib/session';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';



export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    await connectDB();

    const channel = await Channel.findOne({ id: params.id });
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Update fields
    const updatableFields = ['name', 'code', 'category', 'country', 'countryCode', 'logo', 'stream', 'embedCode', 'languages', 'active', 'quality'];
    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        (channel as any)[field] = body[field];
      }
    }

    await channel.save();
    revalidateTag('channels');

    return NextResponse.json({
      id: channel.id,
      name: channel.name,
      code: channel.code,
      category: channel.category,
      country: channel.country,
      countryCode: channel.countryCode,
      logo: channel.logo,
      stream: channel.stream,
      embedCode: channel.embedCode,
      languages: channel.languages,
      active: channel.active,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const result = await Channel.findOneAndDelete({ id: params.id });

    if (!result) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    revalidateTag('channels');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
  }
}
