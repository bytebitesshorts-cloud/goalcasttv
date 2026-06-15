import type { Metadata } from 'next';
import { Globe2, Tv2, Signal } from 'lucide-react';
import HomePersonalSection from '@/components/HomePersonalSection';
import CategoryFilter from '@/components/CategoryFilter';
import { getAllCategories } from '@/lib/category';
import SliderTemplate from '@/components/SliderTemplate';
// import { Store } from '@/lib/models';
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
  const categories = await getAllCategories();
  // Fetch slider data from admin endpoint (stored in DB)
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/slider`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load slider');
  const { slides } = await res.json();

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Mobile Hero ── */}
      <div className="md:hidden">
        {/* Featured banner */}
        <div className="relative mx-4 mt-4 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900/80 via-zinc-900 to-indigo-900/60 border border-white/10 shadow-2xl">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[11px] font-bold shadow">
              <Signal className="w-3 h-3" />
              LIVE
            </span>
          </div>
          <div className="relative px-5 pt-20 pb-6">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">GoalCast</p>
            <h1 className="text-white text-2xl font-extrabold leading-tight mb-1">
              Watch Sports <span className="text-emerald-400">Live, Free</span>
            </h1>
            <p className="text-zinc-300 text-sm mb-5 leading-relaxed">
              {categories.length} categories · 0 subscriptions
            </p>
            <Link
              href="/category/sports"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
            >
              <Tv2 className="w-4 h-4" />
              Watch Now
            </Link>
          </div>
        </div>

        {/* Categories horizontal scroll */}
        <div className="px-4 mt-5">
          <CategoryFilter categories={categories} baseUrl="/category" />
        </div>

        {/* Recently Watched + Favorites */}
        <div className="px-4">
          <HomePersonalSection />
        </div>

        {/* VPN Popup */}
        <VpnPopup />

        {/* Slider Section (Admin configurable) */}
        <div className="px-4 mt-4 pb-4">
          <SliderTemplate slides={slides} className="rounded-xl overflow-hidden" />
        </div>
      </div>

      {/* ── Desktop layout (original) ── */}
      <div className="hidden md:block px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <section className="text-center mb-12" aria-labelledby="hero-heading">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Live Sports — Worldwide
            </span>
          </div>
          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3"
          >
            Watch Sports{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
              Live, Free
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Choose a category to browse sports channels and start watching instantly.
          </p>
        </section>

        {/* Recently Watched + Favorites */}
        <HomePersonalSection />

        {/* VPN Popup */}
        <VpnPopup />

        {/* Global Categories */}
        <section aria-labelledby="categories-heading" className="mb-8">
          <h2 id="categories-heading" className="sr-only">Categories</h2>
          <CategoryFilter categories={categories} baseUrl="/category" />
        </section>

// Country list removed per user request – view is simplified

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
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://goalcast-tv.vercel.app/?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}

