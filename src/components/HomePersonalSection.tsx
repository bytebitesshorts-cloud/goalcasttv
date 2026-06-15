// HomePersonalSection.tsx
// Simplified version without country list display.

'use client';

import Link from 'next/link';
import { Clock, Heart, Trash2 } from 'lucide-react';
import { useUserPrefs } from '@/context/UserPrefsContext';
import ChannelCard from '@/components/ChannelCard';
import { slugify } from '@/lib/utils';
import type { Country } from '@/types';

interface Props {
  allCountries: Country[];
}

/**
 * Client-side section shown above the main grid on the homepage.
 * Shows Recently Watched channels and Favorited channels.
 * Only renders after hydration to avoid SSR mismatch.
 */
export default function HomePersonalSection({ allCountries }: Props) {
  const {
    recentChannels,
    clearRecents,
    favChannels,
    // favCountryNames, // removed
    mounted,
  } = useUserPrefs();

  // Don't render until localStorage is loaded
  if (!mounted) return null;

  const hasRecents = recentChannels.length > 0;
  const hasFavChannels = favChannels.length > 0;
  const hasFavs = hasFavChannels; // only channels now

  if (!hasRecents && !hasFavs) return null;

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
              <div key={channel.id} className="shrink-0 w-36 snap-start">
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
              {favChannels.length}
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
                  <Heart className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
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
          </div>
        </section>
      )}

      {/* Divider before the main grid */}
      <div className="border-t border-zinc-200 dark:border-zinc-800" />
    </div>
  );
}
