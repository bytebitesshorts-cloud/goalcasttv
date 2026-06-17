import Fuse from 'fuse.js';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';
import type { Channel, Country, SearchResult } from '@/types';
import { slugify } from '@/lib/utils';

export async function getAllCountries(): Promise<Country[]> {
  await connectDB();
  const channelsStore = await Store.findOne({ key: 'channels' });
  const data = (channelsStore?.data || {}) as Record<string, Omit<Channel, 'country' | 'countryCode'>[]>;

  const countries = Object.entries(data)
    .map(([countryName, channels]) => {
      const firstChannel = channels[0] as Channel;
      const code = firstChannel?.countryCode || countryName.toLowerCase().replace(/\s+/g, '-');

      const activeChannels = (channels as Array<Omit<Channel, 'country' | 'countryCode'> & { active?: boolean }>)
        .filter((ch) => ch.active === true || !!ch.stream)
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

  let globalIdx = 1;
  for (const country of countries) {
    for (const channel of country.channels) {
      channel.code = `CH-${globalIdx++}`;
    }
  }

  return countries;
}

export async function getAllChannels(): Promise<Channel[]> {
  const countries = await getAllCountries();
  return countries.flatMap((c) => c.channels);
}

export async function getCountry(name: string): Promise<Country | undefined> {
  const countries = await getAllCountries();
  return countries.find(
    (c) => slugify(c.name) === name
  );
}

export async function getChannel(id: string): Promise<Channel | undefined> {
  const channels = await getAllChannels();
  return channels.find((c) => c.id === id);
}

let fuseInstance: Fuse<SearchResult> | null = null;

async function getFuseInstance(): Promise<Fuse<SearchResult>> {
  // Disable memory cache so database changes reflect instantly in search
  // if (fuseInstance && Date.now() - lastFuseUpdate < 10 * 60 * 1000) return fuseInstance;

  const countries = await getAllCountries();
  const searchItems: SearchResult[] = [];

  countries.forEach((country) => {
    searchItems.push({ type: 'country', country });
  });

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
