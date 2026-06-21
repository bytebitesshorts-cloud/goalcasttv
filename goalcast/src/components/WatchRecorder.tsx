'use client';

import { useEffect } from 'react';
import { useUserPrefs } from '@/context/UserPrefsContext';
import type { Channel } from '@/types';

/**
 * Invisible client component that records a channel visit to "Recently Watched"
 * when mounted. Drop this into any server component page.
 */
export default function WatchRecorder({ channel }: { channel: Channel }) {
  const { addRecent } = useUserPrefs();

  useEffect(() => {
    addRecent(channel);
  // only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id]);

  return null;
}
