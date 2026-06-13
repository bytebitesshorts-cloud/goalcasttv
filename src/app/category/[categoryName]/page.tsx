import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe2 } from 'lucide-react';
import ChannelCard from '@/components/ChannelCard';
import CategoryFilter from '@/components/CategoryFilter';
import { getChannelsByCategory, getAllCategories } from '@/lib/category';
import { slugify } from '@/lib/utils';
import type { Channel } from '@/types';

interface Props {
  params: { categoryName: string };
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((c) => ({ categoryName: c.toLowerCase() }));
}

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const catParam = params.categoryName.toLowerCase();
  const categories = getAllCategories();
  const validCat = categories.find(c => c.toLowerCase() === catParam);
  
  if (!validCat) return { title: 'Category Not Found' };

  return {
    title: `${validCat} Channels`,
    description: `Watch free live ${validCat} channels from all around the world on GoalCast.`,
  };
}

export default function CategoryPage({ params }: Props) {
  const catParam = params.categoryName.toLowerCase();
  const categories = getAllCategories();
  const validCat = categories.find(c => c.toLowerCase() === catParam);

  if (!validCat) notFound();

  const channels = getChannelsByCategory(validCat);

  // Group channels by country
  const grouped: Record<string, Channel[]> = {};
  channels.forEach(ch => {
    if (!grouped[ch.country]) grouped[ch.country] = [];
    grouped[ch.country].push(ch);
  });

  const sortedCountries = Object.keys(grouped).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200 mb-4"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to home
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white capitalize mb-2">
          {validCat} Channels
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Showing {channels.length} live {validCat.toLowerCase()} channels from {sortedCountries.length} countries.
        </p>
      </div>

      {/* Filter Row */}
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <CategoryFilter categories={categories} baseUrl="/category" />
      </div>

      {/* Channels grouped by country */}
      <div className="space-y-12">
        {sortedCountries.map(country => (
          <section key={country} aria-labelledby={`heading-${slugify(country)}`}>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
              <Globe2 className="w-5 h-5 text-zinc-400" aria-hidden="true" />
              <h2
                id={`heading-${slugify(country)}`}
                className="text-xl font-semibold text-zinc-800 dark:text-zinc-200"
              >
                {country}
              </h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 ml-2">
                {grouped[country].length}
              </span>
            </div>

            <ul
              role="list"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {grouped[country].map((channel) => (
                <li key={channel.id}>
                  <ChannelCard channel={channel} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
