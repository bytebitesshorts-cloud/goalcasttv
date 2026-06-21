'use client';

import { useEffect, useState } from 'react';
import { Trophy, Clock, Wifi, RefreshCw } from 'lucide-react';

interface Match {
  id: string;
  status: 'live' | 'upcoming' | 'finished';
  minute?: string;
  date?: string;
  time?: string;
  homeTeam: string;
  homeFlag: string;
  homeScore?: number;
  awayTeam: string;
  awayFlag: string;
  awayScore?: number;
}

function TeamLogo({ flag, name }: { flag: string; name: string }) {
  if (flag && (flag.startsWith('http://') || flag.startsWith('https://'))) {
    return <img src={flag} alt={name} className="w-8 h-8 object-contain rounded" />;
  }
  // Fallback: team initials
  return (
    <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-300">
      {name?.slice(0, 3).toUpperCase()}
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <div className={`relative rounded-2xl border p-4 transition-all ${
      isLive
        ? 'bg-gradient-to-br from-red-950/60 to-zinc-900/80 border-red-800/50 shadow-lg shadow-red-900/20'
        : isFinished
          ? 'bg-zinc-900/60 border-zinc-800/50'
          : 'bg-zinc-900/40 border-zinc-800/40'
    }`}>
      {/* Status badge */}
      <div className="flex items-center justify-between mb-3">
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            LIVE {match.minute ? `· ${match.minute}` : ''}
          </span>
        ) : isFinished ? (
          <span className="px-2.5 py-1 rounded-full bg-zinc-700/80 text-zinc-400 text-[10px] font-bold">
            FULL TIME
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-900/50 border border-emerald-800/60 text-emerald-400 text-[10px] font-semibold">
            <Clock className="w-2.5 h-2.5" />
            {match.date} · {match.time}
          </span>
        )}
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between gap-2">
        {/* Home team */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamLogo flag={match.homeFlag} name={match.homeTeam} />
          <span className="text-[11px] font-semibold text-zinc-200 text-center leading-tight line-clamp-2 max-w-[80px]">
            {match.homeTeam}
          </span>
        </div>

        {/* Score / VS */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {(isLive || isFinished) ? (
            <div className="flex items-center gap-2 bg-zinc-800/80 px-4 py-2 rounded-xl border border-zinc-700/60">
              <span className={`text-2xl font-black tabular-nums ${isLive ? 'text-white' : 'text-zinc-300'}`}>
                {match.homeScore ?? 0}
              </span>
              <span className="text-zinc-600 font-bold text-lg">-</span>
              <span className={`text-2xl font-black tabular-nums ${isLive ? 'text-white' : 'text-zinc-300'}`}>
                {match.awayScore ?? 0}
              </span>
            </div>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
              <span className="text-zinc-500 font-bold text-base">VS</span>
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamLogo flag={match.awayFlag} name={match.awayTeam} />
          <span className="text-[11px] font-semibold text-zinc-200 text-center leading-tight line-clamp-2 max-w-[80px]">
            {match.awayTeam}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ScoresPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState(false);

  async function loadScores() {
    try {
      const r = await fetch('/api/admin/ticker');
      if (r.ok) {
        const data = await r.json();
        setMatches(data.matches || []);
        setLastUpdated(new Date());
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadScores();
    const timer = setInterval(loadScores, 30_000);
    return () => clearInterval(timer);
  }, []);

  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const finishedMatches = matches.filter(m => m.status === 'finished');

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-24 md:pb-12 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            Live Scores
          </h1>
          {lastUpdated && (
            <p className="text-xs text-zinc-400 mt-1 ml-1">
              Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button
          onClick={loadScores}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-semibold transition-all active:scale-95 border border-zinc-200 dark:border-zinc-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <p className="text-zinc-400 text-sm">Loading today&apos;s matches…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <Wifi className="w-12 h-12 text-zinc-600" />
          <p className="text-zinc-400">Could not load scores. Check your connection.</p>
          <button onClick={loadScores} className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-sm font-bold">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Trophy className="w-14 h-14 text-zinc-700" />
          <p className="text-zinc-400 font-medium">No matches today</p>
          <p className="text-zinc-500 text-sm max-w-xs">Check back later or enable the ticker in the admin panel.</p>
        </div>
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="space-y-8">

          {/* Live now */}
          {liveMatches.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Now ({liveMatches.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcomingMatches.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Upcoming Today ({upcomingMatches.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcomingMatches.map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}

          {/* Finished */}
          {finishedMatches.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                Finished Today ({finishedMatches.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {finishedMatches.map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
