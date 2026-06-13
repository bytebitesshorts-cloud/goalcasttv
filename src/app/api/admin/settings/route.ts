import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'src/data/settings.json');

function isAuthenticated(req: NextRequest) {
  return req.cookies.get('admin_session')?.value === 'authenticated';
}

function getSettings() {
  return JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
}

function saveSettings(settings: unknown) {
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  // Public — maintenance mode needs to be readable without auth
  const settings = getSettings();
  // Only expose safe fields publicly
  if (!isAuthenticated(req)) {
    return NextResponse.json({
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
    });
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const settings = getSettings();

    const updated = {
      ...settings,
      ...(body.maintenanceMode !== undefined && { maintenanceMode: body.maintenanceMode }),
      ...(body.maintenanceMessage !== undefined && { maintenanceMessage: body.maintenanceMessage }),
      ...(body.adminPassword !== undefined && { adminPassword: body.adminPassword }),
      ...(body.adminUsername !== undefined && { adminUsername: body.adminUsername }),
    };

    saveSettings(updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
