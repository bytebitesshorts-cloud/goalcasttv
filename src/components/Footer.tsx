'use client';

import Link from 'next/link';
import { Tv2, BookOpen, Info, Shield, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';

/**
 * Site footer — updated with Blog, About, Privacy, Terms links
 */
export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top row */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-0 justify-between mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Tv2 className="w-6 h-6 text-emerald-500" aria-hidden="true" />
              <span className="font-bold text-lg text-zinc-800 dark:text-zinc-200">
                Goal<span className="text-emerald-500">Cast</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
              Free live sports TV from every corner of the world. No subscriptions, no sign-ups.
            </p>
          </div>

          {/* Link groups */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Navigate</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors">
                    <BookOpen className="w-3.5 h-3.5" />
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors">
                    <Info className="w-3.5 h-3.5" />
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors">
                    <Shield className="w-3.5 h-3.5" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Source</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/iptv-org/iptv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    Stream Source
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} GoalCast. Sports TV, worldwide.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            Built with ❤️ for sports fans everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
