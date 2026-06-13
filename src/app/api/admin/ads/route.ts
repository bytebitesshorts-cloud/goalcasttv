import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const adsStore = await Store.findOne({ key: 'ads' });
    const adsConfig = adsStore?.data || {
      enabled: false,
      type: 'custom', // 'custom' | 'adsense'
      customHtml: '',
      adsenseClientId: '',
      adsenseSlotId: '',
    };

    return NextResponse.json(adsConfig);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ad config' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    
    const adsStore = await Store.findOne({ key: 'ads' });
    const currentAds = adsStore?.data || {};

    const updated = {
      ...currentAds,
      ...(body.enabled !== undefined && { enabled: body.enabled }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.customHtml !== undefined && { customHtml: body.customHtml }),
      ...(body.adsenseClientId !== undefined && { adsenseClientId: body.adsenseClientId }),
      ...(body.adsenseSlotId !== undefined && { adsenseSlotId: body.adsenseSlotId }),
    };

    await Store.findOneAndUpdate(
      { key: 'ads' },
      { data: updated },
      { upsert: true }
    );

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ad config' }, { status: 500 });
  }
}
