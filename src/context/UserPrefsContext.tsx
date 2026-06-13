'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Channel } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserPrefsContextType {
  // Recently Watched
  recentChannels: Channel[];
  addRecent: (channel: Channel) => void;
  clearRecents: () => void;

  // Favorite Channels
  favChannelIds: Set<string>;
  toggleFavChannel: (channel: Channel) => void;
  isFavChannel: (id: string) => boolean;
  favChannels: Channel[];

  // Favorite Countries
  favCountryCodes: Set<string>;
  toggleFavCountry: (country: { name: string; code: string }) => void;
  isFavCountry: (code: string) => boolean;
  favCountryNames: string[];

  // Hydration
  mounted: boolean;
}

const UserPrefsContext = createContext<UserPrefsContextType>({
  recentChannels: [],
  addRecent: () => {},
  clearRecents: () => {},
  favChannelIds: new Set(),
  toggleFavChannel: () => {},
  isFavChannel: () => false,
  favChannels: [],
  favCountryCodes: new Set(),
  toggleFavCountry: () => {},
  isFavCountry: () => false,
  favCountryNames: [],
  mounted: false,
});

// ─── Storage keys ─────────────────────────────────────────────────────────────
const KEY_RECENTS = 'goalcast-recents';
const KEY_FAV_CHANNELS = 'goalcast-fav-channels';
const KEY_FAV_COUNTRIES = 'goalcast-fav-countries';
const MAX_RECENTS = 10;

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserPrefsProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [recentChannels, setRecentChannels] = useState<Channel[]>([]);
  const [favChannels, setFavChannels] = useState<Channel[]>([]);
  const [favCountryNames, setFavCountryNames] = useState<string[]>([]);

  // Derived sets for O(1) lookups
  const favChannelIds = new Set(favChannels.map((c) => c.id));
  const favCountryCodes = new Set(
    favCountryNames.map((n) => n.toLowerCase().replace(/\s+/g, '-'))
  );

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const r = localStorage.getItem(KEY_RECENTS);
      if (r) setRecentChannels(JSON.parse(r));
      const fc = localStorage.getItem(KEY_FAV_CHANNELS);
      if (fc) setFavChannels(JSON.parse(fc));
      const fco = localStorage.getItem(KEY_FAV_COUNTRIES);
      if (fco) setFavCountryNames(JSON.parse(fco));
    } catch {
      // ignore parse errors
    }
    setMounted(true);
  }, []);

  // ── Recents ──────────────────────────────────────────────────────────────────
  const addRecent = useCallback((channel: Channel) => {
    setRecentChannels((prev) => {
      const filtered = prev.filter((c) => c.id !== channel.id);
      const next = [channel, ...filtered].slice(0, MAX_RECENTS);
      try { localStorage.setItem(KEY_RECENTS, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecentChannels([]);
    try { localStorage.removeItem(KEY_RECENTS); } catch {}
  }, []);

  // ── Fav Channels ─────────────────────────────────────────────────────────────
  const toggleFavChannel = useCallback((channel: Channel) => {
    setFavChannels((prev) => {
      const exists = prev.some((c) => c.id === channel.id);
      const next = exists
        ? prev.filter((c) => c.id !== channel.id)
        : [...prev, channel];
      try { localStorage.setItem(KEY_FAV_CHANNELS, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isFavChannel = useCallback(
    (id: string) => favChannelIds.has(id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [favChannels]
  );

  // ── Fav Countries ────────────────────────────────────────────────────────────
  const toggleFavCountry = useCallback((country: { name: string; code: string }) => {
    setFavCountryNames((prev) => {
      const exists = prev.includes(country.name);
      const next = exists
        ? prev.filter((n) => n !== country.name)
        : [...prev, country.name];
      try { localStorage.setItem(KEY_FAV_COUNTRIES, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isFavCountry = useCallback(
    (code: string) => favCountryCodes.has(code),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [favCountryNames]
  );

  return (
    <UserPrefsContext.Provider
      value={{
        recentChannels,
        addRecent,
        clearRecents,
        favChannelIds,
        toggleFavChannel,
        isFavChannel,
        favChannels,
        favCountryCodes,
        toggleFavCountry,
        isFavCountry,
        favCountryNames,
        mounted,
      }}
    >
      {children}
    </UserPrefsContext.Provider>
  );
}

export function useUserPrefs() {
  return useContext(UserPrefsContext);
}
