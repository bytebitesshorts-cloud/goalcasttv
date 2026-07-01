import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  const mongoose = await import('mongoose');
  await mongoose.default.connect(MONGODB_URI);
  console.log('✅  Connected to MongoDB');

  const Store = mongoose.default.models.Store ||
    mongoose.default.model('Store', new mongoose.default.Schema({
      key: { type: String, required: true, unique: true },
      data: mongoose.default.Schema.Types.Mixed,
      slider: { type: Array, default: [] },
    }));

  const channelsStore = await Store.findOne({ key: 'channels' });
  if (!channelsStore) {
    console.log('⚠️  No channels store found in DB.');
    await mongoose.default.disconnect();
    return;
  }

  const raw = channelsStore.data || {};
  let count = 0;
  for (const [country, channels] of Object.entries(raw)) {
    if (!Array.isArray(channels)) continue;
    for (const ch of channels) {
      if (count < 2) {
        console.log("Sample channel:", ch);
        count++;
      }
      if (ch.nowPlaying || ch.now_playing || ch.isPlaying) {
          console.log("Playing channel:", ch.name, ch.nowPlaying, ch.now_playing, ch.isPlaying);
      }
    }
  }

  await mongoose.default.disconnect();
}

run();
