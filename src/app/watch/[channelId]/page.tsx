import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Signal } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import ChannelCard from '@/components/ChannelCard';
import ChannelLogo from '@/components/ChannelLogo';
import LiveViewerCount from '@/components/LiveViewerCount';
import CountryFlag from '@/components/CountryFlag';
import ServerSwitcher from '@/components/ServerSwitcher';
import { getChannel, getCountry, getAllChannels } from '@/lib/search';
import { slugify } from '@/lib/utils';
import WatchRecorder from '@/components/WatchRecorder';

interface Props {
  params: { channelId: string };
}

// Generate static params for all channels (SSG)
export async function generateStaticParams() {
  const channels = getAllChannels();
  return channels.map((c) => ({ channelId: c.id }));
}

// Dynamic metadata per channel
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const channel = getChannel(params.channelId);
  if (!channel) return { title: 'Channel Not Found' };

  return {
    title: `Watch ${channel.name} Live`,
    description: `Watch ${channel.name} live online — free sports streaming from ${channel.country} on GoalCast.`,
    openGraph: {
      title: `${channel.name} Live Stream | GoalCast`,
      description: `Watch ${channel.name} live — sports TV from ${channel.country}.`,
      images: [{ url: channel.logo, alt: channel.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${channel.name} Live Stream | GoalCast`,
      description: `Watch ${channel.name} live — sports TV from ${channel.country}.`,
    },
  };
}

/**
 * Watch page — HLS video player, channel info, related channels
 */
export default function WatchPage({ params }: Props) {
  const channel = getChannel(params.channelId);
  if (!channel) notFound();

  const country = getCountry(channel.country);
  // Related channels = all channels from same country in fixed positions
  const related = country?.channels ?? [];

  // Find alternative servers (channels with the same normalized name)
  const servers = (country?.channels ?? []).filter(
    (c) => c.name.trim().toLowerCase() === channel.name.trim().toLowerCase()
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Record this channel in Recently Watched (client-side, no SSR impact) */}
      <WatchRecorder channel={channel} />
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-6">
        <Link
          href="/"
          id="watch-back-home"
          className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200"
        >
          Home
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        {country && (
          <>
            <Link
              href={`/country/${slugify(channel.country)}`}
              className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200"
            >
              <CountryFlag code={country.code} name={channel.country} className="w-4.5 h-3 object-cover rounded-sm shadow-sm" />
              <span>{channel.country}</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
          </>
        )}
        <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-[160px]">
          {channel.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main: player + info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Player */}
          <VideoPlayer src={channel.stream} channelName={channel.name} />

          {/* Channel info */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 shadow-sm">
            {/* Logo */}
            <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 flex items-center justify-center">
              <ChannelLogo
                src={channel.logo}
                alt={`${channel.name} logo`}
                channelName={channel.name}
                className="w-full h-full object-contain p-1"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-zinc-900 dark:text-white truncate">
                  {channel.name}
                </h1>
                {channel.code && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/60">
                    {channel.code}
                  </span>
                )}
                {/* Live indicator */}
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500 text-white text-xs font-bold shrink-0">
                  <Signal className="w-3 h-3" aria-hidden="true" />
                  LIVE
                </span>
                {/* Real-time Viewer count */}
                <LiveViewerCount
                  channelId={channel.id}
                  className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50"
                />
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                {country && <CountryFlag code={country.code} name={channel.country} className="w-4.5 h-3 object-cover rounded-sm shadow-sm" />}
                <span>{channel.country}</span>
                {channel.quality && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
                    {channel.quality}
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 capitalize">
                Category: {channel.category}
              </p>
            </div>
          </div>

          {/* Alternative Servers */}
          {servers.length > 1 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Available Servers</h3>
              <ServerSwitcher servers={servers} currentId={channel.id} />
            </div>
          )}
        </div>

        {/* Sidebar: related channels */}
        <aside aria-labelledby="related-heading" className="space-y-4 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-2rem)] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-emerald-500 rotate-180" aria-hidden="true" />
            <h2
              id="related-heading"
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
            >
              More from {channel.country}
            </h2>
          </div>

          {related.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No other channels available.
            </p>
          ) : (
            <ul role="list" className="grid grid-cols-1 gap-3">
              {related.map((ch) => (
                <li key={ch.id}>
                  <ChannelCard channel={ch} isActive={ch.id === channel.id} />
                </li>
              ))}
            </ul>
          )}

          {/* Back to country */}
          {country && (
            <Link
              href={`/country/${slugify(channel.country)}`}
              className="
                block w-full text-center mt-2 py-2 px-4 rounded-xl
                border border-emerald-500/50 text-emerald-600 dark:text-emerald-400
                text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                transition-colors duration-200
              "
              id="view-all-country-channels"
            >
              <span className="flex items-center justify-center gap-1.5">
                <span>View all</span>
                <CountryFlag code={country.code} name={country.name} className="w-4.5 h-3 object-cover rounded-sm shadow-sm" />
                <span>channels</span>
              </span>
            </Link>
          )}
        </aside>
      </div>

      {/* JSON-LD: VideoObject schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: `${channel.name} Live Stream`,
            description: `Watch ${channel.name} live sports stream from ${channel.country}`,
            thumbnailUrl: channel.logo,
            uploadDate: new Date().toISOString().split('T')[0],
            contentUrl: channel.stream,
            embedUrl: `https://goalcast.live/watch/${channel.id}`,
            author: {
              '@type': 'Organization',
              name: 'GoalCast',
            },
            publication: {
              '@type': 'BroadcastEvent',
              isLiveBroadcast: true,
              startDate: new Date().toISOString(),
            },
          }),
        }}
      />
    </div>
  );
}
