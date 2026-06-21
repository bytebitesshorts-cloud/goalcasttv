'use client';

import { useEffect, useState } from 'react';
import { Trophy, Pause, Play } from 'lucide-react';
import CountryFlag from './CountryFlag';

interface TickerMatch {
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

export default function ScoresTicker() {
  const [active, setActive] = useState(false);
  const [matches, setMatches] = useState<TickerMatch[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    async function loadTicker() {
      try {
        const r = await fetch('/api/admin/ticker');
        if (r.ok) {
          const data = await r.json();
          setActive(data.active);
          setMatches(data.matches || []);
        }
      } catch (err) {
        console.error('Failed to load ticker', err);
      }
    }
    loadTicker();
    const timer = setInterval(loadTicker, 30000);
    return () => clearInterval(timer);
  }, []);

  const renderFlag = (flag: string, name: string) => {
    if (flag && (flag.startsWith('http://') || flag.startsWith('https://'))) {
      return <img src={flag} alt={name} className="w-7 h-5 object-contain rounded-sm" />;
    }
    return <CountryFlag code={flag} name={name} className="w-6.5 h-4.5 object-cover rounded-sm shadow-sm" />;
  };

  if (!active || matches.length === 0) return null;

  // Duplicate matches for infinite scroll
  const displayMatches = matches.length < 5
    ? [...matches, ...matches, ...matches, ...matches]
    : [...matches, ...matches];

  return (
    <div className="relative w-full h-[44px] bg-[#1a0404] border-b border-[#2b0808] flex items-center overflow-hidden select-none z-50">
      {/* Trophy Emblem */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-white flex items-center justify-center border-r border-[#2b0808] z-20 shadow-md">
        <Trophy className="w-5.5 h-5.5 text-[#c4923e] animate-pulse" />
      </div>

      {/* Marquee Wrapper */}
      <div className="flex-1 h-full overflow-hidden flex items-center pl-16 pr-12 text-sm">
        <div
          className="animate-marquee gap-8"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
        >
          {displayMatches.map((m, idx) => {
            const isLive = m.status === 'live';
            return (
              <div key={`${m.id}-${idx}`} className="flex items-center gap-5 text-zinc-100 font-medium mr-8">
                {isLive ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10.5px] font-bold animate-pulse">
                      <span>{m.minute || 'LIVE'}</span>
                    </span>
                    <div className="flex items-center gap-2 bg-[#2b0b0b]/80 border border-[#3e1414] px-3 py-1 rounded-xl shadow-inner">
                      {renderFlag(m.homeFlag, m.homeTeam)}
                      <span className="text-[#e1bc7c] font-bold px-1.5">{m.homeScore ?? 0} - {m.awayScore ?? 0}</span>
                      {renderFlag(m.awayFlag, m.awayTeam)}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#d2a14e] font-bold uppercase tracking-wider">{m.date}</span>
                    <div className="flex items-center gap-2 bg-[#2b0b0b]/40 border border-[#2b0b0b] px-3 py-1 rounded-xl">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">{m.time}</span>
                      {renderFlag(m.homeFlag, m.homeTeam)}
                      <span className="text-zinc-500 font-semibold px-0.5">-</span>
                      {renderFlag(m.awayFlag, m.awayTeam)}
                    </div>
                  </div>
                )}
                {/* Separator Dot */}
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Button */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center">
        <button
          onClick={() => setPaused(!paused)}
          className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center border border-zinc-800 transition-colors shadow-md backdrop-blur-sm"
          aria-label={paused ? 'Resume ticker scrolling' : 'Pause ticker scrolling'}
        >
          {paused ? <Play className="w-3.5 h-3.5 fill-current text-white" /> : <Pause className="w-3.5 h-3.5 fill-current text-white" />}
        </button>
      </div>
    </div>
  );
}
