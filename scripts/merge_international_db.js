const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
});
const mongoose = require('mongoose');

async function mergeInternationalDB() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const StoreSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  });

  const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);

  const channelsStore = await Store.findOne({ key: 'channels' });
  if (!channelsStore) {
    console.log('No channels in DB');
    process.exit(0);
  }

  const data = channelsStore.data;
  const internationalSports = data['International Sports'] || [];
  const international = data['International'] || [];

  if (internationalSports.length === 0) {
    console.log('No "International Sports" channels found to merge. Exiting.');
    process.exit(0);
  }

  console.log(`Found ${internationalSports.length} channels in "International Sports" and ${international.length} in "International". Merging...`);

  const merged = [...international];
  const existingIds = new Set(international.map(ch => ch.id));

  let added = 0;
  for (const ch of internationalSports) {
    if (!existingIds.has(ch.id)) {
      merged.push(ch);
      existingIds.add(ch.id);
      added++;
    }
  }

  data['International'] = merged;
  delete data['International Sports'];

  channelsStore.markModified('data');
  await channelsStore.save();

  console.log(`Merged ${added} channels. "International" now has ${merged.length} channels. Saved to DB.`);
  process.exit(0);
}

mergeInternationalDB().catch(console.error);
