import Link from 'next/link';
import { Home, Tv2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Tv2 className="w-16 h-16 text-emerald-500 mb-4" aria-hidden="true" />
      <h1 className="text-6xl font-extrabold text-zinc-900 dark:text-white mb-2">404</h1>
      <p className="text-xl font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
        Page Not Found
      </p>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-xs">
        Looks like this channel or page doesn&apos;t exist. Head back to browse live sports.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        id="not-found-home-link"
      >
        <Home className="w-4 h-4" aria-hidden="true" />
        Back to GoalCast
      </Link>
    </div>
  );
}
