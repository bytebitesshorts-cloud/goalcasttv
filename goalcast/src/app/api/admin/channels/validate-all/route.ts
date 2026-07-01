import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Channel } from '@/lib/models/Channel';
import { isAuthenticated } from '@/lib/session';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';



async function checkUrl(url: string, isStream: boolean): Promise<boolean> {
  if (!url) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: isStream ? 'GET' : 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    return res.ok || res.status < 400;
  } catch (err) {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const channels = await Channel.find({ active: true });

    let deactivatedCount = 0;
    let clearedLogosCount = 0;
    const checkedCount = channels.length;

    // Process in batches of 20
    const BATCH_SIZE = 20;
    for (let i = 0; i < channels.length; i += BATCH_SIZE) {
      const batch = channels.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (ch) => {
        let changed = false;

        // Check stream
        const streamOk = await checkUrl(ch.stream, true);
        if (!streamOk) {
          ch.active = false;
          ch.lastValidatedStatus = 'broken';
          deactivatedCount++;
          changed = true;
        } else {
          ch.lastValidatedStatus = 'ok';
          changed = true;
        }

        // Check logo
        if (ch.logo) {
          const logoOk = await checkUrl(ch.logo, false);
          if (!logoOk) {
            ch.logo = '';
            clearedLogosCount++;
            changed = true;
          }
        }

        ch.lastValidated = new Date();
        if (changed) await ch.save();
      }));
    }

    if (deactivatedCount > 0 || clearedLogosCount > 0) {
      revalidateTag('channels');
    }

    return NextResponse.json({
      success: true,
      checked: checkedCount,
      deactivated: deactivatedCount,
      clearedLogos: clearedLogosCount,
      message: `Checked ${checkedCount} channels. Deactivated ${deactivatedCount} broken streams and cleared ${clearedLogosCount} broken logos.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
