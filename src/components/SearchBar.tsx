'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { searchAll } from '@/lib/search';
import type { SearchResult } from '@/types';
import { slugify, getSimulatedViewers, formatViewerCount } from '@/lib/utils';
import ChannelLogo from '@/components/ChannelLogo';
import CountryFlag from '@/components/CountryFlag';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Perform search when query changes
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const found = searchAll(query, 8);
    setResults(found);
    setIsOpen(found.length > 0);
    setActiveIndex(-1);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.type === 'country' && result.country) {
        router.push(`/country/${slugify(result.country.name)}`);
      } else if (result.type === 'channel' && result.channel) {
        router.push(`/watch/${result.channel.id}`);
      }
      setQuery('');
      setIsOpen(false);
    },
    [router]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearQuery = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-sm" role="search">
      {/* Input */}
      <div className="relative flex items-center">
        <Search
          className="absolute left-3 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          role="combobox"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search countries or channels..."
          autoComplete="off"
          aria-label="Search countries or channels"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls="search-dropdown"
          aria-activedescendant={
            activeIndex >= 0 ? `search-item-${activeIndex}` : undefined
          }
          className="
            w-full pl-9 pr-8 py-2 rounded-xl text-sm
            bg-zinc-100 dark:bg-zinc-800/80
            border border-zinc-200 dark:border-zinc-700
            text-zinc-900 dark:text-zinc-100
            placeholder:text-zinc-400 dark:placeholder:text-zinc-500
            focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
            transition-all duration-200
          "
        />
        {query && (
          <button
            onClick={clearQuery}
            aria-label="Clear search"
            className="absolute right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          id="search-dropdown"
          role="listbox"
          aria-label="Search results"
          className="
            absolute top-full left-0 right-0 mt-1 z-50
            bg-white dark:bg-zinc-900
            border border-zinc-200 dark:border-zinc-700
            rounded-xl shadow-xl overflow-hidden
            max-h-80 overflow-y-auto
          "
        >
          {results.map((result, idx) => (
            <button
              key={idx}
              id={`search-item-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left
                transition-colors duration-150
                ${idx === activeIndex
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'}
              `}
            >
              {result.type === 'country' && result.country ? (
                <>
                  <CountryFlag
                    code={result.country.code}
                    name={result.country.name}
                    className="w-6 h-4.5 object-cover rounded shadow-sm border border-zinc-100 dark:border-zinc-800"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {result.country.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {result.country.channels.length} channel
                      {result.country.channels.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    Country
                  </span>
                </>
              ) : result.type === 'channel' && result.channel ? (
                <>
                  <ChannelLogo
                    src={result.channel.logo}
                    alt={result.channel.name}
                    className="w-8 h-8 rounded object-contain bg-zinc-100 dark:bg-zinc-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                      <span>{result.channel.name}</span>
                      {result.channel.code && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                          {result.channel.code}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {result.countryName} • {formatViewerCount(getSimulatedViewers(result.channel.id))} watching
                    </p>
                  </div>
                  <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                    LIVE
                  </span>
                </>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
