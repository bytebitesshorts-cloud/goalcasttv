'use client';

import { useState, useEffect } from 'react';
import { FileText, Save, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';

const DEFAULT_SECTIONS = [
  { heading: '1. Acceptance of Terms', body: 'By accessing or using GoalCast (goalcast-tv.vercel.app), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the service.' },
  { heading: '2. Description of Service', body: 'GoalCast is a directory and aggregator of publicly available IPTV stream links. We do not host, store, or transmit any video content. All streams are sourced from the open-source community and third-party providers.' },
  { heading: '3. Use of the Service', body: 'You must be at least 13 years of age to use GoalCast. You agree not to use the service for any unlawful purpose. You agree not to attempt to interfere with the service or servers. Commercial use of GoalCast\'s channel listings requires written permission.' },
  { heading: '4. Disclaimer of Warranties', body: 'GoalCast is provided "as is" without warranties of any kind. We do not guarantee that streams will be available, error-free, or of any particular quality. Stream availability and quality are entirely dependent on third-party providers.' },
  { heading: '5. Content Responsibility', body: 'GoalCast indexes publicly available streams. We are not responsible for the content of streams provided by third parties. If you believe any stream infringes on your copyright, please contact us and we will remove it promptly.' },
  { heading: '6. Limitation of Liability', body: 'To the maximum extent permitted by law, GoalCast and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the service.' },
  { heading: '7. Intellectual Property', body: 'The GoalCast name, logo, and website design are our intellectual property. Channel logos and names belong to their respective owners. GoalCast does not claim ownership of any third-party content indexed on this platform.' },
  { heading: '8. Modifications to Terms', body: 'We reserve the right to modify these Terms at any time. Continued use of GoalCast after changes constitutes your acceptance of the revised Terms.' },
  { heading: '9. Governing Law', body: 'These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through good-faith negotiation before pursuing legal action.' },
];

type Section = { heading: string; body: string };

export default function AdminTermsEditor() {
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pages/page_terms')
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
    await fetch('/api/admin/pages/page_terms', {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-zinc-950 py-4 z-10 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Terms & Conditions</h1>
            <p className="text-xs text-zinc-500">Edit the public Terms & Conditions page</p>
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
              <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <input
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y"
              value={sec.body}
              placeholder="Section body text..."
              onChange={(e) => update(i, 'body', e.target.value)}
            />
          </div>
        ))}

        <button
          onClick={() => setSections([...sections, { heading: '', body: '' }])}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>
    </div>
  );
}
