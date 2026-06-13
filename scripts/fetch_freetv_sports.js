const fs = require('fs');
const path = require('path');
const https = require('https');

const PLAYLIST_URL = 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8';

function fetchPlaylist(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', reject);
  });
}

function parseM3U(content) {
  const lines = content.split('\n');
  const channels = [];
  let currentInfo = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      const matchName = line.split(',').pop().trim();
      
      // Parse tvg-logo, group-title, tvg-country, etc.
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const countryMatch = line.match(/tvg-country="([^"]+)"/);
      
      currentInfo = {
        name: matchName,
        logo: logoMatch ? logoMatch[1] : '',
        group: groupMatch ? groupMatch[1] : '',
        countryCode: countryMatch ? countryMatch[1].toLowerCase() : '',
        rawInfo: line
      };
    } else if (line && !line.startsWith('#') && currentInfo) {
      currentInfo.stream = line;
      channels.push(currentInfo);
      currentInfo = null;
    }
  }
  return channels;
}

// Country code to name mapping
const countryNameMap = {
  'us': 'United States',
  'uk': 'United Kingdom',
  'gb': 'United Kingdom',
  'ca': 'Canada',
  'au': 'Australia',
  'in': 'India',
  'jp': 'Japan',
  'cn': 'China',
  'hk': 'Hong Kong',
  'mo': 'Macau',
  'tw': 'Taiwan',
  'kp': 'North Korea',
  'kr': 'South Korea',
  'dk': 'Denmark',
  'fo': 'Faroe Islands',
  'gl': 'Greenland',
  'fi': 'Finland',
  'is': 'Iceland',
  'no': 'Norway',
  'se': 'Sweden',
  'ee': 'Estonia',
  'lv': 'Latvia',
  'lt': 'Lithuania',
  'be': 'Belgium',
  'nl': 'Netherlands',
  'lu': 'Luxembourg',
  'de': 'Germany',
  'at': 'Austria',
  'ch': 'Switzerland',
  'pl': 'Poland',
  'cz': 'Czechia',
  'sk': 'Slovakia',
  'hu': 'Hungary',
  'ro': 'Romania',
  'md': 'Moldova',
  'bg': 'Bulgaria',
  'fr': 'France',
  'it': 'Italy',
  'pt': 'Portugal',
  'es': 'Spain',
  'ru': 'Russia',
  'by': 'Belarus',
  'ua': 'Ukraine',
  'am': 'Armenia',
  'az': 'Azerbaijan',
  'ge': 'Georgia',
  'ba': 'Bosnia & Herzegovina',
  'hr': 'Croatia',
  'me': 'Montenegro',
  'mk': 'North Macedonia',
  'rs': 'Serbia',
  'si': 'Slovenia',
  'al': 'Albania',
  'xk': 'Kosovo',
  'gr': 'Greece',
  'cy': 'Cyprus',
  'ad': 'Andorra',
  'mt': 'Malta',
  'mc': 'Monaco',
  'sm': 'San Marino',
  'ir': 'Iran',
  'iq': 'Iraq',
  'il': 'Israel',
  'qa': 'Qatar',
  'tr': 'Turkey',
  'ae': 'United Arab Emirates',
  'ar': 'Argentina',
  'cr': 'Costa Rica',
  'do': 'Dominican Republic',
  'mx': 'Mexico',
  'py': 'Paraguay',
  'pe': 'Peru',
  've': 'Venezuela',
  'br': 'Brazil',
  'tt': 'Trinidad & Tobago',
  'td': 'Chad',
  'so': 'Somalia',
  'id': 'Indonesia',
  'co': 'Colombia',
  'cl': 'Chile',
  'ng': 'Nigeria',
  'za': 'South Africa',
  'th': 'Thailand',
  'uy': 'Uruguay',
  'vn': 'Vietnam',
  'bd': 'Bangladesh',
  'pk': 'Pakistan',
  'eg': 'Egypt',
  'sa': 'Saudi Arabia',
  'ma': 'Morocco',
  'kw': 'Kuwait',
  'om': 'Oman',
  'bh': 'Bahrain',
  'nz': 'New Zealand',
  'sg': 'Singapore',
  'my': 'Malaysia',
  'ph': 'Philippines',
  'ie': 'Ireland',
  'ch': 'Switzerland'
};

async function main() {
  try {
    console.log('Fetching playlist from ' + PLAYLIST_URL + '...');
    const m3uContent = await fetchPlaylist(PLAYLIST_URL);
    console.log('Parsing M3U...');
    const channels = parseM3U(m3uContent);
    console.log(`Found ${channels.length} total channels.`);

    // Keywords to filter sports channels
    const sportsKeywords = [
      'sport', 'sports', 'arena', 'stadium', 'eleven', 'espn', 'fox', 'sky', 'bein', 'cctv-5', 
      'bt sport', 'supersport', 'eurosport', 'fight', 'golf', 'racing', 'motogp', 'f1', 'wwe', 
      'ufc', 'trophy', 'olympic', 'cric', 'cricket', 'futbol', 'football', 'soccer', 'snooker', 
      'tennis', 'nba', 'nfl', 'nhl', 'mlb', 'ufc', 'extream', 'extreme', 'red bull', 'motor', 
      'wrestling', 'billiards', 'darts', 'athletics', 'horse', 'cycling'
    ];

    const sportsChannels = channels.filter(c => {
      const name = c.name.toLowerCase();
      const group = c.group.toLowerCase();
      
      const isSportsGroup = group.includes('sport') || group.includes('sports') || group.includes('futbol') || group.includes('football');
      const hasSportsKeyword = sportsKeywords.some(keyword => name.includes(keyword));
      
      return isSportsGroup || hasSportsKeyword;
    });

    console.log(`Filtered ${sportsChannels.length} sports channels.`);

    // Map and group by Country
    const grouped = {};
    for (const ch of sportsChannels) {
      const code = ch.countryCode || 'us'; // default to us if not specified
      const countryName = countryNameMap[code] || code.toUpperCase();
      
      if (!grouped[countryName]) {
        grouped[countryName] = [];
      }
      
      // Clean name
      let cleanName = ch.name
        .replace(/Ⓢ/g, '')
        .replace(/Ⓖ/g, '')
        .replace(/Ⓨ/g, '')
        .trim();

      // Skip channels that don't have streams
      if (!ch.stream) continue;

      grouped[countryName].push({
        id: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + code,
        name: cleanName,
        logo: ch.logo || '',
        stream: ch.stream,
        category: 'sports',
        country: countryName,
        countryCode: code,
        quality: ch.name.includes('Ⓢ') ? 'SD' : '720p'
      });
    }

    // Print summary
    for (const [country, list] of Object.entries(grouped)) {
      console.log(`- ${country}: ${list.length} channels`);
      list.slice(0, 3).forEach(c => {
        console.log(`  * ${c.name} (${c.stream}) Logo: ${c.logo}`);
      });
    }

    // Write to a temporary file
    fs.writeFileSync(
      path.join(__dirname, 'freetv_sports_extracted.json'),
      JSON.stringify(grouped, null, 2),
      'utf-8'
    );
    console.log('Saved extracted channels list to scripts/freetv_sports_extracted.json');

  } catch (err) {
    console.error('Error:', err);
  }
}

main();
