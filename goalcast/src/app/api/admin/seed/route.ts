export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    await connectDB();

    const dataFiles = [
      { key: 'channels', file: 'channels.json' },
      { key: 'settings', file: 'settings.json' },
      { key: 'blog', file: 'blog.json' },
      { key: 'ticker', file: 'ticker.json' }
    ];

    const results = [];

    for (const { key, file } of dataFiles) {
      const filePath = path.join(process.cwd(), 'src/data', file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        await Store.findOneAndUpdate(
          { key },
          { data },
          { upsert: true, returnDocument: 'after' }
        );
        results.push({ key, status: 'Seeded successfully' });
      } else {
        results.push({ key, status: 'File not found' });
      }
    }

    return NextResponse.json({ message: 'Seeding completed', results });
  } catch (error: any) {
    console.error("SEED ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

