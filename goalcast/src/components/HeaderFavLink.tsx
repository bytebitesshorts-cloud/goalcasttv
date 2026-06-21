'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useUserPrefs } from '@/context/UserPrefsContext';

/**
 * Favorites link button with live badge count — renders only after hydration.
 */
export default function HeaderFavLink() {
  const { favChannels, favCountryNames, mounted } = useUserPrefs();
  const count = favChannels.length + favCountryNames.length;

  return (
    <Link
      href="/favorites"
      id="header-favorites"
      className="
        relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl
        bg-red-50 hover:bg-red-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80
        border border-red-200 dark:border-zinc-800
        text-red-600 dark:text-red-400 dark:hover:text-red-300
        text-xs font-bold transition-all duration-200 shadow-sm
      "
      aria-label={`My Favorites${count > 0 ? ` (${count} saved)` : ''}`}
    >
      <Heart className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
      <span className="hidden sm:inline">Favorites</span>
      {mounted && count > 0 && (
        <span
          className="
            absolute -top-1.5 -right-1.5
            flex items-center justify-center
            min-w-[16px] h-4 px-1 rounded-full
            bg-red-500 text-white text-[10px] font-bold leading-none
            shadow-sm
          "
          aria-hidden="true"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
