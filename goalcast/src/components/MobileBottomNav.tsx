'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Star, Tv2 } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Scores', href: '/scores', icon: Trophy },
  { label: 'Favorites', href: '/favorites', icon: Star },
  { label: 'Live TV', href: '/watch/active', icon: Tv2 },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 mobile-nav-glass"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold
                transition-all duration-200 relative
                ${isActive
                  ? 'text-emerald-400'
                  : 'text-zinc-500 hover:text-zinc-300'}
              `}
              aria-label={label}
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20" />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                aria-hidden="true"
              />
              <span className="relative z-10 tracking-wide">{label}</span>
              {/* Active dot */}
              {isActive && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
