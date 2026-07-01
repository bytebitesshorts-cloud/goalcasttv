/**
 * migrate-channels.cjs
 * 
 * One-time migration: copies channels from the legacy Store document
 * (key: 'channels') into the new Channel collection.
 * 
 * The old Store document is NOT deleted — it stays as a backup.
 * 
 * Usage:
 *   node scripts/migrate-channels.cjs
 */

const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
let MONGODB_URI = '';
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/MONGODB_URI=(.*)/);
  if (match) MONGODB_URI = match[1].trim();
}
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function run() {
  const mongoose = require('mongoose');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Define Store schema (legacy)
  const StoreSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    data: mongoose.Schema.Types.Mixed,
    slider: { type: Array, default: [] },
  });
  const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);

  // Define Channel schema (new)
  const ChannelSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    code: { type: String, default: '' },
    category: { type: String, default: 'Sports', index: true },
    country: { type: String, required: true, index: true },
    countryCode: { type: String, default: '' },
    logo: { type: String, default: '' },
    stream: { type: String, default: '' },
    embedCode: { type: String, default: '' },
    languages: { type: [String], default: [] },
    active: { type: Boolean, default: true, index: true },
    is_nsfw: { type: Boolean, default: false },
    quality: { type: String, default: '' },
    lastValidated: { type: Date, default: null },
    lastValidatedStatus: { type: String, enum: ['ok', 'broken', null], default: null },
  }, { timestamps: true });
  const Channel = mongoose.models.Channel || mongoose.model('Channel', ChannelSchema);

  // Check if channels already exist
  const existingCount = await Channel.countDocuments();
  if (existingCount > 0) {
    console.log(`⚠️  Channel collection already has ${existingCount} documents.`);
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise((resolve) => {
      rl.question('   Do you want to DROP existing channels and re-migrate? (yes/no): ', resolve);
    });
    rl.close();
    if (answer !== 'yes') {
      console.log('   Aborted. No changes made.');
      await mongoose.disconnect();
      return;
    }
    await Channel.deleteMany({});
    console.log('   Cleared existing Channel collection.');
  }

  // Read from legacy Store
  const channelsStore = await Store.findOne({ key: 'channels' });
  if (!channelsStore || !channelsStore.data) {
    console.log('⚠️  No legacy channels found in Store. Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  const raw = channelsStore.data;
  const toInsert = [];
  const seenIds = new Set();

  for (const [countryName, channels] of Object.entries(raw)) {
    if (!Array.isArray(channels)) continue;
    for (const ch of channels) {
      // Skip duplicates by ID
      if (seenIds.has(ch.id)) continue;
      seenIds.add(ch.id);

      toInsert.push({
        id: ch.id || `ch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: ch.name || 'Unknown',
        code: ch.code || '',
        category: ch.category || 'Sports',
        country: countryName,
        countryCode: ch.countryCode || countryName.toLowerCase().replace(/\s+/g, '-'),
        logo: ch.logo || '',
        stream: ch.stream || '',
        embedCode: ch.embedCode || '',
        languages: Array.isArray(ch.languages) ? ch.languages : [],
        active: ch.active !== false,
        is_nsfw: ch.is_nsfw || false,
        quality: ch.quality || '',
      });
    }
  }

  if (toInsert.length === 0) {
    console.log('⚠️  No channels found to migrate.');
    await mongoose.disconnect();
    return;
  }

  // Insert in batches
  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    await Channel.insertMany(batch, { ordered: false }).catch((err) => {
      // Some may fail due to duplicates — that's OK
      console.log(`   Batch ${i / BATCH + 1}: ${err.insertedDocs?.length || 0} inserted (some duplicates skipped)`);
    });
    inserted += batch.length;
    console.log(`   Migrated ${Math.min(inserted, toInsert.length)} / ${toInsert.length}`);
  }

  const finalCount = await Channel.countDocuments();
  console.log('');
  console.log('🎉 Migration complete!');
  console.log(`   Total channels migrated: ${finalCount}`);
  console.log(`   Legacy Store document preserved (key: "channels")`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
