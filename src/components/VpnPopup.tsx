'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function VpnPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('vpnPopupShown');
    if (!hasSeenPopup) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('vpnPopupShown', 'true');
    setTimeout(() => setShouldRender(false), 300); // Wait for transition
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 pointer-events-auto transition-all duration-300 transform ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
        }`}
      >
        {/* Top decorative gradient */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 dark:from-emerald-500/10 dark:to-blue-500/10" />

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/50 dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/10 backdrop-blur-md transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
        </button>

        <div className="relative px-6 pt-10 pb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 shadow-inner ring-8 ring-emerald-50 dark:ring-emerald-500/10">
            <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          <h2 className="mb-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Connect VPN For All Channel Access
          </h2>
          
          <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            To ensure you have unrestricted access to all our global channels without interruption, we recommend connecting to a VPN.
          </p>

          <button
            onClick={handleClose}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-emerald-500/30"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
