import fs from 'fs/promises';
import path from 'path';
import https from 'https';

const CHANNELS_FILE = path.join(process.cwd(), 'src', 'data', 'channels.json');

// M3U sources to ingest
const SOURCES = [
  {
    url: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_all.m3u8',
    name: 'Free-TV-Global'
  },
  {
    url: 'https://raw.githubusercontent.com/Guovin/iptv-api/gd/output/result.m3u',
    name: 'Guovin-Global'
  },
  {
    url: 'https://raw.githubusercontent.com/shajon-404/iptv/main/app/data/bangla.m3u',
    name: 'Shajon-Bangla',
    defaultCountry: 'Bangladesh',
    defaultCountryCode: 'bd'
  }
];

// Helper to fetch URL content
async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Map M3U group titles to our standard categories
function standardizeCategory(groupTitle) {
  if (!groupTitle) return 'General';
  const lower = groupTitle.toLowerCase();
  
  if (lower.includes('sport') || lower.includes('football') || lower.includes('cricket') || lower.includes('nba')) return 'Sports';
  if (lower.includes('movie') || lower.includes('cinema') || lower.includes('film')) return 'Movies';
  if (lower.includes('music') || lower.includes('mtv') || lower.includes('radio')) return 'Music';
  if (lower.includes('news') || lower.includes('weather')) return 'News';
  if (lower.includes('kid') || lower.includes('child') || lower.includes('cartoon') || lower.includes('animation') || lower.includes('anime')) return 'Kids';
  if (lower.includes('documentary') || lower.includes('nature') || lower.includes('history') || lower.includes('discovery')) return 'Documentary';
  if (lower.includes('entertainment') || lower.includes('comedy') || lower.includes('drama')) return 'Entertainment';
  if (lower.includes('religious') || lower.includes('islam') || lower.includes('christian')) return 'Religious';
  if (lower.includes('auto') || lower.includes('motor')) return 'Auto';
  if (lower.includes('science') || lower.includes('tech')) return 'Science';
  if (lower.includes('family')) return 'Family';
  if (lower.includes('lifestyle') || lower.includes('food') || lower.includes('travel')) return 'Lifestyle';
  
  return 'General';
}

// Generate an ID
function generateId(name, country) {
  return `${name}-${country}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function ingest() {
  console.log('Fetching existing channels...');
  const existingDataGrouped = JSON.parse(await fs.readFile(CHANNELS_FILE, 'utf-8'));
  const existingData = [];
  for (const countryChannels of Object.values(existingDataGrouped)) {
    existingData.push(...countryChannels);
  }
  const existingStreamUrls = new Set(existingData.map(c => c.stream));
  const newChannels = [];

  for (const source of SOURCES) {
    console.log(`\nFetching ${source.name}...`);
    try {
      const content = await fetchUrl(source.url);
      const lines = content.split('\n');
      
      let currentChannel = null;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        if (trimmed.startsWith('#EXTINF:')) {
          // Parse metadata
          // Example: #EXTINF:-1 tvg-id="" tvg-logo="https://i.imgur.com/logo.png" group-title="Sports",Channel Name
          currentChannel = {};
          
          // Extract logo
          const logoMatch = trimmed.match(/tvg-logo="([^"]+)"/);
          currentChannel.logo = logoMatch ? logoMatch[1] : '';
          
          // Extract group (category)
          const groupMatch = trimmed.match(/group-title="([^"]+)"/);
          currentChannel.category = standardizeCategory(groupMatch ? groupMatch[1] : '');
          
          // Try to extract country if specified in group (e.g. "USA - Sports")
          // If not, we will try to infer it from the playlist or set to "International"
          const namePart = trimmed.split(',').pop()?.trim() || 'Unknown Channel';
          currentChannel.name = namePart;
          currentChannel.country = source.defaultCountry || 'International'; // default
          currentChannel.countryCode = source.defaultCountryCode || 'un';
          
          // Check if country code is in group title (e.g. group-title="UK - General")
          if (groupMatch) {
             const groupStr = groupMatch[1];
             if (groupStr.includes('UK ')) currentChannel.country = 'UK';
             else if (groupStr.includes('US ') || groupStr.includes('USA')) currentChannel.country = 'USA';
             else if (groupStr.includes('Canada') || groupStr.includes('CA ')) currentChannel.country = 'Canada';
             else if (groupStr.includes('Australia') || groupStr.includes('AU ')) currentChannel.country = 'Australia';
             else if (groupStr.includes('India') || groupStr.includes('IN ')) currentChannel.country = 'India';
             else if (groupStr.includes('China') || groupStr.includes('CN ')) currentChannel.country = 'China';
             else if (groupStr.includes('France') || groupStr.includes('FR ')) currentChannel.country = 'France';
             else if (groupStr.includes('Germany') || groupStr.includes('DE ')) currentChannel.country = 'Germany';
             else if (groupStr.includes('Spain') || groupStr.includes('ES ')) currentChannel.country = 'Spain';
             else if (groupStr.includes('Italy') || groupStr.includes('IT ')) currentChannel.country = 'Italy';
             else if (groupStr.includes('Brazil') || groupStr.includes('BR ')) currentChannel.country = 'Brazil';
             else if (groupStr.includes('Argentina') || groupStr.includes('AR ')) currentChannel.country = 'Argentina';
          }
          
        } else if (trimmed.startsWith('http') && currentChannel) {
          // This is the stream URL
          currentChannel.stream = trimmed;
          currentChannel.id = generateId(currentChannel.name, currentChannel.country);
          
          // Avoid duplicates
          if (!existingStreamUrls.has(currentChannel.stream)) {
            newChannels.push(currentChannel);
            existingStreamUrls.add(currentChannel.stream);
          }
          currentChannel = null;
        }
      }
      console.log(`Parsed ${newChannels.length} new channels from ${source.name}`);
    } catch (err) {
      console.error(`Error processing ${source.name}:`, err.message);
    }
  }

  // Deduplicate by ID just in case
  const finalChannelsMap = new Map();
  for (const c of existingData) finalChannelsMap.set(c.id, c);
  
  let added = 0;
  for (const c of newChannels) {
    // If ID exists, append a random string
    if (finalChannelsMap.has(c.id)) {
      c.id = c.id + '-' + Math.floor(Math.random() * 1000);
    }
    finalChannelsMap.set(c.id, c);
    added++;
  }
  
  const finalArray = Array.from(finalChannelsMap.values());
  
  // Group by country
  const finalGrouped = {};
  for (const c of finalArray) {
    if (!finalGrouped[c.country]) finalGrouped[c.country] = [];
    finalGrouped[c.country].push(c);
  }
  
  // Sort keys alphabetically
  const sortedGrouped = {};
  Object.keys(finalGrouped).sort().forEach(country => {
    // Sort channels within country alphabetically
    sortedGrouped[country] = finalGrouped[country].sort((a, b) => a.name.localeCompare(b.name));
  });
  
  await fs.writeFile(CHANNELS_FILE, JSON.stringify(sortedGrouped, null, 2));
  console.log(`\nSuccess! Database now has ${finalArray.length} channels (added ${added}).`);
}

ingest();
