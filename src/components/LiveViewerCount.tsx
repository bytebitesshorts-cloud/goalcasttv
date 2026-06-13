'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { getSimulatedViewers, formatViewerCount } from '@/lib/utils';

interface LiveViewerCountProps {
  channelId: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * Client Component for rendering live simulated viewers.
 * Periodically updates the count to simulate dynamic activity.
 */
export default function LiveViewerCount({
  channelId,
  className = '',
  showIcon = true,
}: LiveViewerCountProps) {
  const [viewers, setViewers] = useState<number>(() => getSimulatedViewers(channelId));

  useEffect(() => {
    // Update viewer count every 10 seconds to make it feel "live"
    const interval = setInterval(() => {
      setViewers(getSimulatedViewers(channelId));
    }, 10000);

    return () => clearInterval(interval);
  }, [channelId]);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} aria-live="polite">
      {showIcon && <Users className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />}
      <span className="font-semibold">{formatViewerCount(viewers)}</span>
      <span className="text-zinc-500 dark:text-zinc-400">watching</span>
    </span>
  );
}
