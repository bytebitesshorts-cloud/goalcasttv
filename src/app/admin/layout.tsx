'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Tv2,
  LayoutDashboard,
  Radio,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Trophy,
  Megaphone,
  BookOpen,
  Images,
} from 'lucide-react';

const navItems = [
  { href: '/admin/channels', label: 'Channels', icon: Radio },
  { href: '/admin/blog', label: 'Blog Posts', icon: FileText },
  { href: '/admin/pages', label: 'Pages', icon: BookOpen },
  { href: '/admin/slider', label: 'Slider', icon: Images },
  { href: '/admin/ticker', label: 'Match Ticker', icon: Trophy },
  { href: '/admin/ads', label: 'Ads', icon: Megaphone },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  // Verify session on mount (not needed on login page)
  useEffect(() => {
    if (pathname === '/admin') {
      setChecking(false);
      return;
    }
    // Quick check by calling a protected API
    fetch('/api/admin/settings')
      .then((r) => {
        if (r.status === 401) {
          router.replace('/admin');
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        router.replace('/admin');
      });
  }, [pathname, router]);

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin');
  }

  if (pathname === '/admin') {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 z-30
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Tv2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">
              Goal<span className="text-emerald-400">Cast</span>
            </p>
            <p className="text-xs text-zinc-500">Admin Panel</p>
          </div>
          <button
            className="ml-auto lg:hidden text-zinc-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-zinc-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-150"
          >
            <LayoutDashboard className="w-4 h-4" />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            id="admin-logout-btn"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-white text-sm">
            Goal<span className="text-emerald-400">Cast</span> Admin
          </span>
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
