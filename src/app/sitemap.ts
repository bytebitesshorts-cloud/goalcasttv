import { getAllCountries, getAllChannels } from '@/lib/search';
import { getAllCategories } from '@/lib/category';
import { slugify } from '@/lib/utils';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://goalcast-tv.vercel.app';

export default async function sitemap() {
  const countries = await getAllCountries();
  const channels = await getAllChannels();
  const categories = await getAllCategories();

  await connectDB();
  const blogStore = await Store.findOne({ key: 'blog' });
  const blogs = (blogStore?.data || []) as any[];
  const publishedBlogs = blogs.filter((b) => b.published);

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

  const categoryUrls = categories.map((cat) => ({
    url: `${BASE_URL}/category/${slugify(cat)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const blogUrls = publishedBlogs.map((b) => ({
    url: `${BASE_URL}/blog/${b.slug}`,
    lastModified: new Date(b.publishedAt || Date.now()).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
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
    {
      url: `${BASE_URL}/scores`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...categoryUrls,
    ...countryUrls,
    ...blogUrls,
    ...channelUrls,
  ];
}
