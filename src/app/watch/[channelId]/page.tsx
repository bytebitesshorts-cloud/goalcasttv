import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getChannel, getCountry, getAllChannels } from '@/lib/search';
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
  const relatedCountry = (country?.channels ?? []).filter((c) => c.id !== channel.id);
  const categoryChannelsRaw = await getChannelsByCategory(channel.category);
  const relatedCategory = categoryChannelsRaw.filter(
    (c) => c.id !== channel.id && !relatedCountry.some((rc) => rc.id === c.id)
  );
  const servers = (country?.channels ?? []).filter(
    (c) => c.name.trim().toLowerCase() === channel.name.trim().toLowerCase()
  );

  return (
    <WatchPageClient
      channel={channel}
      country={country}
      relatedCountry={relatedCountry}
      relatedCategory={relatedCategory}
      servers={servers}
      adConfig={adConfig}
    />
  );
}
