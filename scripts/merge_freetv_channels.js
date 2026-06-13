const fs = require('fs');
const path = require('path');

const existingPath = path.join(__dirname, '..', 'src', 'data', 'channels.json');
const newChannelsPath = path.join(__dirname, 'freetv_sports_extracted.json');

if (!fs.existsSync(newChannelsPath)) {
  console.error('freetv_sports_extracted.json does not exist. Run fetch_freetv_sports.js first.');
  process.exit(1);
}

const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
const newChannels = JSON.parse(fs.readFileSync(newChannelsPath, 'utf8'));

let mergedCount = 0;
let skippedCount = 0;

for (const [countryName, channelsList] of Object.entries(newChannels)) {
  if (!existing[countryName]) {
    existing[countryName] = [];
  }

  const existingChannels = existing[countryName];
  const existingIds = new Set(existingChannels.map(c => c.id));
  const existingStreams = new Set(existingChannels.map(c => c.stream.toLowerCase()));
  const existingNames = new Set(existingChannels.map(c => c.name.toLowerCase()));

  for (const ch of channelsList) {
    // Deduplicate by stream URL, name, or ID
    if (existingIds.has(ch.id) || existingStreams.has(ch.stream.toLowerCase()) || existingNames.has(ch.name.toLowerCase())) {
      skippedCount++;
      continue;
    }

    existingChannels.push(ch);
    mergedCount++;
  }
}

// Clean empty or redundant countries
for (const country of Object.keys(existing)) {
  if (existing[country].length === 0) {
    delete existing[country];
  }
}

// Sort country names alphabetically (A-Z)
const sorted = {};
for (const key of Object.keys(existing).sort()) {
  sorted[key] = existing[key];
}

fs.writeFileSync(
  existingPath,
  JSON.stringify(sorted, null, 2) + '\n',
  'utf8'
);

console.log(`✅ Merged ${mergedCount} new sports channels into channels.json.`);
console.log(`ℹ️ Skipped ${skippedCount} duplicate channels.`);
console.log(`Total channels now: ${Object.values(sorted).flat().length} across ${Object.keys(sorted).length} countries.`);
