/**
 * Loading skeleton components for channel grids and player
 */

/** Skeleton card for country grid */
export function CountryCardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col items-center gap-3 p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
      <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-4 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-3 w-16 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
    </div>
  );
}

/** Skeleton card for channel grid */
export function ChannelCardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col items-center gap-3 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
      <div className="w-16 h-16 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-4 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-5 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700" />
    </div>
  );
}

/** Skeleton for video player */
export function PlayerSkeleton() {
  return (
    <div className="animate-pulse w-full aspect-video rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-zinc-300 dark:bg-zinc-700" />
    </div>
  );
}
