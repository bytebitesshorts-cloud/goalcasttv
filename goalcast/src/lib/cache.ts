import { unstable_cache } from 'next/cache';
import connectDB from '@/lib/db';
import { Channel } from '@/lib/models/Channel';
import type { Channel as ChannelType, Country } from '@/types';
import { slugify } from '@/lib/utils';

function getFlagEmoji(code: string): string {
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

function mapChannel(ch: any): ChannelType {
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

// ─── Cached: getAllCountries ─────────────────────────────────────────────
async function _getAllCountries(): Promise<Country[]> {
  await connectDB();
  const channels = await Channel.find({ active: true }).lean();

  const countryMap = new Map<string, ChannelType[]>();
  for (const ch of channels) {
    const country = ch.country || 'Unknown';
    if (!countryMap.has(country)) countryMap.set(country, []);
    countryMap.get(country)!.push(mapChannel(ch));
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

  let globalIdx = 1;
  for (const country of countries) {
    for (const channel of country.channels) {
      channel.code = `CH-${globalIdx++}`;
    }
  }

  return countries;
}

/**
 * Cached version of getAllCountries — revalidates every 60 seconds
 * or when 'channels' tag is busted by admin mutations.
 */
export const getCachedCountries = unstable_cache(
  _getAllCountries,
  ['all-countries'],
  { revalidate: 60, tags: ['channels'] }
);

// ─── Cached: getAllChannels ──────────────────────────────────────────────
async function _getAllChannels(): Promise<ChannelType[]> {
  const countries = await _getAllCountries();
  return countries.flatMap((c) => c.channels);
}

export const getCachedChannels = unstable_cache(
  _getAllChannels,
  ['all-channels'],
  { revalidate: 60, tags: ['channels'] }
);

// ─── Cached: getChannel ─────────────────────────────────────────────────
async function _getChannel(id: string): Promise<ChannelType | null> {
  await connectDB();
  const ch = await Channel.findOne({ id, active: true }).lean();
  if (!ch) return null;
  return mapChannel(ch);
}

export const getCachedChannel = unstable_cache(
  _getChannel,
  ['single-channel'],
  { revalidate: 60, tags: ['channels'] }
);

// ─── Cached: getAllCategories ────────────────────────────────────────────
async function _getAllCategories(): Promise<string[]> {
  await connectDB();
  const rawCategories = await Channel.distinct('category', { active: true });
  const categorySet = new Set<string>();
  for (const cat of rawCategories) {
    if (cat) categorySet.add(cat.charAt(0).toUpperCase() + cat.slice(1));
  }
  const categories = Array.from(categorySet).sort();

  const generalIndex = categories.indexOf('General');
  if (generalIndex > -1) { categories.splice(generalIndex, 1); categories.push('General'); }

  const fifaIndex = categories.indexOf('FIFA 2026');
  if (fifaIndex > -1) categories.splice(fifaIndex, 1);
  categories.unshift('FIFA 2026');

  return categories;
}

export const getCachedCategories = unstable_cache(
  _getAllCategories,
  ['all-categories'],
  { revalidate: 60, tags: ['channels'] }
);
