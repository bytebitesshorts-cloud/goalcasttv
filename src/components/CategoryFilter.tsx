'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CategoryFilterProps {
  categories: string[];
  // If true, it uses client-side state for active category (for country page)
  // If false, it acts as links (for homepage)
  baseUrl?: string; 
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  // Explicit href for 'All' link when using baseUrl (e.g., '/')
  allHref?: string;
}

export default function CategoryFilter({ categories, baseUrl, activeCategory, onSelectCategory, allHref = '/' }: CategoryFilterProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-hide snap-x">
      {/* "All" button */}
      {baseUrl ? (
        <Link
          href={allHref}
          className={`
            shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap snap-start
            transition-all duration-200 border
            ${pathname === allHref
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
              : 'bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60 hover:border-emerald-400/60 dark:hover:border-emerald-500/40'
            }
          `}
        >
          🌐 All
        </Link>
      ) : (
        <button
          onClick={() => onSelectCategory?.('All')}
          className={`
            shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap snap-start
            transition-all duration-200 border
            ${activeCategory === 'All' || !activeCategory
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
              : 'bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60 hover:border-emerald-400/60 dark:hover:border-emerald-500/40'
            }
          `}
        >
          🌐 All
        </button>
      )}

      {/* Category buttons */}
      {categories.map((cat) => {
        const isActive = baseUrl ? pathname === `${baseUrl}/${cat.toLowerCase()}` : activeCategory === cat;
        
        // Emojis for common categories
        let emoji = '';
        const lower = cat.toLowerCase();
        if (lower === 'sports') emoji = '🏈 ';
        if (lower === 'movies') emoji = '🎬 ';
        if (lower === 'music') emoji = '🎵 ';
        if (lower === 'news') emoji = '📰 ';
        if (lower === 'kids') emoji = '🧸 ';
        if (lower === 'entertainment') emoji = '🎭 ';
        if (lower === 'documentary') emoji = '🌍 ';
        
        if (baseUrl) {
          return (
            <Link
              key={cat}
              href={`${baseUrl}/${cat.toLowerCase()}`}
              className={`
                shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap snap-start
                transition-all duration-200 border
                ${isActive
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60 hover:border-emerald-400/60 dark:hover:border-emerald-500/40'
                }
              `}
            >
              {emoji}{cat}
            </Link>
          );
        }

        return (
          <button
            key={cat}
            onClick={() => onSelectCategory?.(cat)}
            className={`
              shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap snap-start
              transition-all duration-200 border
              ${isActive
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60 hover:border-emerald-400/60 dark:hover:border-emerald-500/40'
              }
            `}
          >
            {emoji}{cat}
          </button>
        );
      })}
    </div>
  );
}
