'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import SidebarAd from '@/components/SidebarAd';
import { RefreshCw, WifiOff, Tv, AlertTriangle, Maximize2, Loader2 } from 'lucide-react';

interface WatchPageClientProps {
  channel: any;
  country: any;
  allChannels: any[];
  servers: any[];
  adConfig: any;
}

const CONNECTION_TIMEOUT = 20_000;
const AUTO_RETRY_DELAY = 3_000;
const MAX_AUTO_RETRIES = 3;

export default function WatchPageClient({
  channel,
  country,
  allChannels,
  servers,
  adConfig,
}: WatchPageClientProps) {
  const [activeStream, setActiveStream] = useState<any>(channel);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRetryRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Incremented on every channel switch to force player useEffect to re-run
  const switchKeyRef = useRef(0);
  const [switchKey, setSwitchKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelSwitching, setChannelSwitching] = useState(false);
  const [levels, setLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState<number | null>(null);

  // ── Classify stream type ──
  // Channel type uses `stream` as the primary field; `url` is a legacy fallback
  const url = activeStream?.stream ?? activeStream?.url ?? '';
  const isEmbedHtml = url.includes('<iframe') || url.includes('<embed');
  const isM3u8 = !isEmbedHtml && (url.includes('.m3u8') || url.includes('m3u8'));
  const isIframeUrl = !isEmbedHtml && !isM3u8 && url.startsWith('http') && url.match(/\.(mp4|webm|ogg)$/i) === null && activeStream?.embedCode;
  const isDirectVideo = !isEmbedHtml && !isM3u8 && !isIframeUrl && url.startsWith('http');

  const clearTimeout_ = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  const clearAutoRetry = useCallback(() => {
    if (autoRetryRef.current) { clearInterval(autoRetryRef.current); autoRetryRef.current = null; }
    setAutoRetryCountdown(null);
  }, []);

  // ── Auto-retry logic: starts when error appears, up to MAX_AUTO_RETRIES ──
  useEffect(() => {
    if (!error) {
      clearAutoRetry();
      return;
    }
    if (autoRetryCount >= MAX_AUTO_RETRIES) {
      // Exhausted auto-retries — show manual buttons, stop countdown
      setAutoRetryCountdown(null);
      return;
    }

    let countdown = Math.ceil(AUTO_RETRY_DELAY / 1000);
    setAutoRetryCountdown(countdown);

    autoRetryRef.current = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(autoRetryRef.current!);
        autoRetryRef.current = null;
        setAutoRetryCountdown(null);
        setAutoRetryCount(n => n + 1);
        setRetryCount(n => n + 1); // triggers player useEffect
      } else {
        setAutoRetryCountdown(countdown);
      }
    }, 1000);

    return () => clearAutoRetry();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // Reset auto-retry count when stream changes
  useEffect(() => {
    setAutoRetryCount(0);
    clearAutoRetry();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStream?.url]);

  // ── Main player effect ──
  useEffect(() => {
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
    if (!video) return;

    setLoading(true);
    setError(null);
    clearTimeout_();

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();
    video.removeAttribute('src');
    video.load();

    timeoutRef.current = setTimeout(() => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      setError('This channel appears to be offline or taking too long. Retrying…');
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
          abrEwmaDefaultEstimate: 300_000,
          capLevelToPlayerSize: true,
          xhrSetup: (xhr) => { xhr.withCredentials = false; },
        });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          clearTimeout_();
          setLoading(false);
          setLevels(data.levels);
          setCurrentLevel(hls.currentLevel);
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          setCurrentLevel(data.level);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            hls.destroy();
            hlsRef.current = null;
            clearTimeout_();
            setError('Stream error: channel offline or stream broken. Retrying…');
            setLoading(false);
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        const onMeta = () => { clearTimeout_(); setLoading(false); video.play().catch(() => {}); };
        const onErr = () => { clearTimeout_(); setError('Stream unavailable on this device.'); setLoading(false); };
        video.addEventListener('loadedmetadata', onMeta, { once: true });
        video.addEventListener('error', onErr, { once: true });
        video.load();
      } else {
        clearTimeout_();
        setError('Your browser does not support HLS streams. Try Chrome or Safari.');
        setLoading(false);
      }
    } else if (isDirectVideo) {
      video.src = url;
      const onMeta = () => { clearTimeout_(); setLoading(false); video.play().catch(() => {}); };
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
  }, [activeStream?.id, url, retryCount, switchKey]);

  const handleRetry = () => {
    setAutoRetryCount(0);
    setRetryCount(n => n + 1);
  };

  const handleSwitchChannel = async (ch: any) => {
    if (ch.id === activeStream?.id) return; // already playing
    clearAutoRetry();
    setAutoRetryCount(0);
    setError(null);
    setChannelSwitching(true);
    setRetryCount(0);

    try {
      // Fetch the full channel data so we always have the stream URL
      const res = await fetch(`/api/channel/${encodeURIComponent(ch.id)}`);
      const fullChannel = res.ok ? await res.json() : ch;

      // Bump switch key to guarantee the player useEffect always re-runs
      switchKeyRef.current += 1;
      setSwitchKey(switchKeyRef.current);

      setLoading(true);
      setActiveStream(fullChannel);
      window.history.pushState({}, '', `/watch/${ch.id}`);
    } catch {
      // Fallback: use whatever data we have from the sidebar
      switchKeyRef.current += 1;
      setSwitchKey(switchKeyRef.current);
      setLoading(true);
      setActiveStream(ch);
      window.history.pushState({}, '', `/watch/${ch.id}`);
    } finally {
      setChannelSwitching(false);
    }
  };

  const handleFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen().catch(() => {});
    }
  };

  const allServers = servers.some(s => s.id === channel.id) ? servers : [channel, ...servers];

  const sidebarChannels = allChannels;

  const showManualButtons = autoRetryCount >= MAX_AUTO_RETRIES;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-20 md:pb-12 min-h-screen">

      {/* Page title */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white truncate">
          {activeStream?.name}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 text-[10px] font-bold ml-2 align-middle border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        </h1>
      </div>

      {/* Two-column layout: stacks on mobile, side-by-side on lg+ */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

        {/* ── LEFT: Player + Servers + Ad ── */}
        <div className="flex-1 min-w-0">

          {/* Player wrapper — 16:9 on all screen sizes */}
          <div
            className="bg-zinc-950 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800/80 relative shadow-2xl shadow-black/40"
            style={{ paddingTop: 'min(56.25%, 56vw)' }}
          >
            <div className="absolute inset-0">

              {/* Channel-switching overlay (fetch in progress) */}
              {channelSwitching && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/90 gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-xs sm:text-sm text-zinc-400">Switching channel…</p>
                </div>
              )}

              {/* Loading overlay */}
              {loading && !error && (isM3u8 || isDirectVideo) && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Tv className="w-5 h-5 text-emerald-500/60" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 animate-pulse">Connecting to stream…</p>
                </div>
              )}

              {/* Offline / error overlay */}
              {error && !loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 p-4 sm:p-6 gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <Tv className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />
                    </div>
                    <WifiOff className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-red-500 bg-zinc-900 rounded-full p-0.5" />
                  </div>

                  <div className="text-center">
                    <p className="text-sm sm:text-base font-bold text-white mb-1">Channel Offline</p>
                    <p className="text-[11px] sm:text-xs text-zinc-400 max-w-[240px] sm:max-w-xs leading-relaxed">{error}</p>
                  </div>

                  {/* Auto-retry countdown */}
                  {autoRetryCountdown !== null && !showManualButtons && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700">
                      <div className="w-5 h-5 rounded-full border-2 border-emerald-500/40 border-t-emerald-500 animate-spin shrink-0" />
                      <span className="text-xs text-zinc-300 font-medium">
                        Auto-retrying in <span className="text-emerald-400 font-bold">{autoRetryCountdown}s</span>
                      </span>
                    </div>
                  )}

                  {/* Manual buttons — shown after auto-retries exhausted */}
                  {showManualButtons && (
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/25"
                      >
                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Try Again
                      </button>
                      {sidebarChannels[0] && (
                        <button
                          onClick={() => handleSwitchChannel(sidebarChannels[0])}
                          className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold transition-all active:scale-95"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                          Next Channel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Embed HTML */}
              {isEmbedHtml && (
                <div
                  className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                  dangerouslySetInnerHTML={{ __html: url }}
                />
              )}

              {/* Iframe URL */}
              {isIframeUrl && (
                <iframe
                  src={url}
                  className="w-full h-full border-0 bg-black"
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                />
              )}

              {/* HLS / Direct video — always in DOM */}
              {(isM3u8 || isDirectVideo) && (
                <>
                  <video
                    ref={videoRef}
                    className={`w-full h-full bg-black outline-none transition-opacity duration-300 ${loading || error ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    controls
                    playsInline
                    autoPlay
                    poster={activeStream?.logo}
                  />
                  {/* Quality Selector */}
                  {!loading && !error && levels.length > 0 && (
                    <div className="absolute top-2 right-12 z-10 group/quality">
                      <select
                        value={currentLevel}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (hlsRef.current) {
                            hlsRef.current.currentLevel = val;
                          }
                          setCurrentLevel(val);
                        }}
                        className="bg-black/50 hover:bg-black/80 text-white text-[11px] sm:text-xs font-semibold rounded-lg pl-2 pr-5 py-1.5 border border-zinc-700/50 focus:outline-none appearance-none transition-colors backdrop-blur-sm cursor-pointer opacity-60 hover:opacity-100 focus:opacity-100"
                      >
                        <option value="-1">Auto</option>
                        {levels.map((level, index) => (
                          <option key={index} value={index}>
                            {level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}k`}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-white opacity-60 group-hover/quality:opacity-100">
                        <svg className="fill-current h-3 w-3" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                      </div>
                    </div>
                  )}

                  {/* Fullscreen button overlay (visible when video is playing) */}
                  {!loading && !error && (
                    <button
                      onClick={handleFullscreen}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-white opacity-60 hover:opacity-100 transition-opacity focus:opacity-100 backdrop-blur-sm"
                      aria-label="Toggle fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Server switcher */}
          {allServers.length > 1 && (
            <section className="mt-3 sm:mt-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-zinc-200 dark:border-zinc-800/50">
              <h2 className="text-xs sm:text-sm font-bold text-zinc-600 dark:text-zinc-300 mb-2 sm:mb-3 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 sm:gap-2 ${
                        isActive
                          ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105'
                          : 'bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isActive ? 'bg-black' : 'bg-emerald-500'}`} />
                      Server {idx + 1}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Ad below player */}
          {adConfig?.enabled && (
            <div className="mt-4 sm:mt-5">
              <SidebarAd adConfig={adConfig} />
            </div>
          )}
        </div>

        {/* ── RIGHT: Sidebar — More Channels + Ad ── */}
        <aside className="w-full lg:w-80 xl:w-96 shrink-0">
          {adConfig?.enabled && (
            <div className="mb-3 sm:mb-4">
              <SidebarAd adConfig={adConfig} />
            </div>
          )}

          <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800/50 overflow-hidden">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/80">
              <h2 className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                More Channels
              </h2>
            </div>

            {/* Vertical channel list (Mobile & Desktop) */}
            <div className="block max-h-[500px] xl:max-h-[600px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {sidebarChannels.length > 0 ? sidebarChannels.map((c) => {
                const isPlaying = activeStream?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSwitchChannel(c)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors group text-left ${
                      isPlaying
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
            <div className="mt-3 sm:mt-4">
              <SidebarAd adConfig={adConfig} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
