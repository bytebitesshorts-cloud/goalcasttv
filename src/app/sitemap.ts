import { getAllCountries, getAllChannels } from '@/lib/search';
import { slugify } from '@/lib/utils';

const BASE_URL = 'https://goalcast-tv.vercel.app';

export default async function sitemap() {
  const countries = await getAllCountries();
  const channels = await getAllChannels();

  const countryUrls = countries.map((c) => ({
    url: `${BASE_URL}/country/${slugify(c.name)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const channelUrls = channels.map((c) => ({
    url: `${BASE_URL}/watch/${c.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/schedule`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    ...countryUrls,
    ...channelUrls,
  ];
}
