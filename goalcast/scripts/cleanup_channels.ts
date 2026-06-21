/**
 * cleanup_channels.ts
 * One-time script: deletes all channels NOT in "Sports" or "FIFA 2026" categories from MongoDB.
 *
 * Usage (from the goalcast/ directory):
 *   npx ts-node --project tsconfig.json -e "require('./scripts/cleanup_channels')"
 *   OR: node -r dotenv/config -e "require('./scripts/cleanup_channels.js')"
 *
 * Simpler (runs cleanup_channels.js below which uses require syntax):
 *   node scripts/cleanup_channels.mjs
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not found in .env.local');
  process.exit(1);
}

const KEEP_CATEGORIES = new Set(['sports', 'fifa 2026']);

async function run() {
  // Dynamic import to avoid ESM/CJS conflicts
  const mongoose = await import('mongoose');
  await mongoose.default.connect(MONGODB_URI as string);
  console.log('✅  Connected to MongoDB');

  const Store = mongoose.default.models.Store ||
    mongoose.default.model('Store', new mongoose.default.Schema({
      key: { type: String, required: true, unique: true },
      data: mongoose.default.Schema.Types.Mixed,
      slider: { type: Array, default: [] },
    }));

  const channelsStore = await Store.findOne({ key: 'channels' });
  if (!channelsStore) {
    console.log('⚠️  No channels store found in DB. Nothing to clean up.');
    await mongoose.default.disconnect();
    return;
  }

  const raw = (channelsStore.data || {}) as Record<string, any[]>;

  let totalBefore = 0;
  let totalAfter = 0;
  let countriesRemoved = 0;
  const filtered: Record<string, any[]> = {};

  for (const [country, channels] of Object.entries(raw)) {
    if (!Array.isArray(channels)) continue;
    totalBefore += channels.length;

    const kept = channels.filter((ch: any) => {
      const cat = (ch.category || '').toLowerCase().trim();
      return KEEP_CATEGORIES.has(cat);
    });

    totalAfter += kept.length;

    if (kept.length > 0) {
      filtered[country] = kept;
    } else {
      countriesRemoved++;
    }
  }

  channelsStore.data = filtered;
  channelsStore.markModified('data');
  await channelsStore.save();

  console.log('');
  console.log('🧹  Cleanup complete!');
  console.log(`   Channels before : ${totalBefore}`);
  console.log(`   Channels after  : ${totalAfter}`);
  console.log(`   Removed         : ${totalBefore - totalAfter}`);
  console.log(`   Countries dropped (empty after filter): ${countriesRemoved}`);
  console.log('');

  await mongoose.default.disconnect();
}

run().catch((err) => {
  console.error('❌  Cleanup failed:', err);
  process.exit(1);
});
