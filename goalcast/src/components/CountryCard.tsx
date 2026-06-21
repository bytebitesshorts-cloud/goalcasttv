'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Country } from '@/types';
import { slugify } from '@/lib/utils';
import CountryFlag from '@/components/CountryFlag';
import FavoriteButton from '@/components/FavoriteButton';

interface CountryCardProps {
  country: Country;
}

export default function CountryCard({ country }: CountryCardProps) {
  const href = `/country/${slugify(country.name)}`;
  const label = `${country.name} - ${country.channels.length} sports channels`;

  return (
    <div className="relative group">
      {/* ── Mobile: horizontal list item ── */}
      <Link
        href={href}
        id={`country-${country.code}`}
        aria-label={label}
        className="
          md:hidden flex items-center gap-3 px-4 py-3 rounded-2xl
          bg-white/5 dark:bg-white/5 border border-white/8 dark:border-white/8
          hover:bg-white/10 active:scale-[0.98]
          transition-all duration-200 w-full
        "
      >
        {/* Flag */}
        <div className="w-10 h-7 shrink-0 rounded-lg overflow-hidden border border-white/10 shadow">
          <CountryFlag
            code={country.code}
            name={country.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name */}
        <span className="flex-1 text-sm font-semibold text-zinc-100 leading-tight truncate">
          {country.name}
        </span>

        {/* Channel count */}
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/20 shrink-0">
          {country.channels.length}
        </span>

        <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" aria-hidden="true" />
      </Link>

      {/* ── Desktop: original grid card ── */}
      <Link
        href={href}
        aria-label={label}
        className="
          hidden md:flex flex-col items-center gap-3 p-5 rounded-2xl
          bg-white dark:bg-zinc-900/60
          border border-zinc-200 dark:border-zinc-700/60
          shadow-sm hover:shadow-lg dark:hover:shadow-emerald-900/10
          hover:-translate-y-1 hover:border-emerald-400/60 dark:hover:border-emerald-500/40
          transition-all duration-300 ease-out
          cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
        "
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

