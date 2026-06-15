"use client";

import { useEffect, useState } from 'react';
import { Save, Plus, X } from 'lucide-react';

interface Slide {
  image: string;
  link: string;
  title?: string;
}

export default function SliderAdminPage() {
  const [loading, setLoading] = useState(true);
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
      <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Save className="w-6 h-6 text-emerald-500" /> Slider Management
      </h1>
      {message && (
        <div className={`mb-4 text-sm font-medium ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSave} className="space-y-6">
        {slides.map((slide, idx) => (
          <div key={idx} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-white">Slide {idx + 1}</h2>
              <button type="button" onClick={() => handleRemove(idx)} className="text-red-500 hover:text-red-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Image URL</label>
            <input
              type="text"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 mb-2 text-white"
              value={slide.image}
              onChange={(e) => handleChange(idx, 'image', e.target.value)}
              placeholder="https://example.com/image.jpg"
              required
            />
            <label className="block text-sm font-medium text-zinc-300 mb-1">Target Link</label>
            <input
              type="text"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 mb-2 text-white"
              value={slide.link}
              onChange={(e) => handleChange(idx, 'link', e.target.value)}
              placeholder="https://example.com/match"
              required
            />
            <label className="block text-sm font-medium text-zinc-300 mb-1">Title (optional)</label>
            <input
              type="text"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 mb-2 text-white"
              value={slide.title || ''}
              onChange={(e) => handleChange(idx, 'title', e.target.value)}
              placeholder="Match title"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-medium"
        >
          <Plus className="w-4 h-4" /> Add Slide
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-xl font-medium"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </form>
    </div>
  );
}
