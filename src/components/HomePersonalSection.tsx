'use client';

import Link from 'next/link';
import { Clock, Heart, Globe2, Tv2, Trash2 } from 'lucide-react';
import { useUserPrefs } from '@/context/UserPrefsContext';
import ChannelCard from '@/components/ChannelCard';
import CountryFlag from '@/components/CountryFlag';
import { slugify } from '@/lib/utils';
import { getAllCountries } from '@/lib/search';

/**
 * Client-side section shown above the main grid on the homepage.
 * Shows Recently Watched channels and Favorited channels + countries.
 * Only renders after hydration to avoid SSR mismatch.
 */
export default function HomePersonalSection() {
  const {
    recentChannels,
    clearRecents,
    favChannels,
    favCountryNames,
    mounted,
  } = useUserPrefs();

  // Don't render until localStorage is loaded
  if (!mounted) return null;

  const hasRecents = recentChannels.length > 0;
  const hasFavChannels = favChannels.length > 0;
  const hasFavCountries = favCountryNames.length > 0;
  const hasFavs = hasFavChannels || hasFavCountries;

  if (!hasRecents && !hasFavs) return null;

  // Resolve favorited countries to full Country objects for the flag + link
  const allCountries = getAllCountries();
  const favCountries = allCountries.filter((c) => favCountryNames.includes(c.name));

  return (
    <div className="space-y-8 mb-10">
      {/* ── Recently Watched ─────────────────────────────────────────────── */}
      {hasRecents && (
        <section aria-labelledby="recents-heading">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" aria-hidden="true" />
              <h2
                id="recents-heading"
                className="text-lg font-semibold text-zinc-800 dark:text-zinc-200"
              >
                Recently Watched
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 font-medium">
                {recentChannels.length}
              </span>
            </div>
            <button
              onClick={clearRecents}
              aria-label="Clear recently watched history"
              title="Clear history"
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear</span>
            </button>
          </div>

          {/* Horizontal scroll row */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {recentChannels.map((channel) => (
              <div
                key={channel.id}
                className="shrink-0 w-36 snap-start"
              >
                <ChannelCard channel={channel} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Favorites ────────────────────────────────────────────────────── */}
      {hasFavs && (
        <section aria-labelledby="favorites-heading">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500 fill-current" aria-hidden="true" />
            <h2
              id="favorites-heading"
              className="text-lg font-semibold text-zinc-800 dark:text-zinc-200"
            >
              My Favorites
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 font-medium">
              {favChannels.length + favCountries.length}
            </span>
            <Link
              href="/favorites"
              className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              id="favorites-view-all"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {/* Favorited Channels */}
            {hasFavChannels && (
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Tv2 className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Channels
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {favChannels.map((channel) => (
                    <div key={channel.id} className="shrink-0 w-36 snap-start">
                      <ChannelCard channel={channel} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorited Countries */}
            {hasFavCountries && (
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Globe2 className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Countries
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {favCountries.map((country) => (
                    <Link
                      key={country.code}
                      href={`/country/${slugify(country.name)}`}
                      id={`fav-country-${country.code}`}
                      className="
                        flex items-center gap-2 px-3 py-2 rounded-xl
                        bg-white dark:bg-zinc-900/60
                        border border-zinc-200 dark:border-zinc-700/60
                        hover:border-emerald-400/60 dark:hover:border-emerald-500/40
                        hover:-translate-y-0.5 hover:shadow-md
                        transition-all duration-200
                        text-sm font-medium text-zinc-700 dark:text-zinc-200
                      "
                    >
                      <CountryFlag
                        code={country.code}
                        name={country.name}
                        className="w-6 h-4 object-cover rounded shadow-sm border border-zinc-100 dark:border-zinc-800"
                      />
                      <span>{country.name}</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {country.channels.length}ch
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Divider before the main grid */}
      <div className="border-t border-zinc-200 dark:border-zinc-800" />
    </div>
  );
}
