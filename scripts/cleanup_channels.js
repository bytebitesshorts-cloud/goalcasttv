// cleanup_channels.js — Run with: node scripts/cleanup_channels.js
// Removes all channels NOT in "Sports" or "FIFA 2026" from MongoDB

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not found in .env.local');
  process.exit(1);
}

const KEEP_CATEGORIES = new Set(['sports', 'fifa 2026']);

const StoreSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: mongoose.Schema.Types.Mixed,
  slider: { type: Array, default: [] },
});
const Store = mongoose.model('Store', StoreSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connected to MongoDB\n');

  const channelsStore = await Store.findOne({ key: 'channels' });
  if (!channelsStore) {
    console.log('⚠️  No channels store found. Nothing to clean.');
    await mongoose.disconnect();
    return;
  }

  const raw = channelsStore.data || {};
  let totalBefore = 0;
  let totalAfter = 0;
  let countriesDropped = 0;
  const filtered = {};

  for (const [country, channels] of Object.entries(raw)) {
    if (!Array.isArray(channels)) continue;
    totalBefore += channels.length;

    const kept = channels.filter(ch => {
      const cat = (ch.category || '').toLowerCase().trim();
      return KEEP_CATEGORIES.has(cat);
    });

    totalAfter += kept.length;
    if (kept.length > 0) {
      filtered[country] = kept;
    } else {
      countriesDropped++;
    }
  }

  channelsStore.data = filtered;
  channelsStore.markModified('data');
  await channelsStore.save();

  console.log('🧹  Cleanup complete!');
  console.log(`   Channels before : ${totalBefore}`);
  console.log(`   Channels kept   : ${totalAfter}`);
  console.log(`   Channels removed: ${totalBefore - totalAfter}`);
  console.log(`   Countries dropped (empty after filter): ${countriesDropped}`);

  await mongoose.disconnect();
  console.log('\n✅  Done. Database updated.');
}

run().catch(err => {
  console.error('❌  Cleanup failed:', err.message);
  process.exit(1);
});
