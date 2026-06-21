'use client';

import { useRouter } from 'next/navigation';
import type { Channel } from '@/types';

interface ServerSwitcherProps {
  servers: Channel[];
  currentId: string;
}

export default function ServerSwitcher({ servers, currentId }: ServerSwitcherProps) {
  const router = useRouter();

  function navigate(id: string) {
    router.push(`/watch/${id}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {servers.map((srv, idx) => {
        const isCurrent = srv.id === currentId;
        return isCurrent ? (
          <span
            key={srv.id}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold shadow-sm cursor-default"
          >
            Server {idx + 1}
          </span>
        ) : (
          <button
            key={srv.id}
            onClick={() => navigate(srv.id)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium border border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 hover:text-emerald-500 transition-colors"
          >
            Server {idx + 1}
          </button>
        );
      })}
    </div>
  );
}
