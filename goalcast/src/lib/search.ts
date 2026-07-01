import Fuse from 'fuse.js';
import connectDB from '@/lib/db';
import { Channel } from '@/lib/models/Channel';
import type { Channel as ChannelType, Country, SearchResult } from '@/types';
import { slugify } from '@/lib/utils';

export async function getAllCountries(): Promise<Country[]> {
  await connectDB();

  // Query only active channels directly from the Channel collection
  const channels = await Channel.find({ active: true }).lean();

  // Group by country
  const countryMap = new Map<string, ChannelType[]>();
  for (const ch of channels) {
    const country = ch.country || 'Unknown';
    if (!countryMap.has(country)) countryMap.set(country, []);
    countryMap.get(country)!.push({
      id: ch.id,
      name: ch.name,
      logo: ch.logo || '',
      stream: ch.stream || '',
      embedCode: ch.embedCode || '',
      category: ch.category || 'Sports',
      country: ch.country,
      countryCode: ch.countryCode || ch.country.toLowerCase().replace(/\s+/g, '-'),
      quality: ch.quality || '',
      code: ch.code || '',
      active: ch.active,
    });
  }

  const countries = Array.from(countryMap.entries())
    .map(([countryName, chans]) => {
      const code = chans[0]?.countryCode || countryName.toLowerCase().replace(/\s+/g, '-');
      return {
        name: countryName,
        code,
        flag: getFlagEmoji(code),
        channels: chans,
      };
    })
    .filter((c) => c.channels.length > 0);

  // Assign sequential channel codes
  let globalIdx = 1;
  for (const country of countries) {
    for (const channel of country.channels) {
      channel.code = `CH-${globalIdx++}`;
    }
  }

  return countries;
}

export async function getAllChannels(): Promise<ChannelType[]> {
  const countries = await getAllCountries();
  return countries.flatMap((c) => c.channels);
}

export async function getCountry(name: string): Promise<Country | undefined> {
  const countries = await getAllCountries();
  return countries.find((c) => slugify(c.name) === name);
}

export async function getChannel(id: string): Promise<ChannelType | undefined> {
  await connectDB();
  const ch = await Channel.findOne({ id, active: true }).lean();
  if (!ch) return undefined;
  return {
    id: ch.id,
    name: ch.name,
    logo: ch.logo || '',
    stream: ch.stream || '',
    embedCode: ch.embedCode || '',
    category: ch.category || 'Sports',
    country: ch.country,
    countryCode: ch.countryCode || '',
    quality: ch.quality || '',
    code: ch.code || '',
    active: ch.active,
  };
}

let fuseInstance: Fuse<SearchResult> | null = null;

async function getFuseInstance(): Promise<Fuse<SearchResult>> {
  const countries = await getAllCountries();
  const searchItems: SearchResult[] = [];
  countries.forEach((country) => {
    searchItems.push({ type: 'country', country });
  });
  countries.forEach((country) => {
    country.channels.forEach((channel) => {
      searchItems.push({ type: 'channel', channel, countryName: country.name });
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

export async function searchAll(query: string, limit = 8): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const fuse = await getFuseInstance();
  return fuse.search(query, { limit }).map((r) => r.item);
}

export function getFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return '🏳️';
  const cleanCode = code.toUpperCase();
  const first = cleanCode.charCodeAt(0) + 127397;
  const second = cleanCode.charCodeAt(1) + 127397;
  try {
    return String.fromCodePoint(first, second);
  } catch {
    return '🏳️';
  }
}
