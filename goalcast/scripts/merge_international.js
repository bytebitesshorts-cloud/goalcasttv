const fs = require('fs');
const path = require('path');

const CHANNELS_FILE = path.join(__dirname, '../src/data/channels.json');

function mergeInternational() {
  console.log('Reading channels.json...');
  const data = JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf8'));

  const internationalSports = data['International Sports'] || [];
  const international = data['International'] || [];

  if (internationalSports.length === 0) {
    console.log('No "International Sports" channels found to merge. Exiting.');
    return;
  }

  console.log(`Found ${internationalSports.length} channels in "International Sports" and ${international.length} in "International". Merging...`);

  // Merge, ensure no duplicates by ID
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

  console.log(`Merged ${added} channels. "International" now has ${merged.length} channels. Saving...`);
  
  // Make a backup just in case
  fs.writeFileSync(CHANNELS_FILE + '.bak', JSON.stringify(data, null, 2));
  fs.writeFileSync(CHANNELS_FILE, JSON.stringify(data, null, 2));

  console.log('Done.');
}

mergeInternational();
