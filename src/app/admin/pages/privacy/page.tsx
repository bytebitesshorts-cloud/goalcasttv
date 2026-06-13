'use client';

import { useState, useEffect } from 'react';
import { Shield, Save, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';

const DEFAULT_SECTIONS = [
  { heading: '1. Introduction', body: 'Welcome to GoalCast ("we", "our", "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website at goalcast-tv.vercel.app.' },
  { heading: '2. Information We Collect', body: 'We collect minimal data to provide the best experience. We store your preferences (theme, favorites, recently watched channels) locally in your browser. This data never leaves your device. We may use anonymized analytics (e.g., page views) to improve our service. No personally identifiable information is collected.' },
  { heading: '3. How We Use Your Information', body: 'We use information to provide and maintain the GoalCast service, to remember your preferences (dark mode, favorite channels), to improve our content and user experience, and to operate the admin panel securely.' },
  { heading: '4. Third-Party Streams', body: 'GoalCast indexes publicly available IPTV streams. We do not host any video content ourselves. When you play a stream, your device connects directly to the third-party stream provider. We are not responsible for the privacy practices of those providers.' },
  { heading: '5. Data Sharing', body: 'We do not sell, trade, or rent your personal information to third parties. We do not share any personal data because we do not collect it.' },
  { heading: '6. Children\'s Privacy', body: 'GoalCast is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us.' },
  { heading: '7. Changes to This Policy', body: 'We may update this Privacy Policy from time to time. We will notify you by updating the "Last updated" date at the top of this page. Continued use of GoalCast after changes constitutes your acceptance of the new policy.' },
  { heading: '8. Contact Us', body: 'If you have questions about this Privacy Policy, please reach out via our website.' },
];

type Section = { heading: string; body: string };

export default function AdminPrivacyEditor() {
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pages/page_privacy')
      .then((r) => r.json())
      .then((data) => {
        if (data?.sections?.length) setSections(data.sections);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch('/api/admin/pages/page_privacy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function update(idx: number, field: keyof Section, val: string) {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], [field]: val };
    setSections(updated);
  }

  function remove(idx: number) {
    setSections(sections.filter((_, i) => i !== idx));
  }

  function addSection() {
    setSections([...sections, { heading: '', body: '' }]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-zinc-950 py-4 z-10 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
            <p className="text-xs text-zinc-500">Edit the public Privacy Policy page</p>
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

      <div className="space-y-4">
        {sections.map((sec, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <input
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={sec.heading}
                placeholder="Section heading"
                onChange={(e) => update(i, 'heading', e.target.value)}
              />
              <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300 shrink-0" title="Remove section">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
              value={sec.body}
              placeholder="Section body text..."
              onChange={(e) => update(i, 'body', e.target.value)}
            />
          </div>
        ))}

        <button
          onClick={addSection}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>
    </div>
  );
}
