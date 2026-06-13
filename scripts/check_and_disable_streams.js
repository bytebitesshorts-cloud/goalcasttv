const fs = require('fs');
const path = require('path');

const CHANNELS_PATH = path.join(__dirname, '../src/data/channels.json');
const BACKUP_PATH = path.join(__dirname, '../src/data/channels.backup.json');

async function testStream(url) {
  if (!url) return false;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 4000); // 4-second timeout

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(id);
    // Standard M3U8 stream checks. Usually 200 OK means the stream is active.
    return res.status === 200;
  } catch (err) {
    clearTimeout(id);
    return false;
  }
}

async function run() {
  if (!fs.existsSync(CHANNELS_PATH)) {
    console.error('channels.json not found!');
    return;
  }

  // Backup original file
  fs.copyFileSync(CHANNELS_PATH, BACKUP_PATH);
  console.log(`Backup created at: ${BACKUP_PATH}`);

  const data = JSON.parse(fs.readFileSync(CHANNELS_PATH, 'utf-8'));
  const countries = Object.keys(data);
  let checked = 0;
  let disabledCount = 0;
  let activeCount = 0;

  // Flatten channels to test them
  const allChannels = [];
  for (const country of countries) {
    for (const channel of data[country]) {
      allChannels.push({ country, channel });
    }
  }

  console.log(`Starting checks for ${allChannels.length} channels...`);

  // Concurrency helper
  const CONCURRENCY = 15;
  const queue = [...allChannels];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const { country, channel } = item;

      const isWorking = await testStream(channel.stream);
      checked++;

      if (isWorking) {
        channel.active = true;
        activeCount++;
      } else {
        channel.active = false;
        disabledCount++;
        console.log(`[OFFLINE] ${channel.name} (${country}) - URL: ${channel.stream}`);
      }

      if (checked % 20 === 0 || checked === allChannels.length) {
        console.log(`Progress: ${checked}/${allChannels.length} checked (${activeCount} active, ${disabledCount} disabled)`);
      }
    }
  }

  // Run workers concurrently
  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  // Write updated data back
  fs.writeFileSync(CHANNELS_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\nFinished checking streams.`);
  console.log(`Total checked: ${checked}`);
  console.log(`Active (Online): ${activeCount}`);
  console.log(`Disabled (Offline): ${disabledCount}`);
  console.log(`Updated database saved to: ${CHANNELS_PATH}`);
}

run().catch(console.error);
