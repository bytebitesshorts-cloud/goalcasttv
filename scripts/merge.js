const fs = require('fs');
const path = require('path');

// Paths
const currentDataPath = path.join(__dirname, '..', 'src', 'data', 'channels.json');
const fetchedDataPath = 'C:\\Users\\Tanvir\\.gemini\\antigravity-ide\\brain\\9cd0c69d-1083-4672-837e-43045e848a49\\.system_generated\\steps\\305\\content.md';

// Country mappings for shajon-404/iptv channels
const countryMap = {
  'T Sports HD': { country: 'Bangladesh', code: 'bd' },
  'T-SPORTS': { country: 'Bangladesh', code: 'bd' },
  'FIGHTER TV': { country: 'Bangladesh', code: 'bd' },
  'Sports Legends': { country: 'Bangladesh', code: 'bd' },
  'Flash Guys HD': { country: 'Bangladesh', code: 'bd' },
  'CAZE TV': { country: 'Brazil', code: 'br' },
  'CAZE TV (1080p)': { country: 'Brazil', code: 'br' },
  'Cricket Gold': { country: 'India', code: 'in' },
  'A sports': { country: 'Pakistan', code: 'pk' },
  'A Sports': { country: 'Pakistan', code: 'pk' },
  'PTV Sports': { country: 'Pakistan', code: 'pk' },
  'P Tv Sports': { country: 'Pakistan', code: 'pk' },
  'Golf Channel': { country: 'United States', code: 'us' },
  'Fox Sports 2': { country: 'United States', code: 'us' },
  'Espn': { country: 'United States', code: 'us' },
  'Marquee Sports Network': { country: 'United States', code: 'us' },
  'Sports Grid': { country: 'United States', code: 'us' },
  'Bloomberg TV': { country: 'United States', code: 'us' },
  'NFL Network': { country: 'United States', code: 'us' },
  'Willow HD TV': { country: 'United States', code: 'us' },
  'FB | Goal TV': { country: 'United States', code: 'us' },
  'FB | Bleav Football': { country: 'United States', code: 'us' },
  'MIXER | NBC Sports': { country: 'United States', code: 'us' },
  'SPORTS FIRST TV': { country: 'United States', code: 'us' },
  'UFC TV': { country: 'United States', code: 'us' },
  'TSN 1': { country: 'Canada', code: 'ca' },
  'TSN 2': { country: 'Canada', code: 'ca' },
  'TSN 3': { country: 'Canada', code: 'ca' },
  'Talk Sport': { country: 'United Kingdom', code: 'gb' },
  'Premier League': { country: 'United Kingdom', code: 'gb' },
  'DD Sports': { country: 'India', code: 'in' },
  'MIXER | KTV Sport Plus': { country: 'Kuwait', code: 'kw' },
  'FB | Oman Sports TV': { country: 'Oman', code: 'om' },
  'Bahrain Sports 1': { country: 'Bahrain', code: 'bh' },
  'FB | MORE THEN SPORTS TV': { country: 'Germany', code: 'de' },
  'MIXER | Xtrem Sports': { country: 'Germany', code: 'de' },
  'WOF 1': { country: 'Germany', code: 'de' },
  'CR | Fox Cricket 501': { country: 'Australia', code: 'au' },
  'RACING | MTRSPT1': { country: 'United States', code: 'us' },
  'RACING | speed sports 1': { country: 'United States', code: 'us' },
  'PSL + IPL': { country: 'India', code: 'in' },
  'Star Select 1': { country: 'India', code: 'in' },
  '--Live(FOOTBALL)--': { country: 'Spain', code: 'es' }
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function cleanChannelName(name) {
  let clean = name.trim();
  // Remove prefixes
  clean = clean.replace(/^(MIXER |FB |CR |RACING |Live)\s*\|\s*/i, '');
  clean = clean.replace(/^--Live\((.*?)\)--$/i, 'Real Madrid TV ($1)');
  return clean.trim();
}

function main() {
  console.log('Loading existing data...');
  const currentChannels = JSON.parse(fs.readFileSync(currentDataPath, 'utf8'));

  console.log('Loading fetched data...');
  let fetchedText = fs.readFileSync(fetchedDataPath, 'utf8').split('---')[1].trim();
  
  // Clean incomplete trailing brackets
  if (fetchedText.endsWith('{')) {
    fetchedText = fetchedText.substring(0, fetchedText.lastIndexOf('{')).trim();
    if (fetchedText.endsWith(',')) {
      fetchedText = fetchedText.substring(0, fetchedText.length - 1).trim();
    }
    fetchedText += '\n]';
  }

  const fetchedChannels = JSON.parse(fetchedText);
  console.log(`Fetched ${fetchedChannels.length} channels from source.`);

  let addedCount = 0;
  let updatedCount = 0;

  fetchedChannels.forEach(ch => {
    const mapping = countryMap[ch.name];
    if (!mapping) {
      console.log(`Skipping channel without mapping: ${ch.name}`);
      return;
    }

    const { country, code } = mapping;
    const cleanName = cleanChannelName(ch.name);
    const id = slugify(cleanName + '-' + code);

    // Default logo if empty
    let logo = ch.logo;
    if (!logo || logo.trim() === '') {
      logo = `https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Olympics_symbol.svg/200px-Olympics_symbol.svg.png`;
    }

    const newChannel = {
      id,
      name: cleanName,
      logo,
      stream: ch.url,
      category: 'sports',
      country,
      countryCode: code,
      quality: ch.name.includes('1080p') ? '1080p' : '720p'
    };

    if (!currentChannels[country]) {
      currentChannels[country] = [];
    }

    // Check if channel already exists (by name or stream)
    const existingIndex = currentChannels[country].findIndex(
      x => x.name.toLowerCase() === cleanName.toLowerCase() || x.stream === ch.url
    );

    if (existingIndex >= 0) {
      // Overwrite/Update stream
      currentChannels[country][existingIndex] = newChannel;
      updatedCount++;
    } else {
      // Add new
      currentChannels[country].push(newChannel);
      addedCount++;
    }
  });

  // Sort channels in each country alphabetically by name
  for (const country in currentChannels) {
    currentChannels[country].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Write back
  fs.writeFileSync(currentDataPath, JSON.stringify(currentChannels, null, 2), 'utf8');
  console.log(`Merge completed. Added: ${addedCount}, Updated: ${updatedCount} channels.`);
}

main();
