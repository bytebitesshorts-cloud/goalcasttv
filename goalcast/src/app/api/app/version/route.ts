export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const settingsStore = await Store.findOne({ key: 'settings' });
    const settings = settingsStore?.data || {};

    return NextResponse.json({
      versionCode: Number(settings.appVersionCode) || 1,
      versionName: settings.appVersionName || '1.0.0',
      apkUrl: settings.appApkUrl || '',
      releaseNotes: settings.appReleaseNotes || '',
      forceUpdate: !!settings.appForceUpdate,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch version info' }, { status: 500 });
  }
}
