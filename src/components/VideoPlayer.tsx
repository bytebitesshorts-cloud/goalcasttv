'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { RefreshCw, WifiOff, Tv } from 'lucide-react';
import { PlayerSkeleton } from './Skeletons';

interface VideoPlayerProps {
  src: string;
  channelName: string;
  embedCode?: string;
}

/** How long to wait for a stream before declaring it offline (ms) */
const CONNECTION_TIMEOUT = 15_000;

/**
 * HLS video player using hls.js
 * Falls back to native <video> for Safari which supports HLS natively
 * Includes Picture-in-Picture mode toggle
 * Optimized for fast startup with low-latency HLS config
 */
export default function VideoPlayer({ src, channelName, embedCode }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [pipSupported, setPipSupported] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);

  const clearConnectionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Check Picture-in-Picture browser support
  useEffect(() => {
    if (typeof document !== 'undefined' && 'pictureInPictureEnabled' in document) {
      setPipSupported(document.pictureInPictureEnabled);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setLoading(true);
    setError(null);
    clearConnectionTimeout();

    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Start connection timeout — if nothing loads in 15 s, show offline
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        hlsRef.current?.destroy();
        hlsRef.current = null;
        setError('This channel is now offline. Try another channel or try again.');
        setLoading(false);
      }
    }, CONNECTION_TIMEOUT);

    // Check if HLS is supported natively (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener(
        'loadeddata',
        () => {
          clearConnectionTimeout();
          setLoading(false);
        },
        { once: true }
      );
      video.addEventListener(
        'error',
        () => {
          clearConnectionTimeout();
          setError('This channel is now offline. Try another channel or try again.');
          setLoading(false);
        },
        { once: true }
      );
      return;
    }

    // Use hls.js for other browsers — tuned for FAST startup
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        // ── Fast-start tuning ──
        startLevel: -1,                 // auto-select quality for fastest start
        maxBufferLength: 10,            // only buffer 10 s ahead (default 30)
        maxMaxBufferLength: 30,         // cap at 30 s
        maxBufferSize: 30 * 1000 * 1000, // 30 MB max buffer
        maxBufferHole: 0.5,             // tolerate 0.5 s gaps
        backBufferLength: 30,           // keep 30 s of back-buffer
        // ── Fast recovery ──
        fragLoadingTimeOut: 8000,       // 8 s frag timeout (default 20 s)
        fragLoadingMaxRetry: 3,
        fragLoadingRetryDelay: 500,
        manifestLoadingTimeOut: 8000,   // 8 s manifest timeout (default 10 s)
        manifestLoadingMaxRetry: 2,
        manifestLoadingRetryDelay: 500,
        levelLoadingTimeOut: 8000,
        levelLoadingMaxRetry: 2,
        levelLoadingRetryDelay: 500,
        // ── Startup ──
        startFragPrefetch: true,        // prefetch first fragment while parsing manifest
        testBandwidth: true,
        progressive: true,              // enable progressive loading for faster start
        abrEwmaDefaultEstimate: 300_000, // assume 300 Kbps initially to prevent buffering
        capLevelToPlayerSize: true,     // cap video resolution to player size
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        clearConnectionTimeout();
        setLoading(false);
        video.play().catch(() => {
          // Autoplay may be blocked by browser policy — OK
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          clearConnectionTimeout();
          setError('This channel is now offline. Try another channel or try again.');
          setLoading(false);
        }
      });
    } else {
      clearConnectionTimeout();
      setError('Your browser does not support HLS video playback.');
      setLoading(false);
    }

    return () => {
      clearConnectionTimeout();
      hlsRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, retryKey]);

  // Synchronize browser PiP states with React state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPip = () => setIsPipActive(true);
    const handleLeavePip = () => setIsPipActive(false);

    video.addEventListener('enterpictureinpicture', handleEnterPip);
    video.addEventListener('leavepictureinpicture', handleLeavePip);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPip);
      video.removeEventListener('leavepictureinpicture', handleLeavePip);
    };
  }, []);

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else {
        await video.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (e) {
      console.error('Failed to trigger Picture-in-Picture:', e);
    }
  };

  const handleRetry = () => {
    setRetryKey((k) => k + 1);
  };

  return (
    <div className="w-full animate-fade-in" role="region" aria-label={`${channelName} video player`}>
      {/* Embed code mode — render raw HTML */}
      {embedCode && !src && (
        <div
          className="w-full aspect-video rounded-2xl bg-black shadow-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: embedCode }}
        />
      )}

      {/* Skeleton while loading (HLS mode only) */}
      {src && loading && <PlayerSkeleton />}

      {/* ── Offline / Error state (HLS mode only) ── */}
      {src && error && !loading && (
        <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800/90 dark:to-zinc-900/90 border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-5 p-6 relative overflow-hidden">
          {/* Decorative static noise overlay */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")', backgroundSize: '128px 128px' }} />

          {/* TV icon with pulse ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-lg">
              <Tv className="w-8 h-8 text-red-400 dark:text-red-500" />
            </div>
          </div>

          {/* Offline icon */}
          <WifiOff className="w-5 h-5 text-zinc-400 dark:text-zinc-500 -mt-2" aria-hidden="true" />

          {/* Message */}
          <div className="text-center space-y-1.5 z-10">
            <p className="text-base font-semibold text-zinc-700 dark:text-zinc-200">
              This channel is now offline
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
              Try another channel or try again.
            </p>
          </div>

          {/* Retry button */}
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shadow-md shadow-emerald-500/20 z-10"
            aria-label="Retry stream"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </button>
        </div>
      )}

      {/* Video element (HLS mode only) */}
      {src && (
      <video
        ref={videoRef}
        id="video-player"
        controls
        playsInline
        preload="auto"
        autoPlay
        aria-label={`${channelName} live stream`}
        className={`
          w-full aspect-video rounded-2xl bg-black shadow-lg
          ${loading || error ? 'hidden' : 'block'}
        `}
      />
      )}

      {/* Picture-in-Picture Control Bar */}
      {src && !loading && !error && pipSupported && (
        <div className="mt-3 flex items-center justify-between px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Live Stream Connected
            </span>
          </div>

          <button
            onClick={togglePip}
            className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl
              bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80
              text-zinc-800 dark:text-zinc-200 text-xs font-semibold
              transition-all duration-200 select-none
              border border-zinc-200/50 dark:border-zinc-700/50
              focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
            "
            aria-label={isPipActive ? 'Exit Picture-in-Picture mode' : 'Enter Picture-in-Picture mode'}
          >
            <svg className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <rect width="10" height="7" x="12" y="10" rx="1" fill="currentColor" />
            </svg>
            <span>{isPipActive ? 'Exit PiP' : 'Picture in Picture'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
