'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Edit2, X, Save, Tv, CheckCircle2, AlertCircle,
  Radio, ChevronDown, ChevronUp, PlusCircle
} from 'lucide-react';

interface StreamServer {
  label: string;
  url: string;
  embedCode: string;
}

interface Match {
  id: string;
  title: string;
  sport: string;
  league?: string;
  isTemporary?: boolean;
  endsAt?: string;
  teamA: { name: string; logo: string };
  teamB: { name: string; logo: string };
  thumbnail: string;
  isLive: boolean;
  streams: StreamServer[];
  createdAt: string;
}

const SPORTS = ['Football', 'Cricket', 'Basketball', 'Tennis', 'Rugby', 'Hockey', 'Baseball', 'Other'];

const EMPTY_MATCH = {
  title: '',
  sport: 'Football',
  league: '',
  isTemporary: false,
  endsAt: '',
  teamA: { name: '', logo: '' },
  teamB: { name: '', logo: '' },
  thumbnail: '',
  isLive: true,
  streams: [{ label: 'Server 1', url: '', embedCode: '' }],
};

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_MATCH>({ ...EMPTY_MATCH });
  const [editId, setEditId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Ad config state
  const [adConfig, setAdConfig] = useState({
    adEnabled: false,
    adWebUrl: '',
    adDuration: 15,
    adsScreenEnabled: false,
    adsScreenHeadline: 'Activate Your Stream - Supporting Goalcast-TV',
    adsScreenSubheadline: 'Follow steps to access the video server',
    adsScreenClickUrl: '',
    adsScreenImageUrl: '',
    adsScreenTutorialUrl: '',
    adsScreenTelegramUrl: '',
    adsScreenDuration: 15,
    announcementText: '',
    announcementEnabled: false,
  });
  const [savingAd, setSavingAd] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/matches');
      if (r.ok) setMatches(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAdConfig = useCallback(async () => {
    const r = await fetch('/api/app/config');
    if (r.ok) {
      const data = await r.json();
      setAdConfig({
        adEnabled: data.adEnabled || false,
        adWebUrl: data.adWebUrl || '',
        adDuration: data.adDuration || 15,
        adsScreenEnabled: data.adsScreenEnabled || false,
        adsScreenHeadline: data.adsScreenHeadline || 'Activate Your Stream - Supporting Goalcast-TV',
        adsScreenSubheadline: data.adsScreenSubheadline || 'Follow steps to access the video server',
        adsScreenClickUrl: data.adsScreenClickUrl || '',
        adsScreenImageUrl: data.adsScreenImageUrl || '',
        adsScreenTutorialUrl: data.adsScreenTutorialUrl || '',
        adsScreenTelegramUrl: data.adsScreenTelegramUrl || '',
        adsScreenDuration: data.adsScreenDuration || 15,
        announcementText: data.announcementText || '',
        announcementEnabled: data.announcementEnabled || false,
      });
    }
  }, []);

  useEffect(() => {
    load();
    loadAdConfig();
  }, [load, loadAdConfig]);

  async function saveAdConfig() {
    setSavingAd(true);
    try {
      const r = await fetch('/api/admin/app-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adConfig),
      });
      if (r.ok) showToast('Ad settings saved!');
      else showToast('Failed to save ad settings', 'error');
    } finally {
      setSavingAd(false);
    }
  }

  async function saveMatch() {
    const preparedData = {
      ...formData,
      endsAt: formData.isTemporary && formData.endsAt ? new Date(formData.endsAt).toISOString() : '',
    };
    if (modalMode === 'add') {
      const r = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparedData),
      });
      if (r.ok) { showToast('Match added!'); setModalMode(null); load(); }
      else showToast('Failed to add match', 'error');
    } else if (modalMode === 'edit' && editId) {
      const r = await fetch(`/api/admin/matches/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparedData),
      });
      if (r.ok) { showToast('Match updated!'); setModalMode(null); load(); }
      else showToast('Failed to update match', 'error');
    }
  }

  async function deleteMatch(id: string) {
    setDeleting(id);
    const r = await fetch(`/api/admin/matches/${id}`, { method: 'DELETE' });
    if (r.ok) { showToast('Match deleted'); load(); }
    else showToast('Delete failed', 'error');
    setDeleting(null);
  }

  function openAdd() {
    setFormData({ ...EMPTY_MATCH, streams: [{ label: 'Server 1', url: '', embedCode: '' }] });
    setEditId(null);
    setModalMode('add');
  }

  function openEdit(m: Match) {
    let formattedEndsAt = '';
    if (m.endsAt) {
      try {
        const d = new Date(m.endsAt);
        const tzoffset = d.getTimezoneOffset() * 60000;
        formattedEndsAt = new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
      } catch (e) {
        formattedEndsAt = '';
      }
    }
    setFormData({
      title: m.title,
      sport: m.sport,
      league: m.league || '',
      isTemporary: m.isTemporary || false,
      endsAt: formattedEndsAt,
      teamA: m.teamA || { name: '', logo: '' },
      teamB: m.teamB || { name: '', logo: '' },
      thumbnail: m.thumbnail || '',
      isLive: m.isLive,
      streams: m.streams?.length ? m.streams : [{ label: 'Server 1', url: '', embedCode: '' }],
    });
    setEditId(m.id);
    setModalMode('edit');
  }

  function addServer() {
    setFormData(f => ({
      ...f,
      streams: [...f.streams, { label: `Server ${f.streams.length + 1}`, url: '', embedCode: '' }],
    }));
  }

  function removeServer(idx: number) {
    setFormData(f => ({ ...f, streams: f.streams.filter((_, i) => i !== idx) }));
  }

  function updateServer(idx: number, field: keyof StreamServer, value: string) {
    setFormData(f => {
      const s = [...f.streams];
      s[idx] = { ...s[idx], [field]: value };
      return { ...f, streams: s };
    });
  }

  return (
    <div className="space-y-8">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl
          ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── App Ad Settings ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
          <Tv className="w-5 h-5 text-emerald-400" /> App Ad Settings
          <span className="text-xs font-normal text-zinc-500 ml-1">(shown before each match in the app)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 flex items-center justify-between p-4 bg-zinc-800/40 rounded-xl border border-zinc-700">
            <div>
              <span className="block text-sm font-medium text-zinc-200">Enable Interstitial Ad</span>
              <span className="text-xs text-zinc-500">Show ad before match plays in the app</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={adConfig.adEnabled}
                onChange={e => setAdConfig(a => ({ ...a, adEnabled: e.target.checked }))}
                className="sr-only peer" />
              <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Full-Screen Ad Web URL</label>
            <input value={adConfig.adWebUrl}
              onChange={e => setAdConfig(a => ({ ...a, adWebUrl: e.target.value }))}
              placeholder="https://ads.adsterra.com/... (loads as full-screen web page)"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Auto-close After (seconds)</label>
            <input type="number" value={adConfig.adDuration} min={5} max={60}
              onChange={e => setAdConfig(a => ({ ...a, adDuration: parseInt(e.target.value) || 15 }))}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
          </div>
          <div className="flex items-end">
            <button onClick={saveAdConfig} disabled={savingAd}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50">
              <Save className="w-4 h-4" />
              {savingAd ? 'Saving…' : 'Save Ad Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Ads Screen Mobile Settings ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
          <Tv className="w-5 h-5 text-emerald-400" /> Ads Screen Mobile Settings
          <span className="text-xs font-normal text-zinc-500 ml-1">(shown as custom verification screen in mobile app)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 flex items-center justify-between p-4 bg-zinc-800/40 rounded-xl border border-zinc-700">
            <div>
              <span className="block text-sm font-medium text-zinc-200">Enable Custom Verification Screen</span>
              <span className="text-xs text-zinc-500">Require users to click ad and wait for timer to unlock stream</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={adConfig.adsScreenEnabled}
                onChange={e => setAdConfig(a => ({ ...a, adsScreenEnabled: e.target.checked }))}
                className="sr-only peer" />
              <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Headline</label>
            <input value={adConfig.adsScreenHeadline}
              onChange={e => setAdConfig(a => ({ ...a, adsScreenHeadline: e.target.value }))}
              placeholder="Activate Your Stream - Supporting Goalcast-TV"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Sub-Headline</label>
            <input value={adConfig.adsScreenSubheadline}
              onChange={e => setAdConfig(a => ({ ...a, adsScreenSubheadline: e.target.value }))}
              placeholder="Follow steps to access the video server"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Click Here Target Ad URL</label>
            <input value={adConfig.adsScreenClickUrl}
              onChange={e => setAdConfig(a => ({ ...a, adsScreenClickUrl: e.target.value }))}
              placeholder="https://example.com/your-ad-link"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Video Tutorial URL</label>
            <input value={adConfig.adsScreenTutorialUrl}
              onChange={e => setAdConfig(a => ({ ...a, adsScreenTutorialUrl: e.target.value }))}
              placeholder="https://youtube.com/..."
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Telegram Channel URL</label>
            <input value={adConfig.adsScreenTelegramUrl}
              onChange={e => setAdConfig(a => ({ ...a, adsScreenTelegramUrl: e.target.value }))}
              placeholder="https://t.me/..."
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Verification Timer (seconds)</label>
            <input type="number" value={adConfig.adsScreenDuration} min={5} max={60}
              onChange={e => setAdConfig(a => ({ ...a, adsScreenDuration: parseInt(e.target.value) || 15 }))}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
          </div>
          <div className="flex items-end">
            <button onClick={saveAdConfig} disabled={savingAd}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50">
              <Save className="w-4 h-4" />
              {savingAd ? 'Saving…' : 'Save Ads Screen Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* ── App Announcement Settings ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
          <AlertCircle className="w-5 h-5 text-emerald-400" /> App Announcement Settings
          <span className="text-xs font-normal text-zinc-500 ml-1">(shown as bullet notification/ticker in mobile app)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 flex items-center justify-between p-4 bg-zinc-800/40 rounded-xl border border-zinc-700">
            <div>
              <span className="block text-sm font-medium text-zinc-200">Enable Announcement Ticker</span>
              <span className="text-xs text-zinc-500">Show notification bar under header in mobile app</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={adConfig.announcementEnabled}
                onChange={e => setAdConfig(a => ({ ...a, announcementEnabled: e.target.checked }))}
                className="sr-only peer" />
              <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Announcement Text</label>
            <textarea value={adConfig.announcementText} rows={2}
              onChange={e => setAdConfig(a => ({ ...a, announcementText: e.target.value }))}
              placeholder="Enter ticker message here..."
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
          </div>
          <div className="flex items-end">
            <button onClick={saveAdConfig} disabled={savingAd}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50">
              <Save className="w-4 h-4" />
              {savingAd ? 'Saving…' : 'Save Announcement'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Live Matches ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Radio className="w-6 h-6 text-emerald-400" /> Live Matches
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">Manage matches shown in the GoalCast app</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20">
            <Plus className="w-4 h-4" /> Add Match
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <Radio className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No matches yet. Add your first live match!</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {matches.map((m) => (
                <div key={m.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors">
                  {m.thumbnail ? (
                    <img src={m.thumbnail} alt="" className="w-14 h-10 rounded-lg object-cover bg-zinc-800" />
                  ) : (
                    <div className="w-14 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-emerald-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-100 font-semibold truncate">{m.title}</span>
                      {m.isLive && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-zinc-500">{m.sport}{m.league ? ` (${m.league})` : ''}</span>
                      <span className="text-xs text-zinc-600">·</span>
                      <span className="text-xs text-zinc-500">{m.teamA?.name} vs {m.teamB?.name}</span>
                      <span className="text-xs text-zinc-600">·</span>
                      <span className="text-xs text-zinc-500">{m.streams?.length || 0} server{(m.streams?.length || 0) !== 1 ? 's' : ''}</span>
                      {m.isTemporary && (
                        <>
                          <span className="text-xs text-zinc-600">·</span>
                          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 font-medium">Temporary</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={async () => {
                      await fetch(`/api/admin/matches/${m.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isLive: !m.isLive }),
                      });
                      load();
                    }}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all
                        ${m.isLive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}`}>
                      {m.isLive ? 'Live' : 'Off'}
                    </button>
                    <button onClick={() => openEdit(m)}
                      className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteMatch(m.id)} disabled={deleting === m.id}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{modalMode === 'add' ? 'Add Match' : 'Edit Match'}</h2>
              <button onClick={() => setModalMode(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Match Info */}
              <div>
                <h3 className="text-emerald-400 text-sm font-semibold mb-3 border-b border-zinc-800 pb-2">Match Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Match Title *</label>
                    <input value={formData.title}
                      onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Argentina vs France — FIFA World Cup Final"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Sport</label>
                    <select value={formData.sport} onChange={e => setFormData(f => ({ ...f, sport: e.target.value }))}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                      {SPORTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">League / Tournament</label>
                    <input value={formData.league}
                      onChange={e => setFormData(f => ({ ...f, league: e.target.value }))}
                      placeholder="e.g. World Cup 2026 - Round 2"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Thumbnail URL (Leave empty for compact card view)</label>
                    <input value={formData.thumbnail}
                      onChange={e => setFormData(f => ({ ...f, thumbnail: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                  </div>
                </div>
              </div>

              {/* Teams */}
              <div>
                <h3 className="text-emerald-400 text-sm font-semibold mb-3 border-b border-zinc-800 pb-2">Teams</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Team A Name</label>
                    <input value={formData.teamA.name}
                      onChange={e => setFormData(f => ({ ...f, teamA: { ...f.teamA, name: e.target.value } }))}
                      placeholder="e.g. Argentina"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Team A Logo URL</label>
                    <input value={formData.teamA.logo}
                      onChange={e => setFormData(f => ({ ...f, teamA: { ...f.teamA, logo: e.target.value } }))}
                      placeholder="https://..."
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Team B Name</label>
                    <input value={formData.teamB.name}
                      onChange={e => setFormData(f => ({ ...f, teamB: { ...f.teamB, name: e.target.value } }))}
                      placeholder="e.g. France"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Team B Logo URL</label>
                    <input value={formData.teamB.logo}
                      onChange={e => setFormData(f => ({ ...f, teamB: { ...f.teamB, logo: e.target.value } }))}
                      placeholder="https://..."
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                  </div>
                </div>
              </div>

              {/* Stream Servers */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                  <h3 className="text-emerald-400 text-sm font-semibold">Stream Servers</h3>
                  <button onClick={addServer}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                    <PlusCircle className="w-3.5 h-3.5" /> Add Server
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.streams.map((s, idx) => (
                    <div key={idx} className="bg-zinc-800/40 border border-zinc-700/60 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-zinc-300">{s.label || `Server ${idx + 1}`}</span>
                        {formData.streams.length > 1 && (
                          <button onClick={() => removeServer(idx)} className="text-red-400 hover:text-red-300">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input value={s.label}
                          onChange={e => updateServer(idx, 'label', e.target.value)}
                          placeholder="Server label (e.g. Server 1, HD, Mirror)"
                          className="w-full bg-zinc-900/60 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-600 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                        <input value={s.url}
                          onChange={e => updateServer(idx, 'url', e.target.value)}
                          placeholder="Stream URL (m3u8 or direct link)"
                          className="w-full bg-zinc-900/60 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-600 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                        <textarea value={s.embedCode}
                          onChange={e => updateServer(idx, 'embedCode', e.target.value)}
                          placeholder='HTML embed code (optional): <iframe src="..." ...>'
                          rows={2}
                          className="w-full bg-zinc-900/60 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-600 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
                <div>
                  <span className="block text-sm font-medium text-zinc-200">Mark as Live</span>
                  <span className="text-xs text-zinc-500">Show LIVE badge on the match card</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.isLive}
                    onChange={e => setFormData(f => ({ ...f, isLive: e.target.checked }))}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>

              {/* Temporary Match Expiry */}
              <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-medium text-zinc-200">One-Night / Temporary Match</span>
                    <span className="text-xs text-zinc-500">Enable automatic countdown timer in the app</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isTemporary}
                      onChange={e => setFormData(f => ({ ...f, isTemporary: e.target.checked }))}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>
                {formData.isTemporary && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Expiration Date & Time *</label>
                      <input type="datetime-local" value={formData.endsAt}
                        onChange={e => setFormData(f => ({ ...f, endsAt: e.target.value }))}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-xs text-zinc-500 flex items-center mr-1">Quick Add:</span>
                      {[1, 2, 3, 6, 12, 24].map(hours => (
                        <button
                          key={hours}
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setHours(d.getHours() + hours);
                            const tzoffset = d.getTimezoneOffset() * 60000;
                            const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
                            setFormData(f => ({ ...f, endsAt: localISOTime }));
                          }}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors"
                        >
                          +{hours}h
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setModalMode(null)}
                className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all font-medium text-sm">
                Cancel
              </button>
              <button onClick={saveMatch} disabled={!formData.title}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-bold transition-all text-sm shadow-lg shadow-emerald-500/20">
                {modalMode === 'add' ? 'Add Match' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
