const fs = require('fs');
const path = require('path');

const CHANNELS_PATH = path.join(__dirname, '../src/data/channels.json');
const BACKUP_PATH = path.join(__dirname, '../src/data/channels.backup-import.json');

const newChannelsList = [
  {
    name: "FIFA Plus English",
    stream: "https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0ZJRkFQbHVzRW5nbGlzaF9ITFM/playlist.m3u8",
    logo: "https://i.ibb.co.com/vnbkF0r/fifa-world-cup-2026-logo-png-seeklogo-665644.png",
    country: "International",
    countryCode: "intl",
    category: "sports"
  },
  {
    name: "FIFA Plus B",
    stream: "https://37b4c228.wurl.com/manifest/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWZyX0ZJRkFQbHVzRnJlbmNoX0hMUw/6f5437c5-e015-4754-8476-c8c6d27d3a55/1.m3u8",
    logo: "https://i.ibb.co.com/vnbkF0r/fifa-world-cup-2026-logo-png-seeklogo-665644.png",
    country: "International",
    countryCode: "intl",
    category: "sports"
  },
  {
    name: "Fox Sports 2 - (FIFA)",
    stream: "https://tvsen7.aynaott.com/foxsports2/index.m3u8?e=1779283790&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=cbb7f40b4af7be51a91e0629a5ac7238",
    logo: "https://imglink.cc/cdn/o5BoWU_BEz.png",
    country: "United States",
    countryCode: "us",
    category: "sports"
  },
  {
    name: "Bein Sports 2 - France (FIFA)",
    stream: "http://145.239.5.177/559/mpegts",
    logo: "https://imglink.cc/cdn/kIiut6WBq0.jpg",
    country: "France",
    countryCode: "fr",
    category: "sports"
  },
  {
    name: "Bein Sports 2 B- France (FIFA)",
    stream: "http://145.239.5.177:80/559/index.m3u8",
    logo: "https://imglink.cc/cdn/kIiut6WBq0.jpg",
    country: "France",
    countryCode: "fr",
    category: "sports"
  },
  {
    name: "Bein Sports 1 - Serbia (FIFA)",
    stream: "http://ua.online24.pm/play/1101/350B326FB34F4B8/video.m3u8",
    logo: "https://imglink.cc/cdn/kIiut6WBq0.jpg",
    country: "Serbia",
    countryCode: "rs",
    category: "sports"
  },
  {
    name: "Bein Sports 2 - Serbia (FIFA)",
    stream: "http://ua.online24.pm/play/1102/350B326FB34F4B8/video.m3u8",
    logo: "https://imglink.cc/cdn/kIiut6WBq0.jpg",
    country: "Serbia",
    countryCode: "rs",
    category: "sports"
  },
  {
    name: "TUDN HD (FIFA)",
    stream: "http://74.208.30.121/a192/mono.m3u8",
    logo: "https://imglink.cc/cdn/Tf3GP8uGY_.jpg",
    country: "Mexico",
    countryCode: "mx",
    category: "sports"
  },
  {
    name: "TUDN 1080 (FIFA)",
    stream: "http://162.19.255.233:8080/play/UNbAl57p9hXZClOu56FCTVL9TbgOeYnXUEC2UjoDBYk/m3u8",
    logo: "https://imglink.cc/cdn/Tf3GP8uGY_.jpg",
    country: "Mexico",
    countryCode: "mx",
    category: "sports"
  },
  {
    name: "Bein Sports 1",
    stream: "http://27.124.71.27/beIN_Sports_1/index.m3u8",
    logo: "https://imglink.cc/cdn/kIiut6WBq0.jpg",
    country: "International",
    countryCode: "intl",
    category: "sports"
  },
  {
    name: "Bein Sports 2",
    stream: "http://27.124.71.27/beIN_Sports_2/index.m3u8",
    logo: "https://imglink.cc/cdn/kIiut6WBq0.jpg",
    country: "International",
    countryCode: "intl",
    category: "sports"
  },
  {
    name: "Bein Sports 3",
    stream: "http://27.124.71.27/beIN_Sports_3/index.m3u8",
    logo: "https://imglink.cc/cdn/kIiut6WBq0.jpg",
    country: "International",
    countryCode: "intl",
    category: "sports"
  },
  {
    name: "Bein Sports 4",
    stream: "https://bein-esp-xumo.amagi.tv/playlistR1080p.m3u8",
    logo: "https://imglink.cc/cdn/kIiut6WBq0.jpg",
    country: "International",
    countryCode: "intl",
    category: "sports"
  },
  {
    name: "TNT Sports 1",
    stream: "http://27.124.71.27/TNT_Sports_1/index.m3u8",
    logo: "https://imglink.cc/cdn/VHUi569tAW.jpg",
    country: "United Kingdom",
    countryCode: "gb",
    category: "sports"
  },
  {
    name: "TNT Sports 2",
    stream: "http://27.124.71.27/TNT_Sports_2/index.m3u8",
    logo: "https://imglink.cc/cdn/VHUi569tAW.jpg",
    country: "United Kingdom",
    countryCode: "gb",
    category: "sports"
  },
  {
    name: "TNT Sports 3",
    stream: "http://27.124.71.27/TNT_Sports_3/index.m3u8",
    logo: "https://imglink.cc/cdn/VHUi569tAW.jpg",
    country: "United Kingdom",
    countryCode: "gb",
    category: "sports"
  },
  {
    name: "Tyc Sports",
    stream: "https://amg26268-amg26268c14-freelivesports-emea-10267.playouts.now.amagi.tv/ts-us-e2-n2/playlist/amg26268-sportsstudio-tycsports-freelivesportsemea/playlist.m3u8",
    logo: "https://imglink.cc/cdn/1oSRQnyUqK.jpg",
    country: "Argentina",
    countryCode: "ar",
    category: "sports"
  },
  {
    name: "Bein Sports 1 (Andro)",
    stream: "https://andro.226503.xyz/checklist/androstreamlivebs1.m3u8",
    logo: "https://imglink.cc/cdn/kIiut6WBq0.jpg",
    country: "International",
    countryCode: "intl",
    category: "sports"
  },
  {
    name: "Bein Sports 2 (Andro)",
    stream: "https://andro.226503.xyz/checklist/androstreamlivebs2.m3u8",
    logo: "https://imglink.cc/cdn/kIiut6WBq0.jpg",
    country: "International",
    countryCode: "intl",
    category: "sports"
  },
  {
    name: "Bein Sports 3 (Andro)",
    stream: "https://andro.226503.xyz/checklist/androstreamlivebs3.m3u8",
    logo: "https://imglink.cc/cdn/kIiut6WBq0.jpg",
    country: "International",
    countryCode: "intl",
    category: "sports"
  },
  {
    name: "Bein Sports 4 (Andro)",
    stream: "https://andro.226503.xyz/checklist/androstreamlivebs4.m3u8",
    logo: "https://imglink.cc/cdn/kIiut6WBq0.jpg",
    country: "International",
    countryCode: "intl",
    category: "sports"
  },
  {
    name: "Cricbuzz HD",
    stream: "http://4kgood.org:80/live/4o48up5evz/r4fiast66u/1163988.ts",
    logo: "https://imglink.cc/cdn/GGm9H9tLHP.png",
    country: "International",
    countryCode: "intl",
    category: "sports"
  },
  {
    name: "Willow HD TV",
    stream: "https://tvsen5.aynaott.com/willowhd/index.m3u8?e=1779283803&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=2fe7bf4f892cf09f80087b8146545bad",
    logo: "https://imglink.cc/cdn/GGm9H9tLHP.png",
    country: "United States",
    countryCode: "us",
    category: "sports"
  },
  {
    name: "T Sports HD",
    stream: "http://27.124.71.27/T-Sports/index.m3u8",
    logo: "https://i.ibb.co.com/mrvT7b6G/T-Sports-HD.png",
    country: "Bangladesh",
    countryCode: "bd",
    category: "sports"
  },
  {
    name: "T Sports B",
    stream: "https://tvsen7.aynaott.com/tsports-hd/index.m3u8?e=1779283784&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=3b4c5a2cfa872fa7f91ffbfb4aa0f658",
    logo: "https://i.ibb.co.com/mrvT7b6G/T-Sports-HD.png",
    country: "Bangladesh",
    countryCode: "bd",
    category: "sports"
  },
  {
    name: "Euro TV",
    stream: "https://stream.ottplus.bd/live/euro_sports_hd_abr/live/euro_sports_hd/chunks.m3u8",
    logo: "https://imglink.cc/cdn/SZphbKsSMx.png",
    country: "International",
    countryCode: "intl",
    category: "sports"
  },
  {
    name: "Star Sports 1",
    stream: "https://tvsen7.aynaott.com/sspts1/tracks-v1a1/mono.ts.m3u8",
    logo: "https://imglink.cc/cdn/va7WOdXDQC.jpg",
    country: "India",
    countryCode: "in",
    category: "sports"
  },
  {
    name: "Star Sports 1 B",
    stream: "https://tvsen7.aynaott.com/sspts1/index.m3u8",
    logo: "https://imglink.cc/cdn/va7WOdXDQC.jpg",
    country: "India",
    countryCode: "in",
    category: "sports"
  },
  {
    name: "Sony Sports 1",
    stream: "https://ashtv.com.bd/server/channels/sony_ten_sports",
    logo: "https://imglink.cc/cdn/WC3hEjixvp.jpg",
    country: "India",
    countryCode: "in",
    category: "sports"
  }
];

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

  console.log(`Testing ${newChannelsList.length} potential import channels...`);

  const workingChannels = [];
  for (const c of newChannelsList) {
    const isWorking = await testStream(c.stream);
    if (isWorking) {
      console.log(`[ONLINE] Adding: ${c.name} (${c.country})`);
      workingChannels.push(c);
    } else {
      console.log(`[OFFLINE] Skipping: ${c.name} (${c.country})`);
    }
  }

  let addedCount = 0;
  for (const c of workingChannels) {
    const countryName = c.country;
    if (!data[countryName]) {
      data[countryName] = [];
    }

    // Check if channel stream or name already exists in this country
    const exists = data[countryName].some(existing => 
      existing.stream === c.stream || 
      existing.name.toLowerCase() === c.name.toLowerCase()
    );

    if (!exists) {
      const id = `ch_import_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      data[countryName].push({
        id,
        name: c.name,
        logo: c.logo,
        stream: c.stream,
        category: c.category,
        country: c.country,
        countryCode: c.countryCode,
        active: true
      });
      addedCount++;
    }
  }

  fs.writeFileSync(CHANNELS_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\nImport complete! Added ${addedCount} working channels to ${CHANNELS_PATH}`);
}

run().catch(console.error);
