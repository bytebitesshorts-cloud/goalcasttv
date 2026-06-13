const fs = require('fs');
const path = require('path');
const https = require('https');

const CHANNELS_FILE = path.join(__dirname, '../src/data/channels.json');

// Known logo overrides for channels that may have bad/missing logos
// Searched from official sources / Wikipedia / Wikimedia Commons
const LOGO_OVERRIDES = {
  // Bangladesh sports
  'T SPORTS HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/T_Sports_channel_logo.png/200px-T_Sports_channel_logo.png',
  'T SPORTS HD (Source 2)': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/T_Sports_channel_logo.png/200px-T_Sports_channel_logo.png',
  'GAZI TV HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/44/GTV_%28Bangladeshi_TV_channel%29_logo.svg/200px-GTV_%28Bangladeshi_TV_channel%29_logo.svg.png',
  'GAZI TV HD (Source 2)': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/44/GTV_%28Bangladeshi_TV_channel%29_logo.svg/200px-GTV_%28Bangladeshi_TV_channel%29_logo.svg.png',
  'SPORTS 18 HD (FIFA-22)': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/54/Sports18_logo.png/200px-Sports18_logo.png',
  'YES TV HD (FIFA-22)': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d6/Yes_TV_logo.svg/200px-Yes_TV_logo.svg.png',
  'Skynet Sports HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Sky_Sports_logo.svg/200px-Sky_Sports_logo.svg.png',
  'Skynet Sports 1': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Sky_Sports_logo.svg/200px-Sky_Sports_logo.svg.png',
  'Skynet Sports 2': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Sky_Sports_logo.svg/200px-Sky_Sports_logo.svg.png',
  'Skynet Sports 6': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Sky_Sports_logo.svg/200px-Sky_Sports_logo.svg.png',
  'SONY SIX': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6d/Sony_Six_channel_logo.png/200px-Sony_Six_channel_logo.png',
  'SONY TEN 1 HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Sony_Ten_1_Logo.png/200px-Sony_Ten_1_Logo.png',
  'SONY TEN 2 HD': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d9/Sony_Ten_2_Logo.png/200px-Sony_Ten_2_Logo.png',
  'SONY TEN 3': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/55/Sony_Ten_3_Logo.png/200px-Sony_Ten_3_Logo.png',
  'FIGHTER TV': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgNTVL_Em_EdwVB2BrdBsyD6vxWv3VoEcBlDLj2qpE_jdxCDlIAqp07_ToS5ZFAB2ThnA04BYdC9T7pgwPy5HWX8IwL74oCwsNXdVANpHq7x98tgvaEBCGMkYBQqAUfj5W9un5H8BckX7TgB5pVV3g7kGMRc_vLGyY5XfmsLtrEEmgJJ5-q5eNqBZp8qA/s1080/1000059174.png',
  // General sports
  'ESPN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/200px-ESPN_wordmark.svg.png',
  'ESPN 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/ESPN2_Logo.svg/200px-ESPN2_Logo.svg.png',
  'Fox Sports': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/67/Fox_Sports_logo_2019.svg/200px-Fox_Sports_logo_2019.svg.png',
  'beIN Sports': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/BeIN_Sports_logo.svg/200px-BeIN_Sports_logo.svg.png',
  'Sky Sports': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Sky_Sports_logo.svg/200px-Sky_Sports_logo.svg.png',
  'BT Sport': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/BT_Sport_logo.svg/200px-BT_Sport_logo.svg.png',
  'Eurosport': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Eurosport_logo_2015.svg/200px-Eurosport_logo_2015.svg.png',
  'TNT Sports': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/TNT_Sports_logo.svg/200px-TNT_Sports_logo.svg.png',
  'Star Sports': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/Star_Sports_logo.svg/200px-Star_Sports_logo.svg.png',
  'Willow Cricket': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Willow_TV_logo.svg/200px-Willow_TV_logo.svg.png',
  'Premier Sports': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Premier_Sports_UK_logo.svg/200px-Premier_Sports_UK_logo.svg.png',
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function enrichLogo(channel) {
  // If no logo or just a placeholder, try the override map
  if (!channel.logo || channel.logo.includes('placehold.co') || channel.logo.includes('172.32.1.88')) {
    // Check name override
    const override = LOGO_OVERRIDES[channel.name];
    if (override) {
      return override;
    }
    // Use a branded sports TV placeholder with channel initials
    const initials = channel.name
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')
      .slice(0, 2)
      .map(w => w[0] || '')
      .join('')
      .toUpperCase() || 'TV';
    return `https://placehold.co/200x200/16a34a/ffffff?text=${encodeURIComponent(initials)}`;
  }
  
  // Fix logos from local IPs
  if (channel.logo && channel.logo.includes('172.32.')) {
    const override = LOGO_OVERRIDES[channel.name];
    if (override) return override;
  }
  
  return channel.logo;
}

async function main() {
  console.log('📖 Reading channels.json...');
  const data = JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf-8'));
  
  let totalBefore = 0;
  let sportsKept = 0;
  let nonSportsRemoved = 0;
  let logosFixed = 0;
  
  const result = {};
  
  Object.keys(data).forEach(country => {
    const all = data[country];
    totalBefore += all.length;
    
    // Keep only sports channels
    const sportsChs = all.filter(c => c.category && c.category.toLowerCase() === 'sports');
    nonSportsRemoved += all.length - sportsChs.length;
    
    if (sportsChs.length > 0) {
      result[country] = sportsChs;
      sportsKept += sportsChs.length;
    }
  });
  
  console.log(`\n📊 Stats:`);
  console.log(`  Total channels before: ${totalBefore}`);
  console.log(`  Non-sports removed:    ${nonSportsRemoved}`);
  console.log(`  Sports kept:           ${sportsKept}`);
  
  // Reassign sequential codes and enrich logos
  let codeIndex = 1;
  Object.keys(result).sort().forEach(country => {
    result[country].forEach(channel => {
      channel.code = `CH-${String(codeIndex).padStart(4, '0')}`;
      codeIndex++;
      
      const newLogo = enrichLogo(channel);
      if (newLogo !== channel.logo) {
        logosFixed++;
        channel.logo = newLogo;
      }
    });
  });
  
  console.log(`  Logos fixed/enriched:  ${logosFixed}`);
  console.log(`  Total codes assigned:  ${codeIndex - 1}`);
  
  // Sort countries alphabetically
  const sorted = {};
  Object.keys(result).sort().forEach(k => sorted[k] = result[k]);
  
  fs.writeFileSync(CHANNELS_FILE, JSON.stringify(sorted, null, 2));
  console.log(`\n✅ channels.json updated with ${sportsKept} sports channels across ${Object.keys(sorted).length} countries.`);
}

main().catch(console.error);
