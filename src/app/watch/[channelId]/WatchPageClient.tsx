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
const CONNECTION_TIMEOUT = 20_000;

export default function WatchPageClient({
  channel,
  country,
  relatedCountry,
  relatedCategory,
  servers,
  adConfig,
}: WatchPageClientProps) {
  const [activeStream, setActiveStream] = useState<any>(channel);
  // Single, stable video element — NEVER re-keyed
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // ── Classify stream type ──
  const url = activeStream?.url ?? activeStream?.stream ?? '';
  const isEmbedHtml = url.includes('<iframe') || url.includes('<embed');
  const isM3u8 = !isEmbedHtml && url.includes('.m3u8');
  const isIframeUrl = !isEmbedHtml && !isM3u8 && url.startsWith('http') && !url.match(/\.(mp4|webm|ogg)$/i);
  const isDirectVideo = !isEmbedHtml && !isM3u8 && !isIframeUrl && url.startsWith('http');

  const clearTimeout_ = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  // ── Main player effect — runs whenever stream or retry changes ──
  useEffect(() => {
    // iframe/embed types need no JS video setup
    if (isEmbedHtml || isIframeUrl) {
      setLoading(false);
      setError(null);
      return;
    }

    if (!url) {
      setError('No stream URL available for this channel.');
      setLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;  // guard — should always exist since we never re-key the element

    // Reset state
    setLoading(true);
    setError(null);
    clearTimeout_();

    // Destroy any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Reset the video element cleanly
    video.pause();
    video.removeAttribute('src');
    video.load();

    // Start offline-detection timeout
    timeoutRef.current = setTimeout(() => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      setError('This channel appears to be offline or taking too long. Try another channel or retry.');
      setLoading(false);
    }, CONNECTION_TIMEOUT);

    if (isM3u8) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          startLevel: -1,
          maxBufferLength: 15,
          maxMaxBufferLength: 30,
          fragLoadingTimeOut: 10000,
          fragLoadingMaxRetry: 4,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          startFragPrefetch: true,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          },
        });
        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          clearTimeout_();
          setLoading(false);
          video.play().catch(() => {/* autoplay policy — user must interact */ });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            hls.destroy();
            hlsRef.current = null;
            clearTimeout_();
            setError('Stream error: This channel is currently offline or the stream is broken. Try another channel.');
            setLoading(false);
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari / iOS native HLS
        video.src = url;
        const onMeta = () => { clearTimeout_(); setLoading(false); video.play().catch(() => { }); };
        const onErr = () => { clearTimeout_(); setError('Stream unavailable on this device.'); setLoading(false); };
        video.addEventListener('loadedmetadata', onMeta, { once: true });
        video.addEventListener('error', onErr, { once: true });
        video.load();
      } else {
        clearTimeout_();
        setError('Your browser does not support HLS streams. Try opening in Chrome or Safari.');
        setLoading(false);
      }
    } else if (isDirectVideo) {
      video.src = url;
      const onMeta = () => { clearTimeout_(); setLoading(false); video.play().catch(() => { }); };
      const onErr = () => { clearTimeout_(); setError('Stream unavailable for this channel.'); setLoading(false); };
      video.addEventListener('loadedmetadata', onMeta, { once: true });
      video.addEventListener('error', onErr, { once: true });
      video.load();
    }

    return () => {
      clearTimeout_();
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStream?.url, retryCount]);

  const handleRetry = () => setRetryCount(n => n + 1);

  const handleSwitchChannel = (ch: any) => {
    setActiveStream(ch);
    setError(null);
    setLoading(true);
    window.history.pushState({}, '', `/watch/${ch.id}`);
  };

  // Server list for this channel
  const allServers = servers.some(s => s.id === channel.id)
    ? servers
    : [channel, ...servers];

  // Sidebar channel list
  const sidebarChannels = [...relatedCategory, ...relatedCountry]
    .filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i)
    .slice(0, 20);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-12 min-h-screen">
      {/* Page title */}
      <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-xl md:text-3xl font-extrabold text-zinc-900 dark:text-white">
          {activeStream?.name}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-500 text-xs font-bold ml-3 align-middle border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        </h1>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: Player + Servers + Ad ── */}
        <div className="flex-1 min-w-0">

          {/* Player wrapper */}
          <div className="bg-zinc-950 rounded-2xl overflow-hidden aspect-video border border-zinc-800/80 relative shadow-2xl shadow-black/30">

            {/* Loading overlay */}
            {loading && !error && (isM3u8 || isDirectVideo) && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <p className="text-sm text-zinc-400 animate-pulse">Connecting to stream…</p>
              </div>
            )}

            {/* Offline error overlay */}
            {error && !loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900/97 p-6 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <Tv className="w-8 h-8 text-red-400" />
                  </div>
                  <WifiOff className="absolute -bottom-1 -right-1 w-5 h-5 text-red-500 bg-zinc-900 rounded-full p-0.5" />
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-white mb-1">Channel Offline</p>
                  <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">{error}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/25"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                  {sidebarChannels[0] && (
                    <button
                      onClick={() => handleSwitchChannel(sidebarChannels[0])}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold transition-all active:scale-95"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Next Channel
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Embed HTML (iframe HTML string) ── */}
            {isEmbedHtml && (
              <div
                className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                dangerouslySetInnerHTML={{ __html: url }}
              />
            )}

            {/* ── Iframe URL ── */}
            {isIframeUrl && (
              <iframe
                src={url}
                className="w-full h-full border-0 bg-black"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
              />
            )}

            {/* ── HLS / Direct video element — ALWAYS in DOM, never re-keyed ── */}
            {(isM3u8 || isDirectVideo) && (
              <video
                ref={videoRef}
                className={`w-full h-full bg-black outline-none ${loading || error ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                controls
                playsInline
                autoPlay
                muted={false}
                poster={activeStream?.logo}
                style={{ transition: 'opacity 0.3s' }}
              />
            )}
          </div>

          {/* Server switcher */}
          {allServers.length > 1 && (
            <section className="mt-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800/50">
              <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
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
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${isActive
                          ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105'
                          : 'bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
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
          {adConfig?.enabled && (
            <div className="mb-4">
              <SidebarAd adConfig={adConfig} />
            </div>
          )}

          {/* Channel list */}
          <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/80">
              <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                More Channels
              </h2>
            </div>

            <div className="max-h-[600px] lg:max-h-[500px] xl:max-h-[600px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {sidebarChannels.length > 0 ? sidebarChannels.map((c) => {
                const isPlaying = activeStream?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSwitchChannel(c)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors group text-left ${isPlaying
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-l-2 border-emerald-500'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50 border-l-2 border-transparent'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {c.logo
                        ? <img src={c.logo} alt={c.name} className="w-full h-full object-contain p-1" />
                        : <span className="text-zinc-400 text-xs font-bold">{c.name?.charAt(0)}</span>
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`text-sm font-semibold truncate ${isPlaying ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`}>
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-zinc-400 truncate">{c.country}</span>
                        {isPlaying
                          ? <span className="text-[10px] text-emerald-500 font-bold ml-1">▶ NOW PLAYING</span>
                          : <><span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" /><span className="text-[10px] text-red-400 font-semibold">LIVE</span></>
                        }
                      </div>
                    </div>
                    {!isPlaying && (
                      <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-emerald-500 transition-colors shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                );
              }) : (
                <div className="px-4 py-10 text-center text-zinc-400 text-sm">No related channels found</div>
              )}
            </div>
          </div>

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
