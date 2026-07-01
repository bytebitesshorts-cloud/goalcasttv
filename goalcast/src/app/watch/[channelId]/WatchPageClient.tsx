'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Hls from 'hls.js';
import SidebarAd from '@/components/SidebarAd';
import { RefreshCw, WifiOff, Tv, AlertTriangle, Maximize2, Loader2, ArrowLeft, Lock, Unlock, PictureInPicture, Settings, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Scan } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const [hlsRecoveryAttempted, setHlsRecoveryAttempted] = useState(false);

  // Suggested channels: same category, excluding current, shuffled, max 4
  const suggestedChannels = useMemo(() => {
    const category = (activeStream?.category || '').toLowerCase();
    const candidates = allChannels.filter(
      (c) => c.id !== activeStream?.id && (c.category || '').toLowerCase() === category
    );
    // Shuffle and take 4
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    return candidates.slice(0, 4);
  }, [activeStream?.id, activeStream?.category, allChannels]);
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

  const router = useRouter();

  // Custom Player States
  const [showControls, setShowControls] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const fitModes = ['contain', 'cover', 'fill', 'none'] as const;
  const [fitIndex, setFitIndex] = useState(0);
  const videoFit = fitModes[fitIndex];

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInteract = useCallback(() => {
    if (isLocked) {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
      return;
    }
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, [isLocked]);

  useEffect(() => {
    handleInteract();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [handleInteract]);

  // Attempt auto-landscape on load
  useEffect(() => {
    if (typeof screen !== 'undefined' && screen.orientation && (screen.orientation as any).lock) {
      try {
        (screen.orientation as any).lock('landscape').catch(() => {});
      } catch (e) {}
    }
  }, []);

  // ── Classify stream type ──
  const url = activeStream?.stream ?? activeStream?.url ?? '';
  const embedCodeStr = activeStream?.embedCode ?? '';

  const isUrlEmbedHtml = url.includes('<iframe') || url.includes('<embed');
  const isCodeEmbedHtml = embedCodeStr.includes('<iframe') || embedCodeStr.includes('<embed');
  const isEmbedHtml = isUrlEmbedHtml || isCodeEmbedHtml;
  const embedHtmlContent = isCodeEmbedHtml ? embedCodeStr : (isUrlEmbedHtml ? url : '');

  const isExplicitM3u8 = url.includes('.m3u8') || url.includes('m3u8');

  // Iframe URL is either the url (if embedCode is present but not HTML) or the embedCodeStr if it's just a raw link
  const hasUrlIframe = url.startsWith('http') && url.match(/\.(mp4|webm|ogg)$/i) === null && !!embedCodeStr && !isExplicitM3u8;
  const hasEmbedCodeIframe = embedCodeStr.startsWith('http') && embedCodeStr.match(/\.(mp4|webm|ogg)$/i) === null && !url;
  const isIframeUrl = !isEmbedHtml && (hasUrlIframe || hasEmbedCodeIframe);
  const iframeSrc = hasUrlIframe ? url : (hasEmbedCodeIframe ? embedCodeStr : url);

  const isM3u8 = !isEmbedHtml && !isIframeUrl && !!url && !url.match(/\.(mp4|webm|ogg)$/i);
  const isDirectVideo = !isEmbedHtml && !isIframeUrl && !isM3u8 && !!url;

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
      // Exhausted auto-retries — do not auto-switch, let user decide
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

    if (!url && !embedCodeStr) {
      setError('No stream URL or Embed Code available for this channel.');
      setLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    setError(null);
    setHlsRecoveryAttempted(false);
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
          video.play().catch(() => { });
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          setCurrentLevel(data.level);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            // Try recovery once before giving up
            if (!hlsRecoveryAttempted) {
              setHlsRecoveryAttempted(true);
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                console.log('[HLS] Network error, attempting recovery...');
                hls.startLoad();
                return;
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                console.log('[HLS] Media error, attempting recovery...');
                hls.recoverMediaError();
                return;
              }
            }
            hls.destroy();
            hlsRef.current = null;
            clearTimeout_();
            setError('This broadcast has ended or is temporarily unavailable.');
            setLoading(false);
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        const onMeta = () => { clearTimeout_(); setLoading(false); video.play().catch(() => { }); };
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
      el.requestFullscreen().catch(() => { });
    }
  };

  const allServers = servers.some(s => s.id === channel.id) ? servers : [channel, ...servers];

  const sidebarChannels = allChannels;

  const showManualButtons = autoRetryCount >= MAX_AUTO_RETRIES;

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const skip = (amount: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePiP = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {}
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
            className="bg-zinc-950 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800/80 relative shadow-2xl shadow-black/40 group"
            style={{ paddingTop: 'min(56.25%, 56vw)' }}
            onMouseMove={handleInteract}
            onTouchStart={handleInteract}
            onClick={handleInteract}
          >
            <div className="absolute inset-0 flex flex-col bg-black">

              {/* Channel-switching overlay (fetch in progress) */}
              {channelSwitching && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/90 gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-xs sm:text-sm text-zinc-400">Switching channel…</p>
                </div>
              )}

              {/* Loading overlay */}
              {loading && !error && (isM3u8 || isDirectVideo) && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-zinc-950 gap-3">
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
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 p-4 sm:p-6 gap-3 sm:gap-4 overflow-y-auto">
                  <div className="relative">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <Tv className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />
                    </div>
                    <WifiOff className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-red-500 bg-zinc-900 rounded-full p-0.5" />
                  </div>

                  <div className="text-center">
                    <p className="text-sm sm:text-base font-bold text-white mb-1">Broadcast Unavailable</p>
                    <p className="text-[11px] sm:text-xs text-zinc-400 max-w-[280px] sm:max-w-sm leading-relaxed">
                      This broadcast has ended or is temporarily unavailable. Try another channel below.
                    </p>
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
                    <>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRetry(); }}
                          className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/25 z-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Try Again
                        </button>
                      </div>

                      {/* Suggested channels */}
                      {suggestedChannels.length > 0 && (
                        <div className="w-full max-w-md mt-2 z-50 relative">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2 text-center">Try these instead</p>
                          <div className="grid grid-cols-2 gap-2">
                            {suggestedChannels.map((sc) => (
                              <button
                                key={sc.id}
                                onClick={(e) => { e.stopPropagation(); handleSwitchChannel(sc); }}
                                className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/80 border border-zinc-700/50 transition-colors text-left"
                              >
                                <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                                  {sc.logo
                                    ? <img src={sc.logo} alt={sc.name} className="w-full h-full object-contain p-0.5" />
                                    : <span className="text-zinc-500 text-[10px] font-bold">{sc.name?.charAt(0)}</span>
                                  }
                                </div>
                                <span className="text-[11px] text-zinc-300 font-medium truncate">{sc.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Embed HTML */}
              {isEmbedHtml && (
                <div
                  className="absolute inset-0 w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0 z-0"
                  dangerouslySetInnerHTML={{ __html: embedHtmlContent }}
                />
              )}

              {/* Iframe URL */}
              {isIframeUrl && (
                <iframe
                  src={iframeSrc}
                  className="absolute inset-0 w-full h-full border-0 bg-black z-0"
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                />
              )}

              {/* HLS / Direct video */}
              {(isM3u8 || isDirectVideo) && (
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full bg-black outline-none transition-opacity duration-300 ${loading || error ? 'opacity-0 pointer-events-none' : 'opacity-100'} z-0`}
                  style={{ objectFit: videoFit as any }}
                  playsInline
                  autoPlay
                  poster={activeStream?.logo}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                  onEnded={() => setIsPlaying(false)}
                />
              )}

              {/* CUSTOM PLAYER OVERLAY UI */}
              {(!isEmbedHtml && !isIframeUrl && !loading && !error) && (
                <div className={`absolute inset-0 z-20 flex flex-col justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${isLocked ? 'pointer-events-none' : ''}`}>
                  {/* Top Gradient */}
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
                  
                  {/* Bottom Gradient */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                  {/* Top Bar */}
                  <div className="relative flex flex-col p-3 sm:p-4 gap-3">
                    <div className="flex items-center justify-between w-full">
                      {/* Left: Back & Title */}
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); router.back(); }} className={`p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors ${isLocked ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/40 backdrop-blur-sm flex items-center">
                          <span className="text-white text-xs sm:text-sm font-bold truncate max-w-[120px] sm:max-w-xs">{activeStream?.name || 'Live Match'}</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className={`flex items-center gap-2 ${isLocked ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                        <button onClick={(e) => { e.stopPropagation(); handleRetry(); }} className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors">
                          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsLocked(true); setShowControls(false); }} className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors">
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={togglePiP} className="hidden sm:block p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors">
                          <PictureInPicture className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setFitIndex((i) => (i + 1) % fitModes.length); }} className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors">
                          <Scan className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleFullscreen(); }} className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors">
                          <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Servers Row */}
                    {!isLocked && allServers.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pointer-events-auto">
                        <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm flex items-center shrink-0">
                          <span className="text-white text-xs font-bold">SP</span>
                        </div>
                        {allServers.map((s, idx) => {
                          const isActive = activeStream?.id === s.id;
                          return (
                            <button
                              key={s.id || idx}
                              onClick={(e) => { e.stopPropagation(); handleSwitchChannel(s); }}
                              className={`shrink-0 whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all backdrop-blur-sm flex items-center gap-1.5 border ${
                                isActive
                                  ? 'bg-black/60 text-emerald-400 border-emerald-500/50'
                                  : 'bg-black/40 text-zinc-300 border-transparent hover:bg-black/60'
                              }`}
                            >
                              {isActive && <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              Server {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Center Controls (Play/Pause, Rewind, Forward) */}
                  {!isLocked && (
                    <div className="relative flex items-center justify-center gap-6 sm:gap-10 pointer-events-auto">
                      <button onClick={(e) => skip(-10, e)} className="p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-md">
                        <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8" />
                      </button>
                      <button onClick={togglePlay} className="p-4 sm:p-5 rounded-full bg-white/90 hover:bg-white text-black transition-transform active:scale-95 shadow-xl backdrop-blur-md">
                        {isPlaying ? <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" /> : <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />}
                      </button>
                      <button onClick={(e) => skip(10, e)} className="p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-md">
                        <RotateCw className="w-6 h-6 sm:w-8 sm:h-8" />
                      </button>
                    </div>
                  )}

                  {/* Bottom Bar */}
                  {!isLocked && (
                    <div className="relative flex items-center px-4 py-4 gap-3 sm:gap-4 pointer-events-auto">
                      <span className="text-white text-xs sm:text-sm font-medium tabular-nums shadow-black drop-shadow-md">
                        {formatTime(currentTime)}
                      </span>
                      
                      {/* Progress Bar */}
                      <div 
                        className="flex-1 h-1.5 sm:h-2 bg-white/30 rounded-full cursor-pointer relative overflow-hidden group/progress"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!videoRef.current || !duration) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pos = (e.clientX - rect.left) / rect.width;
                          videoRef.current.currentTime = pos * duration;
                        }}
                      >
                        <div 
                          className="absolute top-0 left-0 bottom-0 bg-white group-hover/progress:bg-emerald-400 transition-colors"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>

                      <span className="text-white text-xs sm:text-sm font-medium tabular-nums shadow-black drop-shadow-md">
                        {formatTime(duration)}
                      </span>

                      <button onClick={toggleMute} className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors ml-2">
                        {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Unlock overlay when locked (only visible on tap) */}
              {isLocked && (
                <div className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsLocked(false); handleInteract(); }} 
                    className="p-4 rounded-full bg-white/90 text-black shadow-xl backdrop-blur-md pointer-events-auto active:scale-95 transition-transform"
                  >
                    <Unlock className="w-8 h-8" />
                  </button>
                </div>
              )}

            </div>
          </div>



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
            <div className="mt-3 sm:mt-4">
              <SidebarAd adConfig={adConfig} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
