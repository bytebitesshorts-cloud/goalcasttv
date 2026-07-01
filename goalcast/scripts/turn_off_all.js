const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env.local');
let uri = '';
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/MONGODB_URI=(.*)/);
  if (match) {
    uri = match[1].trim();
  }
}

async function run() {
  const mongoose = require('mongoose');
  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB');

  const Store = mongoose.models.Store ||
    mongoose.model('Store', new mongoose.Schema({
      key: { type: String, required: true, unique: true },
      data: mongoose.Schema.Types.Mixed,
      slider: { type: Array, default: [] },
    }));

  const channelsStore = await Store.findOne({ key: 'channels' });
  if (!channelsStore) {
    console.log('⚠️  No channels store found in DB.');
    await mongoose.disconnect();
    return;
  }

  const raw = channelsStore.data || {};
  let count = 0;
  for (const [country, channels] of Object.entries(raw)) {
    if (!Array.isArray(channels)) continue;
    for (const ch of channels) {
      if (ch.active !== false) {
        ch.active = false;
        count++;
      }
    }
  }

  channelsStore.markModified('data');
  await channelsStore.save();
  console.log(`✅ Turned off ${count} channels.`);
  
  await mongoose.disconnect();
}

run();
