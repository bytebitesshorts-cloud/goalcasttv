import connectDB from '@/lib/db';
import { Store } from '@/lib/models';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  const store = await Store.findOne({ key: 'slider' });
  return new Response(JSON.stringify({ slides: store?.slider || [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const { slides } = await req.json();
  if (!Array.isArray(slides)) {
    return new Response(JSON.stringify({ error: 'Invalid slides array' }), { status: 400 });
  }
  await Store.findOneAndUpdate({ key: 'slider' }, { slider: slides }, { upsert: true, new: true });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
