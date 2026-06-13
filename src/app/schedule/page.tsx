'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Search, MapPin, Trophy, ShieldAlert, Clock, Globe } from 'lucide-react';
import CountryFlag from '@/components/CountryFlag';

interface HeroData {
  badge?: string;
  title?: string;
  subtitle?: string;
  statDates?: string;
  statHosts?: string;
  statMatches?: string;
  statStadiums?: string;
  disclaimer?: string;
}

// Helper to convert flag emoji to 2-letter ISO code
function emojiToCode(emoji: string): string | null {
  if (!emoji || emoji.length < 2) return null;
  const chars = Array.from(emoji);
  if (chars.length !== 2) return null;
  const cp0 = chars[0].codePointAt(0);
  const cp1 = chars[1].codePointAt(0);
  if (!cp0 || !cp1) return null;
  // Regional indicator symbols range: 127462 (A) to 127487 (Z)
  if (cp0 >= 127462 && cp0 <= 127487 && cp1 >= 127462 && cp1 <= 127487) {
    const first = String.fromCharCode(cp0 - 127397);
    const second = String.fromCharCode(cp1 - 127397);
    return (first + second).toLowerCase();
  }
  return null;
}

interface Match {
  id: string;
  stage: 'group' | 'knockout';
  matchNum: number;
  date: string;
  time: string;
  group?: string;
  homeTeam: string;
  homeFlag: string;
  awayTeam: string;
  awayFlag: string;
  venue: string;
  city: string;
}

const matchesData: Match[] = [
  {
    id: 'm1',
    stage: 'group',
    matchNum: 1,
    date: '2026-06-11',
    time: '19:00 GMT',
    group: 'Group A',
    homeTeam: 'Mexico',
    homeFlag: '🇲🇽',
    awayTeam: 'South Africa',
    awayFlag: '🇿🇦',
    venue: 'Mexico City Stadium',
    city: 'Mexico City'
  },
  {
    id: 'm2',
    stage: 'group',
    matchNum: 2,
    date: '2026-06-12',
    time: '18:00 GMT',
    group: 'Group B',
    homeTeam: 'Canada',
    homeFlag: '🇨🇦',
    awayTeam: 'Bosnia & Herzegovina',
    awayFlag: '🇧🇦',
    venue: 'Toronto Stadium',
    city: 'Toronto'
  },
  {
    id: 'm3',
    stage: 'group',
    matchNum: 3,
    date: '2026-06-12',
    time: '21:00 GMT',
    group: 'Group D',
    homeTeam: 'United States',
    homeFlag: '🇺🇸',
    awayTeam: 'Paraguay',
    awayFlag: '🇵🇾',
    venue: 'Los Angeles Stadium',
    city: 'Los Angeles'
  },
  {
    id: 'm4',
    stage: 'group',
    matchNum: 4,
    date: '2026-06-13',
    time: '15:00 GMT',
    group: 'Group A',
    homeTeam: 'South Korea',
    homeFlag: '🇰🇷',
    awayTeam: 'Czechia',
    awayFlag: '🇨🇿',
    venue: 'Dallas Stadium',
    city: 'Dallas'
  },
  {
    id: 'm5',
    stage: 'group',
    matchNum: 5,
    date: '2026-06-13',
    time: '18:00 GMT',
    group: 'Group B',
    homeTeam: 'Qatar',
    homeFlag: '🇶🇦',
    awayTeam: 'Switzerland',
    awayFlag: '🇨🇭',
    venue: 'Miami Stadium',
    city: 'Miami'
  },
  {
    id: 'm6',
    stage: 'group',
    matchNum: 6,
    date: '2026-06-13',
    time: '21:00 GMT',
    group: 'Group C',
    homeTeam: 'Brazil',
    homeFlag: '🇧🇷',
    awayTeam: 'Morocco',
    awayFlag: '🇲🇦',
    venue: 'New York New Jersey Stadium',
    city: 'East Rutherford'
  },
  {
    id: 'm7',
    stage: 'group',
    matchNum: 7,
    date: '2026-06-13',
    time: '23:30 GMT',
    group: 'Group C',
    homeTeam: 'Haiti',
    homeFlag: '🇭🇹',
    awayTeam: 'Scotland',
    awayFlag: '🇬🇧',
    venue: 'Boston Stadium',
    city: 'Foxborough'
  },
  {
    id: 'm8',
    stage: 'group',
    matchNum: 8,
    date: '2026-06-13',
    time: '23:59 GMT',
    group: 'Group D',
    homeTeam: 'Australia',
    homeFlag: '🇦🇺',
    awayTeam: 'Türkiye',
    awayFlag: '🇹🇷',
    venue: 'Vancouver Stadium',
    city: 'Vancouver'
  },
  {
    id: 'm9',
    stage: 'group',
    matchNum: 9,
    date: '2026-06-14',
    time: '17:00 GMT',
    group: 'Group E',
    homeTeam: 'Spain',
    homeFlag: '🇪🇸',
    awayTeam: 'Cameroon',
    awayFlag: '🇨🇲',
    venue: 'Philadelphia Stadium',
    city: 'Philadelphia'
  },
  {
    id: 'm10',
    stage: 'group',
    matchNum: 10,
    date: '2026-06-14',
    time: '20:00 GMT',
    group: 'Group E',
    homeTeam: 'Japan',
    homeFlag: '🇯🇵',
    awayTeam: 'Sweden',
    awayFlag: '🇸🇪',
    venue: 'Seattle Stadium',
    city: 'Seattle'
  },
  {
    id: 'm11',
    stage: 'group',
    matchNum: 11,
    date: '2026-06-15',
    time: '18:00 GMT',
    group: 'Group F',
    homeTeam: 'Argentina',
    homeFlag: '🇦🇷',
    awayTeam: 'Ghana',
    awayFlag: '🇬🇭',
    venue: 'Houston Stadium',
    city: 'Houston'
  },
  {
    id: 'm12',
    stage: 'group',
    matchNum: 12,
    date: '2026-06-15',
    time: '21:00 GMT',
    group: 'Group F',
    homeTeam: 'Belgium',
    homeFlag: '🇧🇪',
    awayTeam: 'Saudi Arabia',
    awayFlag: '🇸🇦',
    venue: 'San Francisco Stadium',
    city: 'Santa Clara'
  },
  {
    id: 'm32',
    stage: 'group',
    matchNum: 32,
    date: '2026-06-19',
    time: '19:00 GMT',
    group: 'Group D',
    homeTeam: 'United States',
    homeFlag: '🇺🇸',
    awayTeam: 'Australia',
    awayFlag: '🇦🇺',
    venue: 'Seattle Stadium',
    city: 'Seattle'
  },
  {
    id: 'm80',
    stage: 'knockout',
    matchNum: 80,
    date: '2026-06-28',
    time: '18:00 GMT',
    group: 'Round of 32',
    homeTeam: 'Group A Winner',
    homeFlag: '🏆',
    awayTeam: 'Group C Runner-up',
    awayFlag: '🥈',
    venue: 'Los Angeles Stadium',
    city: 'Los Angeles'
  },
  {
    id: 'm104',
    stage: 'knockout',
    matchNum: 104,
    date: '2026-07-19',
    time: '20:00 GMT',
    group: 'Final',
    homeTeam: 'SF1 Winner',
    homeFlag: '🏆',
    awayTeam: 'SF2 Winner',
    awayFlag: '🏆',
    venue: 'New York New Jersey Stadium',
    city: 'East Rutherford'
  }
];

export default function SchedulePage({ hero: heroProp = {} }: { hero?: HeroData }) {
  const [heroData, setHeroData] = useState<HeroData>(heroProp);

  useEffect(() => {
    fetch('/api/admin/pages/page_schedule')
      .then((r) => r.json())
      .then((data) => { if (data && Object.keys(data).length > 0) setHeroData(data); })
      .catch(() => {});
  }, []);

  const h = {
    badge: heroData.badge ?? 'FIFA World Cup 2026 — USA, Canada & Mexico',
    title: heroData.title ?? 'Match Schedule & Fixtures',
    subtitle: heroData.subtitle ?? 'Track the matches, dates, groups, and stadiums. The tournament features 48 countries playing 104 matches from June 11 to July 19, 2026.',
    statDates: heroData.statDates ?? 'June 11 – July 19',
    statHosts: heroData.statHosts ?? 'USA, CA, MX',
    statMatches: heroData.statMatches ?? '104 Fixtures',
    statStadiums: heroData.statStadiums ?? '16 Stadiums',
    disclaimer: heroData.disclaimer ?? 'Match fixtures and kickoff schedules are subject to change. For official ticketing, updates and real-time broadcasts, refer to official tournament guidelines.',
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'group' | 'knockout'>('all');

  const filteredMatches = useMemo(() => {
    return matchesData.filter(m => {
      const matchesSearch =
        m.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.group && m.group.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTab = activeTab === 'all' || m.stage === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Hero Header */}
      <section className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 mb-4">
          <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {h.badge}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
          {h.title}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
          {h.subtitle}
        </p>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Dates', val: h.statDates, icon: Calendar },
          { label: 'Host Nations', val: h.statHosts, icon: Globe },
          { label: 'Total Matches', val: h.statMatches, icon: Trophy },
          { label: 'Host Cities', val: h.statStadiums, icon: MapPin }
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 shrink-0">
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{stat.label}</p>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team, group, city..."
            className="
              w-full pl-10 pr-4 py-2 rounded-xl text-sm
              bg-white dark:bg-zinc-900/60
              border border-zinc-200 dark:border-zinc-700/60
              text-zinc-900 dark:text-zinc-100
              placeholder:text-zinc-400 dark:placeholder:text-zinc-500
              focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
              transition-all duration-200 shadow-sm
            "
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/60">
          {(['all', 'group', 'knockout'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200
                ${activeTab === tab
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}
              `}
            >
              {tab === 'all' ? 'All Stages' : tab + ' stage'}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Table Container */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl shadow-sm overflow-hidden">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ShieldAlert className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No matches found matching your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="px-5 py-4 text-center">Match</th>
                  <th className="px-5 py-4">Date & Time</th>
                  <th className="px-5 py-4">Stage</th>
                  <th className="px-5 py-4">Matchup</th>
                  <th className="px-5 py-4">Venue & City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80 text-sm">
                {filteredMatches.map((match) => (
                  <tr
                    key={match.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors duration-150"
                  >
                    {/* Match number badge */}
                    <td className="px-5 py-4 text-center font-medium">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/60 font-semibold text-zinc-700 dark:text-zinc-300 text-xs">
                        #{match.matchNum}
                      </span>
                    </td>

                    {/* Date and Time */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {new Date(match.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {match.time}
                        </span>
                      </div>
                    </td>

                    {/* Stage Group / Knockout */}
                    <td className="px-5 py-4">
                      <span className={`
                        inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                        ${match.stage === 'knockout'
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/40'
                          : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40'}
                      `}>
                        {match.group || 'Group Stage'}
                      </span>
                    </td>

                    {/* Matchup flags */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 w-[110px] sm:w-[150px] justify-end">
                          <span className="text-zinc-800 dark:text-zinc-100 font-semibold text-xs sm:text-sm truncate">
                            {match.homeTeam}
                          </span>
                          <span className="shrink-0 flex items-center">
                            {emojiToCode(match.homeFlag) ? (
                              <CountryFlag
                                code={emojiToCode(match.homeFlag)!}
                                name={match.homeTeam}
                                className="w-5 h-3.5 object-cover rounded-sm shadow-sm border border-zinc-100 dark:border-zinc-800"
                              />
                            ) : (
                              <span className="text-lg leading-none" role="img" aria-label={match.homeTeam}>
                                {match.homeFlag}
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase">VS</span>
                        <div className="flex items-center gap-1.5 w-[110px] sm:w-[150px]">
                          <span className="shrink-0 flex items-center">
                            {emojiToCode(match.awayFlag) ? (
                              <CountryFlag
                                code={emojiToCode(match.awayFlag)!}
                                name={match.awayTeam}
                                className="w-5 h-3.5 object-cover rounded-sm shadow-sm border border-zinc-100 dark:border-zinc-800"
                              />
                            ) : (
                              <span className="text-lg leading-none" role="img" aria-label={match.awayTeam}>
                                {match.awayFlag}
                              </span>
                            )}
                          </span>
                          <span className="text-zinc-800 dark:text-zinc-100 font-semibold text-xs sm:text-sm truncate">
                            {match.awayTeam}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Stadium and city */}
                    <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm">
                          {match.venue}
                        </span>
                        <span className="text-xs flex items-center gap-0.5 text-zinc-400 dark:text-zinc-500">
                          <MapPin className="w-3 h-3" /> {match.city}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-6 max-w-md mx-auto">
        {h.disclaimer}
      </p>
    </div>
  );
}
