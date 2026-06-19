import { NextRequest, NextResponse } from 'next/server';
import { getChannel } from '@/lib/search';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const channel = await getChannel(params.id);
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    return NextResponse.json(channel);
  } catch (error) {
    console.error('Channel fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch channel' }, { status: 500 });
  }
}
