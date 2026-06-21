'use client';

import { useState, useEffect } from 'react';
import { Trophy, Save, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminTickerPage() {
  const [active, setActive] = useState(false);
  const [leaguesInput, setLeaguesInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch('/api/admin/ticker')
      .then(r => r.json())
      .then(data => {
        setActive(data.active);
        setLeaguesInput((data.leagues || []).join(', '));
        setLoading(false);
      })
      .catch(() => {
        showToast('Failed to load ticker data', 'error');
        setLoading(false);
      });
  }, []);

  async function handleSave(updatedActive = active, updatedLeagues = leaguesInput) {
    setSaving(true);
    try {
      const leaguesArray = updatedLeagues.split(',').map(l => l.trim()).filter(Boolean);
      const r = await fetch('/api/admin/ticker', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: updatedActive, leagues: leaguesArray }),
      });
      if (r.ok) {
        showToast('Ticker settings saved successfully!');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch {
      showToast('Connection error', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleToggleActive() {
    const nextActive = !active;
    setActive(nextActive);
    handleSave(nextActive, leaguesInput);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all duration-300
          ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-emerald-400" />
            Scores Match Ticker
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Manage the live scores and fixtures ticker at the top of the homepage.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(active)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/20"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Ticker'}
          </button>
        </div>
      </div>

      {/* Ticker Activation */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Ticker Active Status</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Currently: {active ? (
                  <span className="text-emerald-400 font-semibold">Enabled — Visible on homepage (fetching live ESPN data)</span>
                ) : (
                  <span className="text-zinc-500 font-semibold">Disabled — Hidden</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleActive}
            disabled={saving}
            className="transition-colors disabled:opacity-50"
            aria-label="Toggle ticker active status"
          >
            {active ? (
              <ToggleRight className="w-10 h-10 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-zinc-500" />
            )}
          </button>
        </div>
      </div>

      {/* League Filter */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="flex items-start gap-3 w-full">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="w-full">
              <h2 className="text-base font-semibold text-white">Filter Leagues / Tournaments</h2>
              <p className="text-xs text-zinc-400 mt-0.5 mb-3">
                Enter league names exactly as they appear (e.g., "UEFA Champions League", "Copa America", "FIFA World Cup"). Separate multiple leagues with commas. Leave blank to show all worldwide matches.
              </p>
              <input
                type="text"
                value={leaguesInput}
                onChange={(e) => setLeaguesInput(e.target.value)}
                placeholder="UEFA Champions League, FIFA World Cup..."
                className="w-full px-4 py-2.5 bg-black/40 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-zinc-400 text-sm">
        <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>
          The Scores Match Ticker pulls real-time match details (scores, current minute, schedules) directly from the ESPN Soccer Scoreboard API.
        </span>
      </div>
    </div>
  );
}
