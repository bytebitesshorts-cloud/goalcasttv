'use client';

import { useState, useEffect } from 'react';
import { Settings, AlertTriangle, CheckCircle2, Lock, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';

interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  adminPassword?: string;
  adminUsername?: string;
  vpnPopupEnabled?: boolean;
  vpnPopupTitle?: string;
  vpnPopupMessage?: string;
  vpnPopupButtonText?: string;
  vpnPopupButtonLink?: string;
  vpnPopupImage?: string;
  appVersionCode?: number;
  appVersionName?: string;
  appApkUrl?: string;
  appReleaseNotes?: string;
  appForceUpdate?: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    maintenanceMode: false,
    maintenanceMessage: "We're performing scheduled maintenance. We'll be back shortly!",
    adminPassword: '',
    adminUsername: 'admin',
    vpnPopupEnabled: true,
    vpnPopupTitle: 'Connect VPN For All Channel Access',
    vpnPopupMessage: 'To ensure you have unrestricted access to all our global channels without interruption, we recommend connecting to a VPN.',
    vpnPopupButtonText: 'Got it',
    vpnPopupButtonLink: '',
    vpnPopupImage: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(data);
        setNewUsername(data.adminUsername || 'admin');
        setLoading(false);
      });
  }, []);

  async function saveSettings(patch: Partial<SiteSettings>) {
    setSaving(true);
    const r = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (r.ok) {
      const updated = await r.json();
      setSettings(updated);
      showToast('Settings saved!');
    } else {
      showToast('Failed to save', 'error');
    }
  }

  async function handleCredentialsChange() {
    const patch: Partial<SiteSettings> = {};
    if (newUsername && newUsername !== settings.adminUsername) {
      patch.adminUsername = newUsername;
    }
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }
      if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }
      patch.adminPassword = newPassword;
    }

    if (Object.keys(patch).length === 0) {
      showToast('No changes to save', 'error');
      return;
    }

    await saveSettings(patch);
    setNewPassword('');
    setConfirmPassword('');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl
          ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Settings className="w-6 h-6 text-emerald-400" />
        Settings
      </h1>

      {/* Maintenance Mode */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Maintenance Mode</h2>
            <p className="text-sm text-zinc-400 mt-0.5">
              Show a maintenance banner to all visitors. The site remains accessible.
            </p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/60">
          <div>
            <p className="text-sm font-medium text-zinc-200">Maintenance Banner</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Currently: {settings.maintenanceMode ? (
                <span className="text-orange-400 font-medium">ON — Banner is visible</span>
              ) : (
                <span className="text-emerald-400 font-medium">OFF — Site is normal</span>
              )}
            </p>
          </div>
          <button
            id="maintenance-toggle"
            onClick={() => saveSettings({ maintenanceMode: !settings.maintenanceMode })}
            disabled={saving}
            className="transition-colors disabled:opacity-50"
            aria-label="Toggle maintenance mode"
          >
            {settings.maintenanceMode ? (
              <ToggleRight className="w-10 h-10 text-orange-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-zinc-500" />
            )}
          </button>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Maintenance Message</label>
          <textarea
            id="maintenance-message"
            value={settings.maintenanceMessage}
            onChange={e => setSettings(s => ({ ...s, maintenanceMessage: e.target.value }))}
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
          />
          <button
            onClick={() => saveSettings({ maintenanceMessage: settings.maintenanceMessage })}
            disabled={saving}
            className="mt-2 px-4 py-2 text-sm font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl transition-colors disabled:opacity-50"
          >
            Save Message
          </button>
        </div>
      </div>

      {/* Notification Popup Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Notification Popup (VPN / Telegram)</h2>
            <p className="text-sm text-zinc-400 mt-0.5">
              Configure the popup that appears for new users. You can use this for VPN warnings, Telegram join requests, etc.
            </p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/60">
          <div>
            <p className="text-sm font-medium text-zinc-200">Enable Popup</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Currently: {settings.vpnPopupEnabled ? (
                <span className="text-emerald-400 font-medium">ON</span>
              ) : (
                <span className="text-zinc-500 font-medium">OFF</span>
              )}
            </p>
          </div>
          <button
            onClick={() => saveSettings({ vpnPopupEnabled: !settings.vpnPopupEnabled })}
            disabled={saving}
            className="transition-colors disabled:opacity-50"
            aria-label="Toggle popup"
          >
            {settings.vpnPopupEnabled ? (
              <ToggleRight className="w-10 h-10 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-zinc-500" />
            )}
          </button>
        </div>

        {/* Edit fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Popup Title</label>
            <input
              type="text"
              value={settings.vpnPopupTitle || ''}
              onChange={e => setSettings(s => ({ ...s, vpnPopupTitle: e.target.value }))}
              placeholder="E.g., Join our Telegram!"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Message</label>
            <textarea
              value={settings.vpnPopupMessage || ''}
              onChange={e => setSettings(s => ({ ...s, vpnPopupMessage: e.target.value }))}
              rows={3}
              placeholder="Your message goes here..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Button Text</label>
              <input
                type="text"
                value={settings.vpnPopupButtonText || ''}
                onChange={e => setSettings(s => ({ ...s, vpnPopupButtonText: e.target.value }))}
                placeholder="E.g., Join Now"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Button Link</label>
              <input
                type="text"
                value={settings.vpnPopupButtonLink || ''}
                onChange={e => setSettings(s => ({ ...s, vpnPopupButtonLink: e.target.value }))}
                placeholder="https://t.me/yourchannel (leave empty to just close)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Image URL (Optional)</label>
            <input
              type="text"
              value={settings.vpnPopupImage || ''}
              onChange={e => setSettings(s => ({ ...s, vpnPopupImage: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <button
            onClick={() => saveSettings({
              vpnPopupTitle: settings.vpnPopupTitle,
              vpnPopupMessage: settings.vpnPopupMessage,
              vpnPopupButtonText: settings.vpnPopupButtonText,
              vpnPopupButtonLink: settings.vpnPopupButtonLink,
              vpnPopupImage: settings.vpnPopupImage,
            })}
            disabled={saving}
            className="mt-2 px-4 py-2 text-sm font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl transition-colors disabled:opacity-50"
          >
            Save Popup Details
          </button>
        </div>
      </div>

      {/* App Updates Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Mobile App Updates</h2>
            <p className="text-sm text-zinc-400 mt-0.5">Push OTA updates to all Android users.</p>
          </div>
        </div>

        {/* Force Update Toggle */}
        <div className="flex items-center justify-between p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/60">
          <div>
            <p className="text-sm font-medium text-zinc-200">Force Update</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Require users to update before they can use the app.
            </p>
          </div>
          <button
            onClick={() => saveSettings({ appForceUpdate: !settings.appForceUpdate })}
            disabled={saving}
            className="transition-colors disabled:opacity-50"
          >
            {settings.appForceUpdate ? (
              <ToggleRight className="w-10 h-10 text-purple-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-zinc-500" />
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Version Code</label>
              <input
                type="number"
                value={settings.appVersionCode || ''}
                onChange={e => setSettings(s => ({ ...s, appVersionCode: parseInt(e.target.value) || 1 }))}
                placeholder="e.g. 2"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Version Name</label>
              <input
                type="text"
                value={settings.appVersionName || ''}
                onChange={e => setSettings(s => ({ ...s, appVersionName: e.target.value }))}
                placeholder="e.g. 1.0.1"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">APK Download URL</label>
            <input
              type="text"
              value={settings.appApkUrl || ''}
              onChange={e => setSettings(s => ({ ...s, appApkUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Release Notes</label>
            <textarea
              value={settings.appReleaseNotes || ''}
              onChange={e => setSettings(s => ({ ...s, appReleaseNotes: e.target.value }))}
              rows={3}
              placeholder="What's new in this version..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
          </div>

          <button
            onClick={() => saveSettings({
              appVersionCode: settings.appVersionCode,
              appVersionName: settings.appVersionName,
              appApkUrl: settings.appApkUrl,
              appReleaseNotes: settings.appReleaseNotes,
            })}
            disabled={saving}
            className="mt-2 px-4 py-2 text-sm font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-xl transition-colors disabled:opacity-50"
          >
            Save App Update Details
          </button>
        </div>
      </div>

      {/* Change Credentials */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Admin Credentials</h2>
            <p className="text-sm text-zinc-400 mt-0.5">Update your admin panel username and password.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Username</label>
            <input
              type="text"
              id="admin-username-input"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="Admin username"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">New Password (leave blank to keep current)</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <button
            onClick={handleCredentialsChange}
            disabled={saving || (!newPassword && newUsername === settings.adminUsername)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm"
          >
            {saving ? 'Saving…' : 'Update Credentials'}
          </button>
        </div>
      </div>
    </div>
  );
}
