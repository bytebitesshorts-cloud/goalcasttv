import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Channel } from '@/lib/models/Channel';
import { isAuthenticated } from '@/lib/session';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';



export async function POST(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const result = await Channel.updateMany(
      { active: true },
      { $set: { active: false } }
    );

    revalidateTag('channels');

    return NextResponse.json({
      success: true,
      turnedOff: result.modifiedCount,
      message: `Successfully turned off ${result.modifiedCount} active channel(s).`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
