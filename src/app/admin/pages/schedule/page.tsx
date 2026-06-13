'use client';

import { useState, useEffect } from 'react';
import { Calendar, Save, Loader2, CheckCircle } from 'lucide-react';

const DEFAULT_HERO = {
  title: 'Match Schedule & Fixtures',
  subtitle: 'Track the matches, dates, groups, and stadiums. The tournament features 48 countries playing 104 matches from June 11 to July 19, 2026.',
  badge: 'FIFA World Cup 2026 — USA, Canada & Mexico',
  statDates: 'June 11 – July 19',
  statHosts: 'USA, CA, MX',
  statMatches: '104 Fixtures',
  statStadiums: '16 Stadiums',
  disclaimer: 'Match fixtures and kickoff schedules are subject to change. For official ticketing, updates and real-time broadcasts, refer to official tournament guidelines.',
};

type Hero = typeof DEFAULT_HERO;

export default function AdminScheduleEditor() {
  const [hero, setHero] = useState<Hero>(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pages/page_schedule')
      .then((r) => r.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) setHero({ ...DEFAULT_HERO, ...data });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch('/api/admin/pages/page_schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hero),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const fields: { key: keyof Hero; label: string; multiline?: boolean }[] = [
    { key: 'badge', label: 'Badge Text (small tag above title)' },
    { key: 'title', label: 'Page Title' },
    { key: 'subtitle', label: 'Subtitle / Description', multiline: true },
    { key: 'statDates', label: 'Stat: Dates' },
    { key: 'statHosts', label: 'Stat: Host Nations' },
    { key: 'statMatches', label: 'Stat: Total Matches' },
    { key: 'statStadiums', label: 'Stat: Host Cities' },
    { key: 'disclaimer', label: 'Footer Disclaimer', multiline: true },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-zinc-950 py-4 z-10 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">World Cup Schedule</h1>
            <p className="text-xs text-zinc-500">Edit the hero & stats text on the Schedule page</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        {fields.map(({ key, label, multiline }) => (
          <div key={key}>
            <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
            {multiline ? (
              <textarea
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                value={hero[key]}
                onChange={(e) => setHero({ ...hero, [key]: e.target.value })}
              />
            ) : (
              <input
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                value={hero[key]}
                onChange={(e) => setHero({ ...hero, [key]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-600 text-center mt-6">
        Match fixture data (teams, dates, venues) is managed separately in the codebase.
      </p>
    </div>
  );
}
