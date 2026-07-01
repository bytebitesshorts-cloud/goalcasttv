import connectDB from '@/lib/db';
import { Channel } from '@/lib/models/Channel';
import type { Channel as ChannelType } from '@/types';

/**
 * Get all unique categories present in the database, sorted alphabetically,
 * with 'General' pushed to the end.
 */
export async function getAllCategories(): Promise<string[]> {
  await connectDB();
  const rawCategories = await Channel.distinct('category', { active: true });

  const categorySet = new Set<string>();
  for (const cat of rawCategories) {
    if (cat) {
      categorySet.add(cat.charAt(0).toUpperCase() + cat.slice(1));
    }
  }

  const categories = Array.from(categorySet).sort();

  // Move 'General' to end if exists
  const generalIndex = categories.indexOf('General');
  if (generalIndex > -1) {
    categories.splice(generalIndex, 1);
    categories.push('General');
  }

  // Ensure 'FIFA 2026' is absolute first
  const fifaIndex = categories.indexOf('FIFA 2026');
  if (fifaIndex > -1) {
    categories.splice(fifaIndex, 1);
  }
  categories.unshift('FIFA 2026');

  return categories;
}

/**
 * Get all channels globally that match a specific category.
 */
export async function getChannelsByCategory(category: string): Promise<ChannelType[]> {
  await connectDB();

  const channels = await Channel.find({
    active: true,
    category: { $regex: new RegExp(`^${category}$`, 'i') },
  }).lean();

  return channels.map((ch) => ({
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
  }));
}
