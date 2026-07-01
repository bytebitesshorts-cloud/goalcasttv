const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  const mongoose = require('mongoose');
  await mongoose.connect(MONGODB_URI);
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
      if (count < 2) {
        console.log("Sample channel:", ch);
        count++;
      }
      if (ch.nowPlaying || ch.now_playing || ch.isPlaying) {
          console.log("Playing channel:", ch.name, ch.nowPlaying, ch.now_playing, ch.isPlaying);
      }
    }
  }

  await mongoose.disconnect();
}

run();
