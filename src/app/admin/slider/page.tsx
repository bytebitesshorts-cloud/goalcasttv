"use client";

import { useEffect, useState } from 'react';
import { Save, Plus, X, RefreshCw } from 'lucide-react';

interface Slide {
  image: string;
  link: string;
  title?: string;
}

export default function SliderAdminPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch existing slides
  useEffect(() => {
    fetch('/api/admin/slider')
      .then((res) => res.json())
      .then((data) => {
        setSlides(data.slides || []);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ text: 'Failed to load slider data', type: 'error' });
        setLoading(false);
      });
  }, []);

  const handleAdd = () => {
    setSlides([...slides, { image: '', link: '', title: '' }]);
  };

  const handleRemove = (index: number) => {
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
  };

  const handleChange = (index: number, field: keyof Slide, value: string) => {
    const newSlides = slides.map((slide, i) => (i === index ? { ...slide, [field]: value } : slide));
    setSlides(newSlides);
  };

  const handleSyncMatches = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/slider/sync');
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();
      
      // Merge new slides with existing ones or replace entirely? 
      // User said: "add the data of all the matches of the group stage to the slider"
      // Replacing them might be destructive if they have custom slides, so we append them.
      setSlides(prev => [...prev, ...data.slides]);
      setMessage({ text: 'Live matches synced! Review them below and click Save.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Error syncing live matches', type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch('/api/admin/slider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides }),
      });
      if (!res.ok) throw new Error('Save failed');
      setMessage({ text: 'Slider saved successfully', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Error saving slider', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Save className="w-6 h-6 text-emerald-500" /> Slider Management
        </h1>
        <button
          onClick={handleSyncMatches}
          disabled={syncing}
          className="flex items-center gap-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> 
          {syncing ? 'Syncing...' : 'Auto-Sync Live Matches'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {slides.map((slide, idx) => (
          <div key={idx} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-white">Slide {idx + 1}</h2>
              <div className="flex items-center gap-3">
                <a
                  href={`/watch/slider-${idx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm font-medium transition-colors"
                  title="Save changes first before previewing"
                >
                  Preview Play
                </a>
                <button type="button" onClick={() => handleRemove(idx)} className="text-red-500 hover:text-red-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <label className="block text-sm font-medium text-zinc-300 mb-1">Slide Title</label>
            <input
              type="text"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 mb-4 text-white"
              value={slide.title || ''}
              onChange={(e) => handleChange(idx, 'title', e.target.value)}
              placeholder="e.g. Argentina vs Brazil"
            />
            
            <label className="block text-sm font-medium text-zinc-300 mb-1">Image URL</label>
            <input
              type="text"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 mb-4 text-white"
              value={slide.image || ''}
              onChange={(e) => handleChange(idx, 'image', e.target.value)}
              placeholder="https://example.com/image.jpg"
              required
            />
            
            <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
              <p className="text-xs text-emerald-400 mb-3 font-semibold uppercase tracking-wider">Video Source (Fill one)</p>
              
              <label className="block text-sm font-medium text-zinc-300 mb-1">Stream URL (M3U8)</label>
              <input
                type="text"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 mb-3 text-white placeholder:text-zinc-600"
                value={(slide as any).streamUrl || slide.link || ''}
                onChange={(e) => {
                  const newSlides = [...slides];
                  newSlides[idx] = { ...newSlides[idx], streamUrl: e.target.value, link: '' } as any;
                  setSlides(newSlides);
                }}
                placeholder="https://example.com/live.m3u8"
              />
              
              <div className="flex items-center gap-2 mb-3">
                <hr className="flex-1 border-zinc-800" />
                <span className="text-xs text-zinc-500 font-medium">OR</span>
                <hr className="flex-1 border-zinc-800" />
              </div>
              
              <label className="block text-sm font-medium text-zinc-300 mb-1">HTML Embed Code</label>
              <textarea
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-white placeholder:text-zinc-600 font-mono text-xs"
                rows={3}
                value={(slide as any).embedCode || ''}
                onChange={(e) => handleChange(idx, 'embedCode' as any, e.target.value)}
                placeholder='<iframe src="..." width="100%" height="100%"></iframe>'
              />
            </div>
          </div>
        ))}
        
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Slide
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-xl font-medium transition-colors ml-auto"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
