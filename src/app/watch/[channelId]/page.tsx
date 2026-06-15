import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Signal } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import ChannelCard from '@/components/ChannelCard';
import ChannelLogo from '@/components/ChannelLogo';
import CountryFlag from '@/components/CountryFlag';
import ShareButton from '@/components/ShareButton';
import ServerSwitcher from '@/components/ServerSwitcher';
import { getChannel, getCountry, getAllChannels } from '@/lib/search';
import { getChannelsByCategory } from '@/lib/category';
import { slugify } from '@/lib/utils';
import WatchRecorder from '@/components/WatchRecorder';
import SidebarAd from '@/components/SidebarAd';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';

interface Props {
  params: { channelId: string };
}

export const dynamic = 'force-dynamic';

// Dynamic metadata per channel
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const channel = await getChannel(params.channelId);
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
export default async function WatchPage({ params }: Props) {
  const channel = await getChannel(params.channelId);
  if (!channel) notFound();

  await connectDB();
  const adsStore = await Store.findOne({ key: 'ads' });
  const adConfig = adsStore?.data || { enabled: false, type: 'custom', customHtml: '', adsenseClientId: '', adsenseSlotId: '' };

  const country = await getCountry(channel.country);
  // Related channels = all channels from same country in fixed positions
  const relatedCountry = (country?.channels ?? []).filter(c => c.id !== channel.id);

  const categoryChannelsRaw = await getChannelsByCategory(channel.category);
  const relatedCategory = categoryChannelsRaw.filter(c => c.id !== channel.id && !relatedCountry.some(rc => rc.id === c.id));

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
          {/* Player (Sticky on mobile) */}
          <div className="sticky top-16 z-30 -mx-4 px-4 bg-zinc-50 dark:bg-zinc-950 sm:static sm:mx-0 sm:px-0 sm:z-auto sm:bg-transparent dark:sm:bg-transparent">
            <VideoPlayer src={channel.stream} channelName={channel.name} embedCode={channel.embedCode} />
          </div>

          {/* Channel info */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 shadow-sm">
            {/* Logo */}
            <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 flex items-center justify-center">
              <ChannelLogo
                src={channel.logo}
                alt={`${channel.name} logo`}
                channelName={channel.name}
                className="w-full h-full object-contain p-1"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                    {channel.name}
                  </h1>
                  {channel.code && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/60">
                      {channel.code}
                    </span>
                  )}
                  {/* Live indicator */}
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded md bg-red-500 text-white text-[10px] font-bold shrink-0">
                    <Signal className="w-2.5 h-2.5" aria-hidden="true" />
                    LIVE
                  </span>
                </div>
                
                <ShareButton />
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                {country && <CountryFlag code={country.code} name={channel.country} className="w-4 h-3 object-cover rounded-sm shadow-sm" />}
                <span>{channel.country}</span>
                {channel.quality && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
                    {channel.quality}
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500 capitalize">
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
          
          <SidebarAd adConfig={adConfig} />

          {/* Related by Country */}
          {relatedCountry.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 text-emerald-500 rotate-180" aria-hidden="true" />
                <h2
                  id="related-heading"
                  className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  More from {channel.country}
                </h2>
              </div>
              <ul role="list" className="grid grid-cols-1 gap-3">
                {relatedCountry.slice(0, 10).map((ch) => (
                  <li key={ch.id}>
                    <ChannelCard channel={ch} isActive={false} />
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Related by Category */}
          {relatedCategory.length > 0 && (
            <>
              <div className={`flex items-center gap-2 ${relatedCountry.length > 0 ? 'mt-6' : ''}`}>
                <ArrowLeft className="w-4 h-4 text-emerald-500 rotate-180" aria-hidden="true" />
                <h2
                  className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 capitalize"
                >
                  More {channel.category} Channels
                </h2>
              </div>
              <ul role="list" className="grid grid-cols-1 gap-3">
                {relatedCategory.slice(0, 10).map((ch) => (
                  <li key={ch.id}>
                    <ChannelCard channel={ch} isActive={false} />
                  </li>
                ))}
              </ul>
            </>
          )}

          {relatedCountry.length === 0 && relatedCategory.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No other channels available.
            </p>
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
            embedUrl: `https://goalcast-tv.vercel.app/watch/${channel.id}`,
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
