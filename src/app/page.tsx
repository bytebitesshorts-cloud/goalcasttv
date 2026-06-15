import type { Metadata } from 'next';
import { Globe2, Tv2, Signal } from 'lucide-react';
import CountryCard from '@/components/CountryCard';
import HomePersonalSection from '@/components/HomePersonalSection';
import CategoryFilter from '@/components/CategoryFilter';
import { getAllCountries } from '@/lib/search';
import { getAllCategories } from '@/lib/category';
import VpnPopup from '@/components/VpnPopup';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'GoalCast – Free Live Sports TV Worldwide',
  description:
    'Browse live sports channels by country. Watch football, cricket, basketball, F1 and more – free, worldwide.',
};

/**
 * Home page — mobile app-like UI on small screens, grid on desktop
 */
export default async function HomePage() {
  const countries = await getAllCountries();
  const categories = await getAllCategories();

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Mobile Hero ── */}
      <div className="md:hidden">
        {/* Featured banner */}
        <div className="relative mx-4 mt-4 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900/80 via-zinc-900 to-indigo-900/60 border border-white/10 shadow-2xl">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[11px] font-bold shadow">
              <Signal className="w-3 h-3" />
              LIVE
            </span>
          </div>
          <div className="relative px-5 pt-20 pb-6">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">GoalCast</p>
            <h1 className="text-white text-2xl font-extrabold leading-tight mb-1">
              Watch Sports <span className="text-emerald-400">Live, Free</span>
            </h1>
            <p className="text-zinc-300 text-sm mb-5 leading-relaxed">
              {countries.length} countries · {categories.length} categories · 0 subscriptions
            </p>
            <Link
              href="/category/sports"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
            >
              <Tv2 className="w-4 h-4" />
              Watch Now
            </Link>
          </div>
        </div>

        {/* Categories horizontal scroll */}
        <div className="px-4 mt-5">
          <CategoryFilter categories={categories} baseUrl="/category" />
        </div>

        {/* Recently Watched + Favorites */}
        <div className="px-4">
          <HomePersonalSection allCountries={countries} />
        </div>

        {/* VPN Popup */}
        <VpnPopup />

        {/* Countries list */}
        <div className="px-4 mt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              All Countries
            </h2>
            <span className="text-xs text-zinc-500 font-medium">{countries.length} countries</span>
          </div>
          <ul role="list" className="space-y-2">
            {countries.map((country) => (
              <li key={country.code}>
                <CountryCard country={country} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Desktop layout (original) ── */}
      <div className="hidden md:block px-4 sm:px-6 lg:px-8 py-10">
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

        {/* Recently Watched + Favorites */}
        <HomePersonalSection allCountries={countries} />

        {/* VPN Popup */}
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

        {/* JSON-LD structured data */}
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
    </div>
  );
}

