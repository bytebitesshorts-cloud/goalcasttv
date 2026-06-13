import { getAllCountries } from '@/lib/search';
import type { Channel } from '@/types';

/**
 * Get all unique categories present in the database, sorted alphabetically,
 * with 'General' pushed to the end.
 */
export function getAllCategories(): string[] {
  const countries = getAllCountries();
  const categorySet = new Set<string>();

  countries.forEach((country) => {
    country.channels.forEach((channel) => {
      if (channel.category) {
        // Capitalize first letter for consistency
        const cat = channel.category.charAt(0).toUpperCase() + channel.category.slice(1);
        categorySet.add(cat);
      }
    });
  });

  const categories = Array.from(categorySet).sort();
  // Move 'General' to end if exists
  const generalIndex = categories.indexOf('General');
  if (generalIndex > -1) {
    categories.splice(generalIndex, 1);
    categories.push('General');
  }

  return categories;
}

/**
 * Get all channels globally that match a specific category.
 */
export function getChannelsByCategory(category: string): Channel[] {
  const countries = getAllCountries();
  const channels: Channel[] = [];
  const lowerCat = category.toLowerCase();

  countries.forEach((country) => {
    country.channels.forEach((channel) => {
      if (channel.category && channel.category.toLowerCase() === lowerCat) {
        channels.push(channel);
      }
    });
  });

  return channels;
}
