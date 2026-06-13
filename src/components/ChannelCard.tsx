'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';
import type { Channel } from '@/types';
import ChannelLogo from '@/components/ChannelLogo';
import FavoriteButton from '@/components/FavoriteButton';
import { getSimulatedViewers, formatViewerCount } from '@/lib/utils';

interface ChannelCardProps {
  channel: Channel;
  isActive?: boolean;
}

export default function ChannelCard({ channel, isActive }: ChannelCardProps) {
  const viewerCount = getSimulatedViewers(channel.id);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  function handleNavigate(e: React.MouseEvent<HTMLAnchorElement>) {
    // Prevent Next.js from resetting the window scroll position
    e.preventDefault();
    router.push(`/watch/${channel.id}`, { scroll: false });
  }

  useEffect(() => {
    if (!isActive || !cardRef.current) return;

    // Delay scroll until after the page has fully painted to avoid
    // the jarring jump that happens when the channel page first loads.
    const timer = setTimeout(() => {
      const card = cardRef.current;
      if (!card) return;

      const container = card.closest('aside') || card.closest('.overflow-y-auto');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      // Position of card relative to the scrollable container
      const targetScrollTop =
        container.scrollTop +
        (cardRect.top - containerRect.top) -
        container.clientHeight / 2 +
        card.clientHeight / 2;

      // Only scroll if the active card is outside the visible area
      // (prevents unnecessary scroll when it's already visible)
      const cardTopRelative = cardRect.top - containerRect.top;
      const cardBottomRelative = cardRect.bottom - containerRect.top;
      const isVisible =
        cardTopRelative >= 0 && cardBottomRelative <= container.clientHeight;

      if (!isVisible) {
        container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isActive]);

  return (
    <div ref={cardRef} className="relative group">
      <Link
        href={`/watch/${channel.id}`}
        scroll={false}
        onClick={handleNavigate}
        id={`channel-${channel.id}`}
        className={`
          group flex flex-col items-center gap-3 p-4 rounded-2xl
          ${isActive
            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
            : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-700/60 shadow-sm hover:shadow-xl dark:hover:shadow-emerald-900/10 hover:-translate-y-1 hover:border-emerald-400/60 dark:hover:border-emerald-500/40'}
          transition-all duration-300 ease-out
          cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
          overflow-hidden
        `}
        aria-label={`Watch ${channel.name} live. ${formatViewerCount(viewerCount)} watching.`}
      >
        {/* Viewers badge (Top Left) */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900/80 dark:bg-zinc-950/80 backdrop-blur-sm text-zinc-200 dark:text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span className="text-[10px] font-semibold leading-none">{formatViewerCount(viewerCount)}</span>
        </div>

        {/* LIVE / PLAYING badge (Top Right) */}
        <div className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md ${isActive ? 'bg-emerald-500' : 'bg-red-500/90'} backdrop-blur-sm`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
          <span className="text-white text-[10px] font-bold leading-none">{isActive ? 'PLAYING' : 'LIVE'}</span>
        </div>

        {/* Logo */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700/50">
          <ChannelLogo
            src={channel.logo}
            alt={`${channel.name} logo`}
            channelName={channel.name}
            className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          />
          {isActive ? (
            /* Animated playing equalizer indicator overlay */
            <div className="absolute inset-0 bg-emerald-500/15 backdrop-blur-[0.5px] flex items-center justify-center">
              <div className="flex items-end gap-0.5 h-7">
                <span className="w-1 bg-emerald-500 rounded-full animate-eq-1" />
                <span className="w-1 bg-emerald-500 rounded-full animate-eq-2" />
                <span className="w-1 bg-emerald-500 rounded-full animate-eq-3" />
                <span className="w-1 bg-emerald-500 rounded-full animate-eq-4" />
              </div>
            </div>
          ) : (
            /* Play overlay on hover */
            <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-300 flex items-center justify-center">
              <Play className="w-6 h-6 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Name and Code */}
        <div className="w-full text-center">
          <h3 className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-tight line-clamp-2">
            {channel.name}
          </h3>
          {channel.code && (
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800/50">
              {channel.code}
            </span>
          )}
        </div>

        {/* Quality badge */}
        {channel.quality && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium border border-zinc-200 dark:border-zinc-700/50">
            {channel.quality}
          </span>
        )}
      </Link>

      {/* Favorite button — outside Link so it doesn't trigger navigation */}
      <FavoriteButton type="channel" channel={channel} />
    </div>
  );
}
