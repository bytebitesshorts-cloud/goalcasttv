'use client';

import Link from 'next/link';
import { Tv2, Calendar, BookOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import HeaderFavLink from './HeaderFavLink';

/**
 * Sticky site header with logo, search bar, and theme toggle
 */
export default function Header() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-4 h-16" aria-label="Main navigation">
          {/* Logo */}
          <Link
            href="/"
            id="header-logo"
            className="flex items-center gap-2 shrink-0 group"
            aria-label="GoalCast home"
          >
            <span className="relative">
              <Tv2
                className="w-7 h-7 text-emerald-500 group-hover:scale-110 transition-transform duration-200"
                aria-hidden="true"
              />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            </span>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Goal<span className="text-emerald-500">Cast</span>
            </span>
          </Link>

          {/* Search — grows to fill space */}
          <div className="flex-1 max-w-sm sm:max-w-md lg:max-w-lg">
            <SearchBar />
          </div>

          {/* Actions: Favorites + Schedule link + Theme toggle */}
          <div className="ml-auto flex items-center gap-2.5 shrink-0">
            <HeaderFavLink />
            <Link
              href="/blog"
              id="header-blog"
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                bg-amber-50 hover:bg-amber-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80
                border border-amber-200 dark:border-zinc-800
                text-amber-700 dark:text-amber-400 dark:hover:text-amber-300
                text-xs font-bold transition-all duration-200 shadow-sm
              "
              aria-label="GoalCast Blog"
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Blog</span>
            </Link>
            <Link
              href="/schedule"
              id="header-schedule"
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                bg-emerald-50 hover:bg-emerald-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80
                border border-emerald-200 dark:border-zinc-800
                text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300
                text-xs font-bold transition-all duration-200 shadow-sm
              "
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
