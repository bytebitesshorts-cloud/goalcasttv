const fs = require('fs');
const path = require('path');
const https = require('https');

const CHANNELS_FILE = path.join(__dirname, '../src/data/channels.json');
const M3U_URL = 'https://gist.githubusercontent.com/sefatanam/b73998c6626b3c993e52370e9dbb78f6/raw';

function fetchM3U(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseM3U(m3u) {
  const lines = m3u.split('\n');
  const channels = [];
  let currentChannel = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      // Extract tvg-name and tvg-logo
      const nameMatch = line.match(/tvg-name="([^"]+)"/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const parts = line.split(',');
      const fallbackName = parts.length > 1 ? parts[parts.length - 1] : 'Unknown';

      currentChannel = {
        name: nameMatch ? nameMatch[1] : fallbackName,
        logo: logoMatch ? logoMatch[1] : 'https://placehold.co/400x400/18181b/ffffff?text=TV',
      };
    } else if (line && !line.startsWith('#')) {
      if (currentChannel.name) {
        currentChannel.stream = line;
        
        const id = currentChannel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        channels.push({
          id: id,
          name: currentChannel.name,
          logo: currentChannel.logo,
          stream: currentChannel.stream,
          category: 'sports', // per user request
          country: 'Bangladesh',
          countryCode: 'bd',
          quality: 'HD'
        });
        currentChannel = {};
      }
    }
  }
  return channels;
}

async function updateChannels() {
  console.log('Fetching M3U...');
  const m3uData = await fetchM3U(M3U_URL);
  
  console.log('Parsing M3U...');
  const newChannels = parseM3U(m3uData);
  console.log(`Found ${newChannels.length} new channels from gist.`);

  console.log('Reading channels.json...');
  const data = JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf-8'));
  
  // Add new channels to Bangladesh
  if (!data['Bangladesh']) {
    data['Bangladesh'] = [];
  }

  // Avoid exact duplicates by URL
  const existingUrls = new Set();
  Object.values(data).forEach(countryChannels => {
    countryChannels.forEach(c => existingUrls.add(c.stream));
  });

  let addedCount = 0;
  for (const nc of newChannels) {
    if (!existingUrls.has(nc.stream)) {
      data['Bangladesh'].push(nc);
      addedCount++;
    }
  }
  console.log(`Added ${addedCount} new unique channels.`);

  // Assign codes and ensure logos
  let codeIndex = 1;
  Object.keys(data).forEach(country => {
    data[country].forEach(channel => {
      // Assign sequential code
      channel.code = `CH-${String(codeIndex).padStart(4, '0')}`;
      codeIndex++;

      // Ensure fallback logo
      if (!channel.logo) {
        channel.logo = 'https://placehold.co/400x400/18181b/ffffff?text=TV';
      }
    });
  });

  console.log(`Assigned codes to ${codeIndex - 1} channels.`);

  fs.writeFileSync(CHANNELS_FILE, JSON.stringify(data, null, 2));
  console.log('Successfully updated channels.json');
}

updateChannels().catch(console.error);
