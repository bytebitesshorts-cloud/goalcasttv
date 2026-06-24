'use client';

import Link from 'next/link';
import { Tv2, Calendar, BookOpen, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import HeaderFavLink from './HeaderFavLink';

/**
 * Sticky site header:
 * - Mobile: slim bar with logo (center) + search icon (right)
 * - Desktop: full nav unchanged
 */
export default function Header() {
  const pathname = usePathname();
  const [mobileSearch, setMobileSearch] = useState(false);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md">
      {/* ── Mobile header ── */}
      <div className="md:hidden">
        {mobileSearch ? (
          /* Expanded search mode */
          <div className="flex items-center gap-2.5 h-10 px-3">
            <div className="flex-1">
              <SearchBar autoFocus onBlur={() => setMobileSearch(false)} />
            </div>
            <button
              onClick={() => setMobileSearch(false)}
              className="text-zinc-500 text-xs font-medium shrink-0"
              aria-label="Close search"
            >
              Cancel
            </button>
          </div>
        ) : (
          /* Default slim mobile header */
          <div className="flex items-center justify-between h-10 px-3">
            {/* Left: Theme toggle */}
            <ThemeToggle />

            {/* Center: Logo */}
            <Link
              href="/"
              className="flex items-center gap-1 group absolute left-1/2 -translate-x-1/2"
              aria-label="GoalCast home"
            >
              <span className="relative">
                <Tv2 className="w-4.5 h-4.5 text-emerald-500 group-hover:scale-110 transition-transform duration-200" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              </span>
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                Goal<span className="text-emerald-500">Cast</span>
              </span>
            </Link>

            {/* Right: Search icon */}
            <button
              onClick={() => setMobileSearch(true)}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Desktop header ── */}
      <div className="hidden md:block max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <nav className="flex items-center gap-3 h-11" aria-label="Main navigation">
          {/* Logo */}
          <Link
            href="/"
            id="header-logo"
            className="flex items-center gap-1.5 shrink-0 group"
            aria-label="GoalCast home"
          >
            <span className="relative">
              <Tv2
                className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform duration-200"
                aria-hidden="true"
              />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </span>
            <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
              Goal<span className="text-emerald-500">Cast</span>
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xs sm:max-w-sm lg:max-w-md">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Link
              href="/watch/active"
              id="header-live-tv"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border border-red-200 dark:border-zinc-800 text-red-700 dark:text-red-400 dark:hover:text-red-300 text-[10px] font-bold transition-all duration-200 shadow-sm"
              aria-label="Live TV"
            >
              <span className="relative">
                <Tv2 className="w-3 h-3" aria-hidden="true" />
                <span className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-red-500 rounded-full animate-pulse" />
              </span>
              <span>Live TV</span>
            </Link>
            <HeaderFavLink />
            <Link
              href="/blog"
              id="header-blog"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border border-amber-200 dark:border-zinc-800 text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 text-[10px] font-bold transition-all duration-200 shadow-sm"
              aria-label="GoalCast Blog"
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Blog</span>
            </Link>
            <Link
              href="/schedule"
              id="header-schedule"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border border-emerald-200 dark:border-zinc-800 text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-[10px] font-bold transition-all duration-200 shadow-sm"
              aria-label="World Cup 2026 Schedule"
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">World Cup Schedule</span>
              <span className="sm:hidden">Schedule</span>
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}

