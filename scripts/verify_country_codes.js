const fs = require('fs');
const path = require('path');

const CHANNELS_PATH = path.join(__dirname, '../src/data/channels.json');

function run() {
  const data = JSON.parse(fs.readFileSync(CHANNELS_PATH, 'utf-8'));
  const entries = Object.entries(data);

  console.log("Country list in database:");
  for (const [country, list] of entries) {
    const codes = new Set(list.map(c => c.countryCode));
    console.log(`- ${country}: codes in use: ${Array.from(codes).join(', ')}`);
  }
}

run();
