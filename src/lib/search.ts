import Fuse from 'fuse.js';
import channelsData from '@/data/channels.json';
import type { Channel, Country, SearchResult } from '@/types';

// Build a flat list of all countries with their channels
export function getAllCountries(): Country[] {
  const data = channelsData as Record<string, Omit<Channel, 'country' | 'countryCode'>[]>;
  
  const countries = Object.entries(data)
    .map(([countryName, channels]) => {
      // Get country code from first channel if available
      const firstChannel = channels[0] as Channel;
      const code = firstChannel?.countryCode || countryName.toLowerCase().replace(/\s+/g, '-');
      
      const activeChannels = (channels as Array<Omit<Channel, 'country' | 'countryCode'> & { active?: boolean }>)
        .filter((ch) => ch.active !== false)
        .map((ch) => ({
          ...ch,
          country: countryName,
          countryCode: code,
        }));

      return {
        name: countryName,
        code,
        flag: getFlagEmoji(code),
        channels: activeChannels,
      };
    })
    .filter((country) => country.channels.length > 0);

  // Assign stable serial code CH-1, CH-2, ...
  let globalIdx = 1;
  for (const country of countries) {
    for (const channel of country.channels) {
      channel.code = `CH-${globalIdx++}`;
    }
  }

  return countries;
}

// Get all channels flat
export function getAllChannels(): Channel[] {
  const countries = getAllCountries();
  return countries.flatMap((c) => c.channels);
}

// Get country by name
export function getCountry(name: string): Country | undefined {
  const countries = getAllCountries();
  return countries.find(
    (c) => c.name.toLowerCase() === decodeURIComponent(name).toLowerCase()
  );
}

// Get channel by id
export function getChannel(id: string): Channel | undefined {
  const channels = getAllChannels();
  return channels.find((c) => c.id === id);
}

// Create Fuse.js search instance for countries + channels
let fuseInstance: Fuse<SearchResult> | null = null;

function getFuseInstance(): Fuse<SearchResult> {
  if (fuseInstance) return fuseInstance;
  
  const countries = getAllCountries();
  const searchItems: SearchResult[] = [];
  
  // Add countries
  countries.forEach((country) => {
    searchItems.push({ type: 'country', country });
  });
  
  // Add channels (with country name context)
  countries.forEach((country) => {
    country.channels.forEach((channel) => {
      searchItems.push({
        type: 'channel',
        channel,
        countryName: country.name,
      });
    });
  });
  
  fuseInstance = new Fuse(searchItems, {
    keys: [
      { name: 'country.name', weight: 2 },
      { name: 'channel.name', weight: 2 },
      { name: 'channel.category', weight: 1 },
      { name: 'channel.code', weight: 4 },
      { name: 'countryName', weight: 1 },
    ],
    threshold: 0.35,
    minMatchCharLength: 1,
    includeScore: true,
  });
  
  return fuseInstance;
}

// Search function returning top results
export function searchAll(query: string, limit = 8): SearchResult[] {
  if (!query.trim()) return [];
  const fuse = getFuseInstance();
  return fuse.search(query, { limit }).map((r) => r.item);
}

// Get flag emoji from 2-letter ISO country code dynamically
export function getFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return '🏳️';
  const cleanCode = code.toUpperCase();
  // Regional Indicator Symbol Letter A is 127462. 'A' char code is 65.
  // Base offset is 127462 - 65 = 127397.
  const first = cleanCode.charCodeAt(0) + 127397;
  const second = cleanCode.charCodeAt(1) + 127397;
  try {
    return String.fromCodePoint(first, second);
  } catch {
    return '🏳️';
  }
}
