'use client';

import { useState, useMemo } from 'react';
import type { Channel } from '@/types';
import ChannelCard from '@/components/ChannelCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Search } from 'lucide-react';

interface Props {
  channels: Channel[];
}

export default function CountryChannelGrid({ channels }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique categories available in this country
  const categoriesSet = new Set<string>();
  channels.forEach(ch => {
    if (ch.category) {
      const cat = ch.category.charAt(0).toUpperCase() + ch.category.slice(1);
      categoriesSet.add(cat);
    }
  });
  
  const categories = Array.from(categoriesSet).sort();
  // Move 'General' to end
  const genIdx = categories.indexOf('General');
  if (genIdx > -1) {
    categories.splice(genIdx, 1);
    categories.push('General');
  }

  // Ensure 'FIFA 2026' is absolute first
  const fifaIdx = categories.indexOf('FIFA 2026');
  if (fifaIdx > -1) {
    categories.splice(fifaIdx, 1);
  }
  categories.unshift('FIFA 2026');

  // Deduplicate channels by name (keep first occurrence)
  const deduplicatedChannels = useMemo(() => {
    const map = new Map<string, Channel>();
    channels.forEach(ch => {
      const normalizedName = ch.name.trim().toLowerCase();
      if (!map.has(normalizedName)) {
        map.set(normalizedName, ch);
      }
    });
    return Array.from(map.values());
  }, [channels]);

  // Filter channels based on category and search query
  const displayedChannels = useMemo(() => {
    let filtered = activeCategory === 'All'
      ? deduplicatedChannels
      : deduplicatedChannels.filter(ch => ch.category && ch.category.toLowerCase() === activeCategory.toLowerCase());

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(ch => ch.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [deduplicatedChannels, activeCategory, searchQuery]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        {/* Category Filters for this country */}
        {categories.length > 1 ? (
          <CategoryFilter 
            categories={categories} 
            activeCategory={activeCategory} 
            onSelectCategory={setActiveCategory} 
          />
        ) : <div />}

        {/* Search Bar for this country */}
        <div className="relative w-full sm:w-auto min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700/60 rounded-xl leading-5 bg-white dark:bg-zinc-900/60 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {displayedChannels.length === 0 ? (
        <p className="text-zinc-500 py-12 text-center">No channels found in this category.</p>
      ) : (
        <ul
          role="list"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {displayedChannels.map((channel) => (
            <li key={channel.id}>
              <ChannelCard channel={channel} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
