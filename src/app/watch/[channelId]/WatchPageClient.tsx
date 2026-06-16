'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface WatchPageClientProps {
  channel: any; // channel object fetched from DB
  country: any; // country data
  relatedCountry: any[];
  relatedCategory: any[];
  servers: any[]; // server/channel mirrors
  adConfig: any; // advertisement configuration
}

export default function WatchPageClient({
  channel,
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
        // Native HLS support (Safari)
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

  return (
    <div className="p-4 max-w-5xl mx-auto min-h-screen pt-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-900 dark:text-white">
          {activeStream?.name}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-500 text-sm font-bold ml-3 align-middle border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        </h1>
      </div>
      
      {/* Video Player Area */}
      <div className="bg-zinc-950 rounded-2xl overflow-hidden aspect-video shadow-2xl shadow-emerald-900/10 mb-8 border border-zinc-800/80 relative group">
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
      {allServers && allServers.length > 0 && (
        <section className="mb-12 bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50">
          <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            Available Servers
          </h2>
          <div className="flex flex-wrap gap-3">
            {allServers.map((s, idx) => {
              const isActive = activeStream?.id === s.id;
              return (
                <button
                  key={s.id || idx}
                  onClick={() => setActiveStream(s)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                    isActive 
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105' 
                      : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
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

      {/* Related Channels */}
      {relatedCategory && relatedCategory.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            Related Sports Channels
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedCategory.slice(0, 10).map((c) => (
              <a
                key={c.id}
                href={`/watch/${c.id}`}
                className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-emerald-500/50 transition-colors flex flex-col"
              >
                <div className="aspect-video bg-zinc-950 flex items-center justify-center p-4">
                  {c.logo ? (
                    <img src={c.logo} alt={c.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                  ) : (
                    <span className="text-zinc-600 font-bold text-lg">{c.name}</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{c.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{c.country}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Ads placeholder */}
      {adConfig?.enabled && (
        <section className="mt-8 flex justify-center">
          <div dangerouslySetInnerHTML={{ __html: adConfig?.customHtml || '' }} />
        </section>
      )}
    </div>
  );
}
