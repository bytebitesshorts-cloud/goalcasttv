'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, Save, Radio,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Play
} from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

interface Channel {
  id: string;
  name: string;
  code: string;
  category: string;
  country: string;
  countryCode: string;
  logo: string;
  stream: string;
  languages: string[];
  active?: boolean;
}

const EMPTY: Omit<Channel, 'id'> = {
  name: '', code: '', category: 'Sports', country: '', countryCode: '', logo: '', stream: '', languages: [], active: true,
};

const CATEGORIES = ['FIFA 2026', 'Sports', 'News', 'Movies', 'Entertainment', 'Music', 'Kids', 'Documentary', 'General'];

const PAGE_SIZE = 20;

export default function AdminChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Channel>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newChannel, setNewChannel] = useState({ ...EMPTY });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewChannel, setPreviewChannel] = useState<Channel | null>(null);

  const getNextChannelCode = useCallback(() => {
    let maxNum = 0;
    channels.forEach(ch => {
      if (ch.code && typeof ch.code === 'string' && ch.code.startsWith('CH-')) {
        const num = parseInt(ch.code.replace('CH-', '').trim(), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    return `CH-${maxNum + 1}`;
  }, [channels]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/channels');
      if (r.ok) setChannels(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function saveEdit(id: string) {
    const r = await fetch(`/api/admin/channels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    if (r.ok) {
      showToast('Channel updated!');
      setEditingId(null);
      load();
    } else {
      showToast('Update failed', 'error');
    }
  }

  async function deleteChannel(id: string) {
    setDeleting(id);
    const r = await fetch(`/api/admin/channels/${id}`, { method: 'DELETE' });
    if (r.ok) {
      showToast('Channel deleted');
      load();
    } else {
      showToast('Delete failed', 'error');
    }
    setDeleting(null);
  }

  async function addChannel() {
    const r = await fetch('/api/admin/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChannel),
    });
    if (r.ok) {
      showToast('Channel added!');
      setShowAdd(false);
      setNewChannel({ ...EMPTY });
      load();
    } else {
      showToast('Failed to add channel', 'error');
    }
  }

  return (
    <div className="space-y-6">
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
            <Radio className="w-6 h-6 text-emerald-400" />
            Channels
          </h1>
          <div className="flex items-center gap-2.5 mt-1 text-sm font-semibold">
            <span className="text-zinc-400">{channels.length} total</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400">{channels.filter(c => c.active !== false).length} active</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-500">{channels.filter(c => c.active === false).length} inactive</span>
          </div>
        </div>
        <button
          id="add-channel-btn"
          onClick={() => {
            const nextCode = getNextChannelCode();
            setNewChannel({ ...EMPTY, code: nextCode });
            setShowAdd(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Add Channel
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          id="channel-search"
          type="text"
          placeholder="Search by name, country, or category…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-700/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  <th className="px-4 py-3 text-zinc-400 font-medium">Name</th>
                  <th className="px-4 py-3 text-zinc-400 font-medium hidden sm:table-cell">Country</th>
                  <th className="px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-zinc-400 font-medium hidden lg:table-cell">Stream URL</th>
                  <th className="px-4 py-3 text-zinc-400 font-medium w-24">Status</th>
                  <th className="px-4 py-3 text-zinc-400 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {paged.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-zinc-500 py-12">No channels found</td></tr>
                )}
                {paged.map(ch => (
                  <tr key={ch.id} className="group hover:bg-zinc-800/40 transition-colors">
                    {editingId === ch.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input value={editData.name ?? ch.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                        </td>
                        <td className="px-4 py-2 hidden sm:table-cell">
                          <input value={editData.country ?? ch.country} onChange={e => setEditData(d => ({ ...d, country: e.target.value }))}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                        </td>
                        <td className="px-4 py-2 hidden md:table-cell">
                          <select value={editData.category ?? ch.category ?? 'Sports'}
                            onChange={e => setEditData(d => ({ ...d, category: e.target.value }))}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2 hidden lg:table-cell">
                          <input value={editData.stream ?? ch.stream} onChange={e => setEditData(d => ({ ...d, stream: e.target.value }))}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                        </td>
                        <td className="px-4 py-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={editData.active ?? ch.active ?? true}
                              onChange={e => setEditData(d => ({ ...d, active: e.target.checked }))}
                              className="sr-only peer" />
                            <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                          </label>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => saveEdit(ch.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors" title="Save">
                              <Save className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 text-zinc-400 hover:bg-zinc-700 rounded-lg transition-colors" title="Cancel">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {ch.logo ? (
                              <img src={ch.logo} alt="" onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }} className="w-7 h-7 rounded object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                                {ch.name?.charAt(0) || '?'}
                              </div>
                            )}
                            <span className="text-zinc-100 font-medium truncate max-w-[140px]">{ch.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-zinc-400">{ch.country}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                            {ch.category || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-zinc-500 text-xs max-w-[200px] truncate">{ch.stream}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={async () => {
                              const newActive = !(ch.active ?? true);
                              const r = await fetch(`/api/admin/channels/${ch.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ active: newActive }),
                              });
                              if (r.ok) {
                                showToast(`Channel ${newActive ? 'enabled' : 'disabled'}`);
                                load();
                              } else {
                                showToast('Failed to update status', 'error');
                              }
                            }}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                              (ch.active ?? true)
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                            }`}
                          >
                            {(ch.active ?? true) ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setPreviewChannel(ch)}
                              className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Preview">
                              <Play className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { setEditingId(ch.id); setEditData({}); }}
                              className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteChannel(ch.id)} disabled={deleting === ch.id}
                              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-zinc-300 px-2">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Channel Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Add New Channel</h2>
              <button onClick={() => setShowAdd(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Channel Name *', key: 'name', placeholder: 'e.g. ESPN HD' },
                { label: 'Channel Code', key: 'code', placeholder: 'e.g. espn.hd' },
                { label: 'Country', key: 'country', placeholder: 'e.g. United States' },
                { label: 'Country Code', key: 'countryCode', placeholder: 'e.g. US' },
                { label: 'Logo URL', key: 'logo', placeholder: 'https://...' },
                { label: 'Stream URL (M3U8) *', key: 'stream', placeholder: 'https://...' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm text-zinc-400 mb-1">{label}</label>
                  <input
                    value={(newChannel[key as keyof typeof newChannel] as string) || ''}
                    onChange={e => setNewChannel(n => ({ ...n, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Category</label>
                <select
                  value={newChannel.category || 'Sports'}
                  onChange={e => setNewChannel(n => ({ ...n, category: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-zinc-800/60 mt-2">
                <span className="text-sm text-zinc-400">Active Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={newChannel.active ?? true}
                    onChange={e => setNewChannel(n => ({ ...n, active: e.target.checked }))}
                    className="sr-only peer" />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all text-sm">
                Cancel
              </button>
              <button onClick={addChannel} disabled={!newChannel.name || !newChannel.stream}
                id="save-channel-btn"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all text-sm">
                Add Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewChannel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-500" />
                Preview: {previewChannel.name}
              </h2>
              <button onClick={() => setPreviewChannel(null)} className="text-zinc-400 hover:text-white transition-colors p-1 bg-zinc-800 rounded-lg hover:bg-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-black">
              <VideoPlayer src={previewChannel.stream} channelName={previewChannel.name} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
