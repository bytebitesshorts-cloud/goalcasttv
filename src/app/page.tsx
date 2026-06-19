import type { Metadata } from 'next';
import { Tv2, Trophy, Activity } from 'lucide-react';
import SliderTemplate from '@/components/SliderTemplate';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';
import VpnPopup from '@/components/VpnPopup';
import Link from 'next/link';
import { getAllCountries } from '@/lib/search';
import ChannelLogoImg from '@/components/ChannelLogoImg';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'GoalCast – Free Live Sports TV Worldwide',
  description: 'Browse live sports channels by country. Watch football, cricket, basketball, F1 and more – free, worldwide.',
};

/**
 * Home page — mobile app-like UI on small screens, grid on desktop
 */
export default async function HomePage() {
  await connectDB();
  
  // 1. Fetch Slider
  const sliderStore = await Store.findOne({ key: 'slider' });
  const slides = sliderStore?.slider || [];

  // 2. Fetch all channels and flatten them (A to Z)
  const countries = await getAllCountries();
  const allChannels = countries.flatMap((c) => c.channels);
  
  // Deduplicate by normalised name (channels often stored under multiple countries)
  // Prefer the entry that has a logo URL when there's a collision
  const byName = new Map<string, typeof allChannels[0]>();
  for (const ch of allChannels) {
    const key = ch.name.trim().toLowerCase();
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, ch);
    } else if (!existing.logo && ch.logo) {
      // replace with the version that has a logo
      byName.set(key, ch);
    }
  }
  const sortedChannels = Array.from(byName.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col pt-8 pb-24">
      <div className="px-4 mb-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-center text-white mb-2">
          Watch Sports <span className="text-emerald-400">Live</span>
        </h1>
        <p className="text-center text-zinc-400 mb-8">Select a game below to start watching</p>
      </div>

      {/* Slider Section */}
      <div className="px-4 mb-12">
        <SliderTemplate slides={slides} className="rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/20 max-w-5xl mx-auto" />
      </div>

      {/* Big Categories */}
      <div className="px-4 mb-12 max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/category/fifa-2026" className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-center transition-all hover:bg-emerald-950 hover:border-emerald-500/50">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Trophy className="w-12 h-12 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold text-white relative z-10">FIFA 2026</h2>
          <p className="text-zinc-400 text-sm mt-2 relative z-10">World Cup Qualifiers & Matches</p>
        </Link>
        <Link href="/category/sports" className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-center transition-all hover:bg-emerald-950 hover:border-emerald-500/50">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Activity className="w-12 h-12 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold text-white relative z-10">All Sports</h2>
          <p className="text-zinc-400 text-sm mt-2 relative z-10">Live Channels A to Z</p>
        </Link>
      </div>

      {/* A to Z Channels Grid */}
      <div className="px-4 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Tv2 className="text-emerald-500" />
          Live Channels (A-Z)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedChannels.map((channel) => (
            <Link
              key={channel.id}
              href={`/watch/${channel.id}`}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex flex-col items-center gap-3 hover:bg-zinc-800 hover:border-emerald-500/50 transition-colors group"
            >
              <div className="w-16 h-16 rounded-lg bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-800 group-hover:border-emerald-500/30 shrink-0">
                {channel.logo ? (
                  <ChannelLogoImg
                    src={channel.logo}
                    alt={channel.name}
                    fallbackLetter={channel.name.charAt(0).toUpperCase()}
                  />
                ) : (
                  <span className="text-zinc-500 text-xl font-bold">
                    {channel.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-zinc-300 text-center line-clamp-2 w-full group-hover:text-white leading-tight">
                {channel.name}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-red-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* VPN Popup */}
      <VpnPopup />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'GoalCast',
            url: 'https://goalcast-tv.vercel.app',
            description: 'Free live sports TV channels worldwide',
          }),
        }}
      />
    </div>
  );
}
