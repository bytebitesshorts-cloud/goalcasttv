'use client';

import { useTheme } from '@/context/ThemeContext';

/**
 * Animated sun/moon theme toggle switch
 * Uses a sliding track with CSS transitions (~300ms ease-in-out)
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative flex items-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
    >
      {/* Track */}
      <span
        className={`
          relative inline-flex items-center w-14 h-7 rounded-full transition-colors duration-300 ease-in-out
          ${isDark
            ? 'bg-emerald-500/30 border border-emerald-500/50'
            : 'bg-amber-200 border border-amber-300'}
        `}
      >
        {/* Icons inside track */}
        <span className="absolute left-1 text-sm select-none pointer-events-none">
          🌙
        </span>
        <span className="absolute right-1 text-sm select-none pointer-events-none">
          ☀️
        </span>

        {/* Sliding knob */}
        <span
          className={`
            absolute w-5 h-5 rounded-full shadow-md transition-transform duration-300 ease-in-out
            ${isDark
              ? 'translate-x-1 bg-emerald-400'
              : 'translate-x-7 bg-amber-400'}
          `}
        />
      </span>
    </button>
  );
}
