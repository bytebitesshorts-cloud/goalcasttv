export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const store = await Store.findOne({ key: 'app_categories' });
    const categories = store?.data || ['All', 'Football', 'Cricket', 'Basketball', 'Tennis', 'Others'];
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
