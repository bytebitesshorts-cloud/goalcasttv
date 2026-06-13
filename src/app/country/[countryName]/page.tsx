import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe2 } from 'lucide-react';
import CountryChannelGrid from '@/components/CountryChannelGrid';
import CountryFlag from '@/components/CountryFlag';
import { getCountry, getAllCountries } from '@/lib/search';

interface Props {
  params: { countryName: string };
}

// Generate static params for all countries (SSG)
export async function generateStaticParams() {
  const countries = await getAllCountries();
  return countries.map((c) => ({ countryName: encodeURIComponent(c.name) }));
}

// Dynamic metadata per country
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const country = await getCountry(params.countryName);
  if (!country) return { title: 'Country Not Found' };

  return {
    title: `${country.flag} ${country.name} Sports Channels`,
    description: `Watch ${country.channels.length} live sports channels from ${country.name} — football, cricket, basketball and more on GoalCast.`,
    openGraph: {
      title: `${country.name} Live Sports Channels | GoalCast`,
      description: `${country.channels.length} live sports channels from ${country.name}.`,
    },
    twitter: {
      card: 'summary',
      title: `${country.name} Live Sports Channels | GoalCast`,
    },
  };
}

/**
 * Country page — grid of that country's sports channels
 */
export default async function CountryPage({ params }: Props) {
  const country = await getCountry(params.countryName);

  if (!country) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200"
          id="back-to-home"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          All Countries
        </Link>
      </nav>

      {/* Country header */}
      <header className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-10 flex items-center justify-center select-none" aria-hidden="true">
            <CountryFlag
              code={country.code}
              name={country.name}
              className="w-full h-full object-cover rounded-xl shadow border border-zinc-100 dark:border-zinc-800"
            />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              {country.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {country.channels.length} live sports channel
              {country.channels.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </header>

      {/* Channels grid */}
      <section aria-labelledby="channels-heading">
        <div className="flex items-center gap-2 mb-5">
          <Globe2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
          <h2
            id="channels-heading"
            className="text-base font-semibold text-zinc-800 dark:text-zinc-200"
          >
            Sports Channels
          </h2>
        </div>

        {country.channels.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 dark:text-zinc-400">
              No channels found for this country.
            </p>
          </div>
        ) : (
          /* Interactive Category Filter + Grid */
          <CountryChannelGrid channels={country.channels} />
        )}
      </section>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `${country.name} Sports Channels`,
            description: `Live sports TV channels from ${country.name}`,
            numberOfItems: country.channels.length,
            itemListElement: country.channels.map((ch, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: ch.name,
              url: `https://goalcast-tv.vercel.app/watch/${ch.id}`,
            })),
          }),
        }}
      />
    </div>
  );
}
