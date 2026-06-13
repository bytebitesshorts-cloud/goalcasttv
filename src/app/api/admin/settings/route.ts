export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const settingsStore = await Store.findOne({ key: 'settings' });
    const settings = settingsStore?.data || {};

    if (!isAuthenticated(req)) {
      return NextResponse.json({
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    
    const settingsStore = await Store.findOne({ key: 'settings' });
    const settings = settingsStore?.data || {};

    const updated = {
      ...settings,
      ...(body.maintenanceMode !== undefined && { maintenanceMode: body.maintenanceMode }),
      ...(body.maintenanceMessage !== undefined && { maintenanceMessage: body.maintenanceMessage }),
      ...(body.adminPassword !== undefined && { adminPassword: body.adminPassword }),
      ...(body.adminUsername !== undefined && { adminUsername: body.adminUsername }),
    };

    await Store.findOneAndUpdate(
      { key: 'settings' },
      { data: updated },
      { upsert: true }
    );

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

