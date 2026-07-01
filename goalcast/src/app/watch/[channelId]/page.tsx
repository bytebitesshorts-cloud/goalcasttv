import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getChannel, getCountry, getAllCountries } from '@/lib/search';
import { getChannelsByCategory } from '@/lib/category';
import { slugify } from '@/lib/utils';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';
import WatchPageClient from '@/app/watch/[channelId]/WatchPageClient';

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

export default async function WatchPage({ params }: Props) {
  await connectDB();
  let channel = await getChannel(params.channelId);
  
  if (!channel && params.channelId.startsWith('slider-')) {
    const sliderIndex = parseInt(params.channelId.replace('slider-', ''), 10);
    const sliderStore = await Store.findOne({ key: 'slider' });
    const slides = sliderStore?.slider || [];
    const slide = slides[sliderIndex];
    if (slide && (slide.streamUrl || slide.embedCode)) {
      channel = {
        id: params.channelId,
        name: slide.title || 'Live Stream',
        url: slide.streamUrl || slide.embedCode,
        logo: slide.image || '',
        category: 'Sports',
        country: 'Global',
      } as any;
    }
  }

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
    midListAdAfterEvery: 2,
  };

  const country = await getCountry(channel.country);
  const servers = (country?.channels ?? []).filter(
    (c) => c.name.trim().toLowerCase() === channel.name.trim().toLowerCase()
  );

  const countriesData = await getAllCountries();
  const allChannelsRaw = countriesData.flatMap((c) => c.channels);
  
  const byName = new Map<string, typeof allChannelsRaw[0]>();
  for (const ch of allChannelsRaw) {
    if (ch.active === false) continue;
    const key = ch.name.trim().toLowerCase();
    const existing = byName.get(key);
    if (!existing || (!existing.logo && ch.logo)) {
      byName.set(key, ch);
    }
  }
  const allChannels = Array.from(byName.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <>
      <WatchPageClient
        channel={channel}
        country={country}
        allChannels={allChannels}
        servers={servers}
        adConfig={adConfig}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BroadcastEvent',
            name: `${channel.name} Live Stream`,
            description: `Live sports broadcast of ${channel.name} from ${channel.country}`,
            isLiveBroadcast: true,
            videoFormat: 'HD',
            broadcastOfEvent: {
              '@type': 'Event',
              name: `${channel.name} Live Broadcast`,
            },
            video: {
              '@type': 'VideoObject',
              name: `${channel.name} Live`,
              description: `Watch ${channel.name} live online`,
              thumbnailUrl: channel.logo || 'https://goalcast-tv.vercel.app/og-image.png',
              uploadDate: new Date().toISOString(),
              contentUrl: (channel as any).url || channel.stream || '',
              embedUrl: `https://goalcast-tv.vercel.app/watch/${channel.id}`,
            },
          }),
        }}
      />
    </>
  );
}
