'use client';

import Link from 'next/link';
import type { Country } from '@/types';
import { slugify } from '@/lib/utils';
import CountryFlag from '@/components/CountryFlag';
import FavoriteButton from '@/components/FavoriteButton';

interface CountryCardProps {
  country: Country;
}

export default function CountryCard({ country }: CountryCardProps) {
  return (
    <div className="relative group">
      <Link
        href={`/country/${slugify(country.name)}`}
        id={`country-${country.code}`}
        className="
          group flex flex-col items-center gap-3 p-5 rounded-2xl
          bg-white dark:bg-zinc-900/60
          border border-zinc-200 dark:border-zinc-700/60
          shadow-sm hover:shadow-lg dark:hover:shadow-emerald-900/10
          hover:-translate-y-1 hover:border-emerald-400/60 dark:hover:border-emerald-500/40
          transition-all duration-300 ease-out
          cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
        "
        aria-label={`${country.name} - ${country.channels.length} sports channels`}
      >
        {/* Flag */}
        <div className="w-12 h-9 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 select-none">
          <CountryFlag
            code={country.code}
            name={country.name}
            className="w-full h-full object-cover rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800"
          />
        </div>

        {/* Country name */}
        <h3 className="text-sm font-semibold text-center text-zinc-800 dark:text-zinc-100 leading-tight">
          {country.name}
        </h3>

        {/* Channel count badge */}
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800/50">
          {country.channels.length} ch
        </span>
      </Link>

      {/* Favorite button — outside Link so it doesn't trigger navigation */}
      <FavoriteButton type="country" country={country} />
    </div>
  );
}
