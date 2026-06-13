import type { Metadata } from 'next';
import { Globe2 } from 'lucide-react';
import CountryCard from '@/components/CountryCard';
import HomePersonalSection from '@/components/HomePersonalSection';
import CategoryFilter from '@/components/CategoryFilter';
import { getAllCountries } from '@/lib/search';
import { getAllCategories } from '@/lib/category';
import VpnPopup from '@/components/VpnPopup';

export const metadata: Metadata = {
  title: 'GoalCast – Free Live Sports TV Worldwide',
  description:
    'Browse live sports channels by country. Watch football, cricket, basketball, F1 and more – free, worldwide.',
};

/**
 * Home page — displays a responsive grid of all countries
 */
export default async function HomePage() {
  const countries = await getAllCountries();
  const categories = await getAllCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <section className="text-center mb-12" aria-labelledby="hero-heading">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 mb-4">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Live Sports — Worldwide
          </span>
        </div>
        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3"
        >
          Watch Sports{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            Live, Free
          </span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Choose a country to browse its sports channels and start watching instantly.
        </p>
      </section>

      {/* Recently Watched + Favorites — client-side, appears after hydration */}
      <HomePersonalSection allCountries={countries} />

      {/* VPN Warning Popup */}
      <VpnPopup />

      {/* Global Categories */}
      <section aria-labelledby="categories-heading" className="mb-8">
        <h2 id="categories-heading" className="sr-only">Categories</h2>
        <CategoryFilter categories={categories} baseUrl="/category" />
      </section>



      {/* Countries grid */}
      <section aria-labelledby="countries-heading">
        <div className="flex items-center gap-2 mb-6">
          <Globe2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
          <h2
            id="countries-heading"
            className="text-lg font-semibold text-zinc-800 dark:text-zinc-200"
          >
            All Countries ({countries.length})
          </h2>
        </div>

        {countries.length === 0 ? (
          <p className="text-center text-zinc-500 dark:text-zinc-400 py-16">
            No countries found.
          </p>
        ) : (
          <ul
            role="list"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {countries.map((country) => (
              <li key={country.code}>
                <CountryCard country={country} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* JSON-LD structured data for home page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'GoalCast',
            url: 'https://goalcast-tv.vercel.app',
            description: 'Free live sports TV channels worldwide',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://goalcast-tv.vercel.app/?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </div>
  );
}
