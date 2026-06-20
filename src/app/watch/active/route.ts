import { NextResponse } from 'next/server';
import { getAllChannels } from '@/lib/search';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Ensure it doesn't cache and always fetches the latest active channel

export async function GET() {
  const channels = await getAllChannels();
  
  // Find the first active channel
  // `getAllChannels` already filters by `ch.active !== false`, but we ensure we grab a valid one
  const activeChannel = channels.find(ch => ch.active !== false);

  if (activeChannel) {
    return NextResponse.redirect(new URL(`/watch/${activeChannel.id}`, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }

  // Fallback if no active channel is found
  return NextResponse.redirect(new URL('/category/sports', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
