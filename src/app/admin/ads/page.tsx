'use client';

import { useState, useEffect } from 'react';
import { Save, Megaphone, Check, AlertCircle } from 'lucide-react';

export default function AdsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [type, setType] = useState<'custom' | 'adsense'>('custom');
  const [customHtml, setCustomHtml] = useState('');
  const [adsenseClientId, setAdsenseClientId] = useState('');
  const [adsenseSlotId, setAdsenseSlotId] = useState('');

  // Mid-list ad state
  const [midListAdEnabled, setMidListAdEnabled] = useState(false);
  const [midListAdType, setMidListAdType] = useState<'custom' | 'adsense'>('adsense');
  const [midListAdHtml, setMidListAdHtml] = useState('');
  const [midListAdAfterEvery, setMidListAdAfterEvery] = useState(2);

  useEffect(() => {
    fetch('/api/admin/ads')
      .then((res) => res.json())
      .then((data) => {
        setEnabled(data.enabled || false);
        setType(data.type || 'custom');
        setCustomHtml(data.customHtml || '');
        setAdsenseClientId(data.adsenseClientId || '');
        setAdsenseSlotId(data.adsenseSlotId || '');
        setMidListAdEnabled(data.midListAdEnabled || false);
        setMidListAdType(data.midListAdType || 'adsense');
        setMidListAdHtml(data.midListAdHtml || '');
        setMidListAdAfterEvery(data.midListAdAfterEvery ?? 5);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ text: 'Failed to load ad settings', type: 'error' });
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          type,
          customHtml,
          adsenseClientId,
          adsenseSlotId,
          midListAdEnabled,
          midListAdType,
          midListAdHtml,
          midListAdAfterEvery,
        }),
      });

      if (!res.ok) throw new Error('Failed to save settings');
      
      setMessage({ text: 'Ad settings saved successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Error saving settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Megaphone className="w-6 h-6 text-emerald-500" />
          Ad Space Configuration
        </h1>
        <p className="text-zinc-400 mt-2">
          Configure the advertisement or sponsor banner shown on the right side of the Watch page.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-zinc-800">
            <div>
              <h3 className="text-white font-medium">Enable Sidebar Ad</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Show an ad or sponsor banner on the watch page sidebar
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {enabled && (
            <div className="space-y-6 pt-4 border-t border-zinc-800">
              {/* Ad Type */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Ad Type
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setType('custom')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                      type === 'custom'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    Custom HTML / Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('adsense')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                      type === 'adsense'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    Google AdSense
                  </button>
                </div>
              </div>

              {/* Custom HTML Config */}
              {type === 'custom' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Custom HTML / Image Banner Code
                  </label>
                  <textarea
                    rows={6}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-sm"
                    placeholder={`<a href="https://sponsor.com" target="_blank">\n  <img src="https://sponsor.com/banner.jpg" alt="Sponsor" className="w-full rounded-lg" />\n</a>`}
                    value={customHtml}
                    onChange={(e) => setCustomHtml(e.target.value)}
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    Paste your custom HTML code here. This is perfect for direct sponsorships or affiliate banners.
                  </p>
                </div>
              )}

              {/* AdSense Config */}
              {type === 'adsense' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-200 flex gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-yellow-500" />
                    <p>
                      Note: You must also ensure the Google AdSense global script is added to your layout.
                    </p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Ad Client ID (data-ad-client)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="ca-pub-1234567890"
                        value={adsenseClientId}
                        onChange={(e) => setAdsenseClientId(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Ad Slot ID (data-ad-slot)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="1234567890"
                        value={adsenseSlotId}
                        onChange={(e) => setAdsenseSlotId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit/Message */}
          <div className="flex items-center gap-4 pt-6 border-t border-zinc-800">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 min-w-[120px]"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>

            {message && (
              <div
                className={`flex items-center gap-2 text-sm font-medium ${
                  message.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Mid-list ad section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-8">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
          Between Channels Ad
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Inject an ad unit between channel cards in the sidebar list on the Watch page.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-zinc-800 mb-6">
          <div>
            <h3 className="text-white font-medium">Enable Mid-List Ad</h3>
            <p className="text-sm text-zinc-400 mt-1">Show an ad between every N channels in the sidebar</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={midListAdEnabled}
              onChange={(e) => setMidListAdEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>

        {midListAdEnabled && (
          <div className="space-y-5">
            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Inject after every N channels
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={midListAdAfterEvery}
                onChange={(e) => setMidListAdAfterEvery(Number(e.target.value))}
                className="w-32 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <p className="text-xs text-zinc-500 mt-1">Default: 5 (ad after every 5th channel)</p>
            </div>

            {/* Ad type */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Ad Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setMidListAdType('adsense')}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                    midListAdType === 'adsense'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  Google AdSense
                </button>
                <button
                  type="button"
                  onClick={() => setMidListAdType('custom')}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                    midListAdType === 'custom'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  Custom HTML
                </button>
              </div>
            </div>

            {/* Custom HTML */}
            {midListAdType === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Custom HTML</label>
                <textarea
                  rows={5}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-sm"
                  placeholder='<a href="https://adnetwork.com" target="_blank">\n  <img src="https://adnetwork.com/banner.jpg" alt="Ad" />\n</a>'
                  value={midListAdHtml}
                  onChange={(e) => setMidListAdHtml(e.target.value)}
                />
                <p className="text-xs text-zinc-500 mt-1">Paste your Adsterra, PropellerAds, or other network HTML here.</p>
              </div>
            )}

            {midListAdType === 'adsense' && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-200">
                Your AdSense credentials (<code className="font-mono text-xs">ca-pub-3600961769317289</code>) will be used automatically.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
