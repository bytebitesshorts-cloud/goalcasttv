'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Settings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export default function MaintenanceBanner() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  if (!settings?.maintenanceMode || dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
        <p className="flex-1 text-sm font-medium text-center">
          {settings.maintenanceMessage}
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss maintenance notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
