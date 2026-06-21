'use client';

import { Heart, Globe2, Tv2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useUserPrefs } from '@/context/UserPrefsContext';
import ChannelCard from '@/components/ChannelCard';
import CountryCard from '@/components/CountryCard';
import type { Country } from '@/types';

interface Props {
  allCountries: Country[];
}

/**
 * /favorites — full-page view of all favorited channels and countries
 */
export default function FavoritesList({ allCountries }: Props) {
  const { favChannels, favCountryNames, mounted } = useUserPrefs();
  const favCountries = mounted
    ? allCountries.filter((c) => favCountryNames.includes(c.name))
    : [];

  const hasFavChannels = favChannels.length > 0;
  const hasFavCountries = favCountries.length > 0;
  const isEmpty = !mounted || (!hasFavChannels && !hasFavCountries);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200 mb-4"
          id="favorites-back-home"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to home
        </Link>

        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50">
            <Heart className="w-5 h-5 text-red-500 fill-current" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              My Favorites
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Your saved channels and countries
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40">
            <Heart className="w-10 h-10 text-red-300 dark:text-red-700" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              No favorites yet
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              Tap the{' '}
              <Heart className="inline w-3.5 h-3.5 text-red-400 fill-current mx-0.5" aria-hidden="true" />
              {' '}heart button on any channel or country card to save it here.
            </p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors duration-200 shadow-sm"
            id="favorites-browse"
          >
            Browse Channels
          </Link>
        </div>
      )}

      {/* Favorite Channels */}
      {hasFavChannels && (
        <section aria-labelledby="fav-channels-heading" className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Tv2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            <h2
              id="fav-channels-heading"
              className="text-lg font-semibold text-zinc-800 dark:text-zinc-200"
            >
              Channels
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 font-medium">
              {favChannels.length}
            </span>
          </div>
          <ul
            role="list"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {favChannels.map((channel) => (
              <li key={channel.id}>
                <ChannelCard channel={channel} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Favorite Countries */}
      {hasFavCountries && (
        <section aria-labelledby="fav-countries-heading">
          <div className="flex items-center gap-2 mb-6">
            <Globe2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            <h2
              id="fav-countries-heading"
              className="text-lg font-semibold text-zinc-800 dark:text-zinc-200"
            >
              Countries
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 font-medium">
              {favCountries.length}
            </span>
          </div>
          <ul
            role="list"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {favCountries.map((country) => (
              <li key={country.code}>
                <CountryCard country={country} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
