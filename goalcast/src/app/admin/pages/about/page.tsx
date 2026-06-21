'use client';

import { useState, useEffect } from 'react';
import { Info, Save, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';

const DEFAULT_CONTENT = {
  heroTitle: 'About GoalCast',
  heroDesc: 'GoalCast was built with a simple mission: give every sports fan on Earth access to live sports TV — for free, forever, with no strings attached.',
  stats: [
    { value: '1,100+', label: 'Channels' },
    { value: '80+', label: 'Countries' },
    { value: '10+', label: 'Categories' },
    { value: '100%', label: 'Free' },
  ],
  storyParagraphs: [
    'GoalCast started as a personal project — a simple idea born out of frustration with expensive sports subscriptions and geo-restrictions. Why should where you live determine whether you can watch your favorite team?',
    'We built GoalCast on top of the incredible open-source IPTV community, organizing over 1,100 channels from 80+ countries into a clean, fast, and beautiful interface. No ads, no tracking, no registration — just sports.',
    'Today, GoalCast serves sports fans worldwide who want to watch football, cricket, basketball, tennis, F1, and more without paying a premium.',
  ],
  values: [
    { title: 'Global Access', desc: 'We believe sports should be borderless. GoalCast brings channels from every corner of the world into one place.' },
    { title: 'Always Fast', desc: 'Our lightweight interface loads instantly on any device, from the latest flagship phone to an old laptop.' },
    { title: 'Truly Free', desc: 'No subscriptions, no sign-ups, no paywalls. GoalCast will always be free for everyone.' },
    { title: 'Community Powered', desc: 'Our stream sources are powered by the open-source IPTV community. We stand on the shoulders of giants.' },
  ],
  ctaTitle: 'Ready to watch?',
  ctaDesc: 'Browse 1,100+ channels from 80+ countries — completely free.',
};

type Content = typeof DEFAULT_CONTENT;

export default function AdminAboutEditor() {
  const [content, setContent] = useState<Content>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pages/page_about')
      .then((r) => r.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setContent({ ...DEFAULT_CONTENT, ...data });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch('/api/admin/pages/page_about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function updateStat(idx: number, field: 'value' | 'label', val: string) {
    const stats = [...content.stats];
    stats[idx] = { ...stats[idx], [field]: val };
    setContent({ ...content, stats });
  }

  function updateParagraph(idx: number, val: string) {
    const storyParagraphs = [...content.storyParagraphs];
    storyParagraphs[idx] = val;
    setContent({ ...content, storyParagraphs });
  }

  function updateValue(idx: number, field: 'title' | 'desc', val: string) {
    const values = [...content.values];
    values[idx] = { ...values[idx], [field]: val };
    setContent({ ...content, values });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-zinc-950 py-4 z-10 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Info className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">About Us</h1>
            <p className="text-xs text-zinc-500">Edit the public About Us page</p>
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

      <div className="space-y-8">
        {/* Hero */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Hero Section</h2>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Hero Title</label>
            <input
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={content.heroTitle}
              onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Hero Description</label>
            <textarea
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
              value={content.heroDesc}
              onChange={(e) => setContent({ ...content, heroDesc: e.target.value })}
            />
          </div>
        </section>

        {/* Stats */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Stats Cards</h2>
          <div className="grid grid-cols-2 gap-4">
            {content.stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  value={stat.value}
                  placeholder="Value (e.g. 1,100+)"
                  onChange={(e) => updateStat(i, 'value', e.target.value)}
                />
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  value={stat.label}
                  placeholder="Label (e.g. Channels)"
                  onChange={(e) => updateStat(i, 'label', e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Our Story Paragraphs</h2>
          {content.storyParagraphs.map((para, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 text-xs flex items-center justify-center shrink-0 mt-2">{i + 1}</span>
              <textarea
                rows={3}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                value={para}
                onChange={(e) => updateParagraph(i, e.target.value)}
              />
              <button
                onClick={() => {
                  const storyParagraphs = content.storyParagraphs.filter((_, idx) => idx !== i);
                  setContent({ ...content, storyParagraphs });
                }}
                className="text-red-400 hover:text-red-300 mt-2 shrink-0"
                title="Remove paragraph"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setContent({ ...content, storyParagraphs: [...content.storyParagraphs, ''] })}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add paragraph
          </button>
        </section>

        {/* Values */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Values Cards</h2>
          <div className="space-y-5">
            {content.values.map((v, i) => (
              <div key={i} className="space-y-2 pb-4 border-b border-zinc-800 last:border-0 last:pb-0">
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  value={v.title}
                  placeholder="Card title"
                  onChange={(e) => updateValue(i, 'title', e.target.value)}
                />
                <textarea
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  value={v.desc}
                  placeholder="Card description"
                  onChange={(e) => updateValue(i, 'desc', e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Call-to-Action</h2>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">CTA Title</label>
            <input
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={content.ctaTitle}
              onChange={(e) => setContent({ ...content, ctaTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">CTA Description</label>
            <input
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={content.ctaDesc}
              onChange={(e) => setContent({ ...content, ctaDesc: e.target.value })}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
