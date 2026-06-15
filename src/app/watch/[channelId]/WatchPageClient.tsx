// WatchPageClient.tsx
// Client component for rendering watch page UI. This component receives data fetched on the server
// (channel, country, related channels, etc.) and displays the live stream, related content,
// and any advertisements. It is deliberately lightweight – heavy data fetching is done
// in the server component (page.tsx). The UI uses the existing SliderTemplate component
// for showcasing related channels.

'use client';

import React from 'react';
import SliderTemplate from '@/components/SliderTemplate';

interface WatchPageClientProps {
  channel: any; // channel object fetched from DB
  country: any; // country data with related channels
  relatedCountry: any[]; // other channels from the same country
  relatedCategory: any[]; // channels from the same category
  servers: any[]; // server/channel mirrors
  adConfig: any; // advertisement configuration
}

export default function WatchPageClient({
  channel,
  country,
  relatedCountry,
  relatedCategory,
  servers,
  adConfig,
}: WatchPageClientProps) {
  // Simple fallback UI – you can extend this with video player, ads, etc.
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{channel?.name} Live</h1>
      {/* Placeholder for video player */}
      <div className="bg-gray-800 rounded-md h-64 flex items-center justify-center text-white mb-6">
        Video Player Placeholder
      </div>

      {/* Related channels by country */}
      {relatedCountry && relatedCountry.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">More from {country?.name}</h2>
          <SliderTemplate slides={relatedCountry.map((c) => ({
            image: c.logo || '/placeholder.png',
            link: `/watch/${c.id}`,
            title: c.name,
          }))} />
        </section>
      )}

      {/* Related channels by category */}
      {relatedCategory && relatedCategory.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Related Category</h2>
          <SliderTemplate slides={relatedCategory.map((c) => ({
            image: c.logo || '/placeholder.png',
            link: `/watch/${c.id}`,
            title: c.name,
          }))} />
        </section>
      )}

      {/* Servers / mirrors */}
      {servers && servers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Available Streams</h2>
          <ul className="list-disc list-inside">
            {servers.map((s) => (
              <li key={s.id}>
                <a href={`/watch/${s.id}`} className="text-blue-500 hover:underline">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Ads placeholder */}
      {adConfig?.enabled && (
        <section className="mt-8">
          <div dangerouslySetInnerHTML={{ __html: adConfig?.customHtml || '' }} />
        </section>
      )}
    </div>
  );
}
