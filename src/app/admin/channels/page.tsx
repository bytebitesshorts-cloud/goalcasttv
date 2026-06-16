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
  embedCode?: string;
  languages: string[];
  active?: boolean;
}

const EMPTY: Omit<Channel, 'id'> = {
  name: '', code: '', category: 'Sports', country: '', countryCode: '', logo: '', stream: '', embedCode: '', languages: [], active: true,
};

const CATEGORIES = ['FIFA 2026', 'Sports', 'News', 'Movies', 'Entertainment', 'Music', 'Kids', 'Documentary', 'General'];

const PAGE_SIZE = 20;

export default function AdminChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [formData, setFormData] = useState<Partial<Channel>>({ ...EMPTY });
  
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

  const uniqueCountries = Array.from(new Map(channels.map(c => [c.country, c.countryCode])).entries());

  const filtered = channels.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (c.country || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || (c.category || 'General') === filterCategory;
    const matchesStatus = filterStatus === 'all'
                          ? true
                          : filterStatus === 'active'
                            ? (c.active !== false)
                            : (c.active === false);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort channels by descending timestamp to show newest at the top
  const sorted = filtered.slice().sort((a, b) => {
    const tsA = a.id.startsWith('ch_') ? parseInt(a.id.split('_')[1]) : 0;
    const tsB = b.id.startsWith('ch_') ? parseInt(b.id.split('_')[1]) : 0;
    return tsB - tsA;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function saveForm() {
    if (modalMode === 'add') {
      const r = await fetch('/api/admin/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (r.ok) {
        showToast('Channel added!');
        setModalMode(null);
        load();
      } else {
        showToast('Failed to add channel', 'error');
      }
    } else if (modalMode === 'edit' && formData.id) {
      const r = await fetch(`/api/admin/channels/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (r.ok) {
        showToast('Channel updated!');
        setModalMode(null);
        load();
      } else {
        showToast('Update failed', 'error');
      }
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

  function openAdd() {
    setFormData({ ...EMPTY, code: getNextChannelCode() });
    setModalMode('add');
  }

  function openEdit(ch: Channel) {
    setFormData(ch);
    setModalMode('edit');
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
            <button onClick={() => { setFilterStatus('all'); setPage(1); }} className={`hover:text-white transition-colors ${filterStatus === 'all' ? 'text-white underline underline-offset-4' : 'text-zinc-400'}`}>{channels.length} total</button>
            <span className="text-zinc-600">•</span>
            <button onClick={() => { setFilterStatus('active'); setPage(1); }} className={`hover:text-emerald-300 transition-colors ${filterStatus === 'active' ? 'text-emerald-300 underline underline-offset-4' : 'text-emerald-500'}`}>{channels.filter(c => c.active !== false).length} active</button>
            <span className="text-zinc-600">•</span>
            <button onClick={() => { setFilterStatus('inactive'); setPage(1); }} className={`hover:text-zinc-300 transition-colors ${filterStatus === 'inactive' ? 'text-zinc-300 underline underline-offset-4' : 'text-zinc-500'}`}>{channels.filter(c => c.active === false).length} inactive</button>
          </div>
        </div>
        <button
          id="add-channel-btn"
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Add Channel
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            id="channel-search"
            type="text"
            placeholder="Search by name or country…"
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
        
        <select
          value={filterCategory}
          onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
          className="w-full sm:w-48 bg-zinc-900 border border-zinc-700/60 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 appearance-none"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
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
                          const newActive = !(ch.active !== false);
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
                          (ch.active !== false)
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {(ch.active !== false) ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setPreviewChannel(ch)}
                          className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Preview">
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openEdit(ch)}
                          className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteChannel(ch.id)} disabled={deleting === ch.id}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
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

      {/* Add / Edit Channel Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {modalMode === 'add' ? 'Add New Channel' : 'Edit Channel'}
              </h2>
              <button onClick={() => setModalMode(null)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Category 1: Location & Categorization */}
              <div>
                <h3 className="text-emerald-400 text-sm font-semibold mb-4 border-b border-zinc-800 pb-2">Location & Categorization</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Country</label>
                    <input
                      list="add-country-list"
                      value={formData.country || ''}
                      onChange={e => {
                        const ctry = e.target.value;
                        const code = uniqueCountries.find(u => u[0] === ctry)?.[1] || formData.countryCode || '';
                        setFormData(n => ({ ...n, country: ctry, countryCode: code }));
                      }}
                      placeholder="e.g. United States"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                    <datalist id="add-country-list">
                      {uniqueCountries.map(([c]) => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Country Code</label>
                    <input
                      value={formData.countryCode || ''}
                      onChange={e => setFormData(n => ({ ...n, countryCode: e.target.value }))}
                      placeholder="e.g. US"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Category</label>
                    <select
                      value={formData.category || 'Sports'}
                      onChange={e => setFormData(n => ({ ...n, category: e.target.value }))}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Category 2: General Details */}
              <div>
                <h3 className="text-emerald-400 text-sm font-semibold mb-4 border-b border-zinc-800 pb-2">General Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Channel Name *</label>
                    <input
                      value={formData.name || ''}
                      onChange={e => setFormData(n => ({ ...n, name: e.target.value }))}
                      placeholder="e.g. ESPN HD"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Channel Code</label>
                    <input
                      value={formData.code || ''}
                      onChange={e => setFormData(n => ({ ...n, code: e.target.value }))}
                      placeholder="e.g. espn.hd"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>
              </div>

              {/* Category 3: Media & Stream */}
              <div>
                <h3 className="text-emerald-400 text-sm font-semibold mb-4 border-b border-zinc-800 pb-2">Media & Stream</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Logo URL</label>
                    <input
                      value={formData.logo || ''}
                      onChange={e => setFormData(n => ({ ...n, logo: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Stream URL (M3U8)</label>
                    <input
                      value={formData.stream || ''}
                      onChange={e => setFormData(n => ({ ...n, stream: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">HTML Embed Code</label>
                    <textarea
                      value={formData.embedCode || ''}
                      onChange={e => setFormData(n => ({ ...n, embedCode: e.target.value }))}
                      placeholder='<iframe src="https://..." width="100%" height="100%" allowfullscreen></iframe>'
                      rows={4}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y"
                    />
                    <p className="text-xs text-zinc-600 mt-1">Paste iframe or HTML embed code. Used instead of Stream URL when provided.</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
                <div>
                  <span className="block text-sm font-medium text-zinc-200">Active Status</span>
                  <span className="text-xs text-zinc-500">Enable or disable this channel globally</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.active ?? true}
                    onChange={e => setFormData(n => ({ ...n, active: e.target.checked }))}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setModalMode(null)}
                className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all font-medium text-sm">
                Cancel
              </button>
              <button onClick={saveForm} disabled={!formData.name || (!formData.stream && !formData.embedCode)}
                id="save-channel-btn"
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all text-sm shadow-lg shadow-emerald-500/20">
                {modalMode === 'add' ? 'Add Channel' : 'Save Changes'}
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
              <VideoPlayer src={previewChannel.stream} channelName={previewChannel.name} embedCode={previewChannel.embedCode} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
