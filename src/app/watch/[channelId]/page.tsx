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
import GoogleAd from '@/components/GoogleAd';
import MidListAd from '@/components/MidListAd';
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
  const adConfig = adsStore?.data || {
    enabled: false,
    type: 'custom',
    customHtml: '',
    adsenseClientId: '',
    adsenseSlotId: '',
    midListAdEnabled: false,
    midListAdType: 'adsense',
    midListAdHtml: '',
    midListAdAfterEvery: 5,
  };

  const country = await getCountry(channel.country);
  // Related channels = all channels from same country
  const relatedCountry = (country?.channels ?? []).filter(c => c.id !== channel.id);

  const categoryChannelsRaw = await getChannelsByCategory(channel.category);
  const relatedCategory = categoryChannelsRaw.filter(
    c => c.id !== channel.id && !relatedCountry.some(rc => rc.id === c.id)
  );

  // Alternative servers (same normalised name)
  const servers = (country?.channels ?? []).filter(
    (c) => c.name.trim().toLowerCase() === channel.name.trim().toLowerCase()
  );

  // Helper: inject mid-list ad after every N channels
  const injectAds = (channels: typeof relatedCountry, adConf: typeof adConfig) => {
    const n = adConf.midListAdAfterEvery ?? 5;
    const result: { type: 'channel' | 'ad'; channel?: typeof channels[0]; key: string }[] = [];
    channels.forEach((ch, i) => {
      result.push({ type: 'channel', channel: ch, key: ch.id });
      if ((i + 1) % n === 0) {
        result.push({ type: 'ad', key: `ad-${i}` });
      }
    });
    return result;
  };

  const countryItems = injectAds(relatedCountry.slice(0, 12), adConfig);
  const categoryItems = injectAds(relatedCategory.slice(0, 12), adConfig);

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
      {/* Record this channel in Recently Watched (client-side, no SSR impact) */}
      <WatchRecorder channel={channel} />

      {/* Breadcrumb — hidden on mobile */}
      <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-sm mb-4">
        <Link href="/" id="watch-back-home" className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors">
          Home
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        {country && (
          <>
            <Link href={`/country/${slugify(channel.country)}`} className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors">
              <CountryFlag code={country.code} name={channel.country} className="w-4.5 h-3 object-cover rounded-sm shadow-sm" />
              <span>{channel.country}</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
          </>
        )}
        <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-[160px]">{channel.name}</span>
      </nav>

      {/* Main grid: player 62% | sidebar 38% on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[62%_38%] gap-4 lg:gap-6">

        {/* ── LEFT: Player + info ── */}
        <div className="space-y-3 lg:space-y-4">
          {/* Player */}
          <div className="sticky top-14 z-30 -mx-3 px-3 bg-zinc-50 dark:bg-zinc-950 sm:static sm:mx-0 sm:px-0 sm:z-auto sm:bg-transparent dark:sm:bg-transparent">
            <VideoPlayer src={channel.stream} channelName={channel.name} embedCode={channel.embedCode} />
          </div>

          {/* Google Ad — below player on mobile only */}
          <div className="lg:hidden">
            <GoogleAd />
          </div>

          {/* Channel info */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 shadow-sm">
            <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 flex items-center justify-center">
              <ChannelLogo src={channel.logo} alt={`${channel.name} logo`} channelName={channel.name} className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-bold text-zinc-900 dark:text-white truncate">{channel.name}</h1>
                  {channel.code && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/60">
                      {channel.code}
                    </span>
                  )}
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold shrink-0">
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
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Available Servers</h3>
              <ServerSwitcher servers={servers} currentId={channel.id} />
            </div>
          )}

          {/* Mobile: Related channels horizontal scroll */}
          <div className="lg:hidden">
            {relatedCountry.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">More from {channel.country}</h2>
                  {country && (
                    <Link href={`/country/${slugify(channel.country)}`} className="text-xs text-emerald-500 font-medium">
                      View all
                    </Link>
                  )}
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
                  {relatedCountry.slice(0, 10).map(ch => (
                    <div key={ch.id} className="shrink-0 w-32 snap-start">
                      <ChannelCard channel={ch} isActive={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {relatedCategory.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 capitalize">More {channel.category}</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
                  {relatedCategory.slice(0, 10).map(ch => (
                    <div key={ch.id} className="shrink-0 w-32 snap-start">
                      <ChannelCard channel={ch} isActive={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Sidebar — desktop only ── */}
        <aside
          aria-labelledby="related-heading"
          className="hidden lg:block space-y-4 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-2rem)] overflow-y-auto pr-1 custom-scrollbar"
        >
          <SidebarAd adConfig={adConfig} />

          {/* Related by Country */}
          {relatedCountry.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 text-emerald-500 rotate-180" aria-hidden="true" />
                <h2 id="related-heading" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  More from {channel.country}
                </h2>
              </div>
              <ul role="list" className="grid grid-cols-1 gap-2">
                {countryItems.map(item =>
                  item.type === 'ad' ? (
                    <MidListAd key={item.key} adConfig={adConfig} />
                  ) : (
                    <li key={item.key}>
                      <ChannelCard channel={item.channel!} isActive={false} />
                    </li>
                  )
                )}
              </ul>
            </>
          )}

          {/* Related by Category */}
          {relatedCategory.length > 0 && (
            <>
              <div className={`flex items-center gap-2 ${relatedCountry.length > 0 ? 'mt-6' : ''}`}>
                <ArrowLeft className="w-4 h-4 text-emerald-500 rotate-180" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 capitalize">
                  More {channel.category} Channels
                </h2>
              </div>
              <ul role="list" className="grid grid-cols-1 gap-2">
                {categoryItems.map(item =>
                  item.type === 'ad' ? (
                    <MidListAd key={item.key} adConfig={adConfig} />
                  ) : (
                    <li key={item.key}>
                      <ChannelCard channel={item.channel!} isActive={false} />
                    </li>
                  )
                )}
              </ul>
            </>
          )}

          {relatedCountry.length === 0 && relatedCategory.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No other channels available.</p>
          )}

          {/* Back to country */}
          {country && (
            <Link
              href={`/country/${slugify(channel.country)}`}
              className="block w-full text-center mt-2 py-2 px-4 rounded-xl border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
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
            author: { '@type': 'Organization', name: 'GoalCast' },
            publication: { '@type': 'BroadcastEvent', isLiveBroadcast: true, startDate: new Date().toISOString() },
          }),
        }}
      />
    </div>
  );
}


