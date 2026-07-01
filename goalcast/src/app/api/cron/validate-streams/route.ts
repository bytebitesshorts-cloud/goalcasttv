import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Channel } from '@/lib/models/Channel';

export const dynamic = 'force-dynamic';

async function checkUrl(url: string, isStream: boolean): Promise<boolean> {
  if (!url) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: isStream ? 'GET' : 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    return res.ok || res.status < 400;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this header for cron jobs)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const channels = await Channel.find({ active: true });

    let deactivatedCount = 0;
    let clearedLogosCount = 0;
    const checkedCount = channels.length;

    const BATCH_SIZE = 20;
    for (let i = 0; i < channels.length; i += BATCH_SIZE) {
      const batch = channels.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (ch) => {
        const streamOk = await checkUrl(ch.stream, true);
        if (!streamOk) {
          ch.active = false;
          ch.lastValidatedStatus = 'broken';
          deactivatedCount++;
        } else {
          ch.lastValidatedStatus = 'ok';
        }

        if (ch.logo) {
          const logoOk = await checkUrl(ch.logo, false);
          if (!logoOk) {
            ch.logo = '';
            clearedLogosCount++;
          }
        }

        ch.lastValidated = new Date();
        await ch.save();
      }));
    }

    const message = `[CRON] Checked ${checkedCount} channels. Deactivated ${deactivatedCount}, cleared ${clearedLogosCount} logos.`;
    console.log(message);

    return NextResponse.json({
      success: true,
      checked: checkedCount,
      deactivated: deactivatedCount,
      clearedLogos: clearedLogosCount,
      message,
    });
  } catch (err: any) {
    console.error('[CRON] Validation failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
