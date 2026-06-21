import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

export const dynamic = 'force-dynamic';

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

// GET: Public — fetch page content (falls back to empty object if not set)
export async function GET(
  _req: NextRequest,
  { params }: { params: { pageKey: string } }
) {
  try {
    await connectDB();
    const record = await Store.findOne({ key: params.pageKey });
    return NextResponse.json(record?.data ?? {});
  } catch {
    return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 });
  }
}

// PUT: Admin only — save page content
export async function PUT(
  req: NextRequest,
  { params }: { params: { pageKey: string } }
) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();
    await Store.findOneAndUpdate(
      { key: params.pageKey },
      { data: body },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save page content' }, { status: 500 });
  }
}
