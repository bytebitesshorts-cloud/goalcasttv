import type { Metadata } from 'next';
import { Globe2, Tv2, Signal } from 'lucide-react';
import HomePersonalSection from '@/components/HomePersonalSection';
import CategoryFilter from '@/components/CategoryFilter';
import { getAllCategories } from '@/lib/category';
import SliderTemplate from '@/components/SliderTemplate';
import connectDB from '@/lib/db';
import { Store } from '@/lib/models';
import VpnPopup from '@/components/VpnPopup';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'GoalCast – Free Live Sports TV Worldwide',
  description:
    'Browse live sports channels by country. Watch football, cricket, basketball, F1 and more – free, worldwide.',
};

/**
 * Home page — mobile app-like UI on small screens, grid on desktop
 */
export default async function HomePage() {
  await connectDB();
  const sliderStore = await Store.findOne({ key: 'slider' });
  const slides = sliderStore?.slider || [];

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col pt-8">
      <div className="px-4 mb-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-center text-white mb-2">
          Watch Sports <span className="text-emerald-400">Live</span>
        </h1>
        <p className="text-center text-zinc-400 mb-8">Select a game below to start watching</p>
      </div>

      {/* Slider Section */}
      <div className="px-4 flex-grow">
        <SliderTemplate slides={slides} className="rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/20 max-w-5xl mx-auto" />
      </div>

      {/* VPN Popup */}
      <VpnPopup />

      {/* JSON-LD structured data */}
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

