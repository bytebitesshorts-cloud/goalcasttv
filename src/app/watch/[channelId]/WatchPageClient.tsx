'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import SidebarAd from '@/components/SidebarAd';

interface WatchPageClientProps {
  channel: any;
  country: any;
  relatedCountry: any[];
  relatedCategory: any[];
  servers: any[];
  adConfig: any;
}

export default function WatchPageClient({
  channel,
  country,
  relatedCountry,
  relatedCategory,
  servers,
  adConfig,
}: WatchPageClientProps) {
  const [activeStream, setActiveStream] = useState<any>(channel);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Determine stream type
  const isM3u8 = activeStream?.url?.includes('.m3u8');
  const isIframe = activeStream?.url?.includes('<iframe') || (!isM3u8 && activeStream?.url?.includes('http') && !activeStream?.url?.match(/\.(mp4|webm|ogg)$/));

  useEffect(() => {
    let hls: Hls | null = null;
    
    if (isM3u8 && videoRef.current) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(activeStream.url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play().catch(() => console.log('Autoplay blocked'));
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = activeStream.url;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current?.play().catch(() => console.log('Autoplay blocked'));
        });
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [activeStream, isM3u8]);

  // Make sure the primary channel is included in the servers list if not already
  const allServers = servers.some(s => s.id === channel.id) 
    ? servers 
    : [channel, ...servers];

  // Combine related channels for sidebar
  const sidebarChannels = [...relatedCategory, ...relatedCountry]
    .filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i) // dedupe
    .slice(0, 20);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-12 min-h-screen">
      {/* Title */}
      <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-xl md:text-3xl font-extrabold text-zinc-900 dark:text-white">
          {activeStream?.name}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-500 text-xs font-bold ml-3 align-middle border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        </h1>
      </div>

      {/* ── Two-Column Layout: Player + Sidebar ── */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: Player + Servers + Ad below player ── */}
        <div className="flex-1 min-w-0">
          {/* Video Player */}
          <div className="bg-zinc-950 rounded-2xl overflow-hidden aspect-video shadow-2xl shadow-emerald-900/10 border border-zinc-800/80 relative group">
            {isM3u8 ? (
              <video
                ref={videoRef}
                className="w-full h-full bg-black outline-none"
                controls
                playsInline
                autoPlay
                poster={activeStream?.logo}
              />
            ) : isIframe ? (
              activeStream?.url?.includes('<iframe') ? (
                <div 
                  className="w-full h-full flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full border-0" 
                  dangerouslySetInnerHTML={{ __html: activeStream.url }} 
                />
              ) : (
                <iframe 
                  src={activeStream.url} 
                  className="w-full h-full border-0 bg-black" 
                  allowFullScreen 
                  allow="autoplay; fullscreen"
                />
              )
            ) : (
              <video
                ref={videoRef}
                src={activeStream?.url}
                className="w-full h-full bg-black outline-none"
                controls
                playsInline
                autoPlay
                poster={activeStream?.logo}
              />
            )}
          </div>

          {/* Servers Selection */}
          {allServers && allServers.length > 1 && (
            <section className="mt-5 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800/50">
              <h2 className="text-sm md:text-base font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                Available Servers
              </h2>
              <div className="flex flex-wrap gap-2">
                {allServers.map((s, idx) => {
                  const isActive = activeStream?.id === s.id;
                  return (
                    <button
                      key={s.id || idx}
                      onClick={() => setActiveStream(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                        isActive 
                          ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105' 
                          : 'bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-black' : 'bg-emerald-500'}`} />
                      Server {idx + 1}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Ad below player (desktop) */}
          {adConfig?.enabled && (
            <div className="mt-5">
              <SidebarAd adConfig={adConfig} />
            </div>
          )}
        </div>

        {/* ── RIGHT: Sidebar — Channels + Ad ── */}
        <aside className="w-full lg:w-80 xl:w-96 shrink-0">
          {/* Ad at top of sidebar */}
          {adConfig?.enabled && (
            <div className="mb-4">
              <SidebarAd adConfig={adConfig} />
            </div>
          )}

          {/* More Channels list */}
          <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/50">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                More Channels
              </h2>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {sidebarChannels.length > 0 ? (
                sidebarChannels.map((c) => (
                  <a
                    key={c.id}
                    href={`/watch/${c.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group"
                  >
                    {/* Channel logo */}
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {c.logo ? (
                        <img src={c.logo} alt={c.name} className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform" />
                      ) : (
                        <span className="text-zinc-400 text-xs font-bold">{c.name?.charAt(0)}</span>
                      )}
                    </div>
                    {/* Channel info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-zinc-400">{c.country}</span>
                        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] text-red-400 font-semibold">LIVE</span>
                      </div>
                    </div>
                    {/* Play arrow */}
                    <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-emerald-500 transition-colors shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </a>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-zinc-400 text-sm">
                  No related channels found
                </div>
              )}
            </div>
          </div>

          {/* Another ad at bottom of sidebar */}
          {adConfig?.enabled && (
            <div className="mt-4">
              <SidebarAd adConfig={adConfig} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
