'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import SidebarAd from '@/components/SidebarAd';
import { RefreshCw, WifiOff, Tv, AlertTriangle } from 'lucide-react';

interface WatchPageClientProps {
  channel: any;
  country: any;
  relatedCountry: any[];
  relatedCategory: any[];
  servers: any[];
  adConfig: any;
}

/** How long to wait for a stream before declaring it offline (ms) */
const CONNECTION_TIMEOUT = 15_000;

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
  const hlsRef = useRef<Hls | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Determine stream type
  const isM3u8 = activeStream?.url?.includes('.m3u8');
  const isIframe = activeStream?.url?.includes('<iframe') || (!isM3u8 && activeStream?.url?.includes('http') && !activeStream?.url?.match(/\.(mp4|webm|ogg)$/));
  const isDirectVideo = !isM3u8 && !isIframe;

  const clearConnectionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // ── HLS / Video playback with error handling ──
  useEffect(() => {
    const video = videoRef.current;
    
    // For iframe streams, skip video setup
    if (isIframe) {
      setLoading(false);
      setError(null);
      return;
    }

    if (!video || !activeStream?.url) return;

    setLoading(true);
    setError(null);
    clearConnectionTimeout();

    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Start connection timeout
    timeoutRef.current = setTimeout(() => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      setError('This channel appears to be offline. Try another channel or retry.');
      setLoading(false);
    }, CONNECTION_TIMEOUT);

    if (isM3u8) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          startLevel: -1,
          maxBufferLength: 10,
          maxMaxBufferLength: 30,
          fragLoadingTimeOut: 8000,
          fragLoadingMaxRetry: 3,
          manifestLoadingTimeOut: 8000,
          manifestLoadingMaxRetry: 2,
          startFragPrefetch: true,
        });
        hlsRef.current = hls;

        hls.loadSource(activeStream.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          clearConnectionTimeout();
          setLoading(false);
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            clearConnectionTimeout();
            setError('This channel is currently offline. Please try another channel.');
            setLoading(false);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = activeStream.url;
        video.addEventListener('loadeddata', () => {
          clearConnectionTimeout();
          setLoading(false);
        }, { once: true });
        video.addEventListener('error', () => {
          clearConnectionTimeout();
          setError('This channel is currently offline. Please try another channel.');
          setLoading(false);
        }, { once: true });
      }
    } else {
      // Direct video (mp4, webm, etc.)
      video.src = activeStream.url;
      video.addEventListener('loadeddata', () => {
        clearConnectionTimeout();
        setLoading(false);
        video.play().catch(() => {});
      }, { once: true });
      video.addEventListener('error', () => {
        clearConnectionTimeout();
        setError('This channel is currently offline. Please try another channel.');
        setLoading(false);
      }, { once: true });
    }

    return () => {
      clearConnectionTimeout();
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [activeStream, isM3u8, isIframe, retryKey, clearConnectionTimeout]);

  const handleRetry = () => {
    setRetryKey(k => k + 1);
  };

  // Switch channel from sidebar (inline, no page reload)
  const handleSwitchChannel = (ch: any) => {
    setActiveStream(ch);
    setError(null);
    setLoading(true);
    // Update URL without full reload
    window.history.pushState({}, '', `/watch/${ch.id}`);
  };

  // Make sure the primary channel is included in the servers list
  const allServers = servers.some(s => s.id === channel.id) 
    ? servers 
    : [channel, ...servers];

  // Combine related channels for sidebar
  const sidebarChannels = [...relatedCategory, ...relatedCountry]
    .filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i)
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

        {/* ── LEFT: Player + Servers + Ad ── */}
        <div className="flex-1 min-w-0">
          {/* Video Player Area */}
          <div className="bg-zinc-950 rounded-2xl overflow-hidden aspect-video shadow-2xl shadow-emerald-900/10 border border-zinc-800/80 relative">

            {/* Loading spinner */}
            {loading && !error && !isIframe && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950">
                <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3" />
                <p className="text-sm text-zinc-400">Connecting to stream...</p>
              </div>
            )}

            {/* ── Offline / Error state ── */}
            {error && !loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800/95 dark:to-zinc-900/95 p-6">
                {/* Decorative noise */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")', backgroundSize: '128px 128px' }} />
                
                {/* TV icon with pulse */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-lg">
                    <Tv className="w-8 h-8 text-red-400 dark:text-red-500" />
                  </div>
                </div>

                <WifiOff className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mb-3" />

                <p className="text-base font-semibold text-zinc-700 dark:text-zinc-200 mb-1 z-10">
                  Channel Offline
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs text-center mb-5 z-10">
                  {error}
                </p>

                <div className="flex items-center gap-3 z-10">
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-emerald-500/20"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                  {sidebarChannels.length > 0 && (
                    <button
                      onClick={() => handleSwitchChannel(sidebarChannels[0])}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 text-sm font-semibold transition-all duration-200"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Switch Channel
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Iframe player */}
            {isIframe && (
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
            )}

            {/* Video element (HLS / direct) */}
            {!isIframe && (
              <video
                ref={videoRef}
                className={`w-full h-full bg-black outline-none ${loading || error ? 'hidden' : 'block'}`}
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
                      onClick={() => handleSwitchChannel(s)}
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

          {/* Ad below player */}
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
                sidebarChannels.map((c) => {
                  const isPlaying = activeStream?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSwitchChannel(c)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors group text-left ${
                        isPlaying
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-500'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50 border-l-2 border-transparent'
                      }`}
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
                        <h3 className={`text-sm font-semibold truncate transition-colors ${
                          isPlaying
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                        }`}>
                          {c.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-400">{c.country}</span>
                          {isPlaying ? (
                            <>
                              <span className="text-[10px] text-emerald-500 font-bold">NOW PLAYING</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                              <span className="text-[10px] text-red-400 font-semibold">LIVE</span>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Play / equalizer icon */}
                      {isPlaying ? (
                        <div className="flex items-end gap-0.5 h-4 shrink-0">
                          <span className="w-0.5 bg-emerald-500 rounded-full animate-eq-1" />
                          <span className="w-0.5 bg-emerald-500 rounded-full animate-eq-2" />
                          <span className="w-0.5 bg-emerald-500 rounded-full animate-eq-3" />
                        </div>
                      ) : (
                        <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-emerald-500 transition-colors shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-zinc-400 text-sm">
                  No related channels found
                </div>
              )}
            </div>
          </div>

          {/* Ad at bottom of sidebar */}
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
