'use client';

import Link from 'next/link';
import { BookOpen, Shield, FileText, Calendar, Info } from 'lucide-react';

const pages = [
  {
    href: '/admin/pages/about',
    label: 'About Us',
    desc: 'Edit the hero text, stats, our story, and values cards.',
    icon: Info,
    color: 'emerald',
  },
  {
    href: '/admin/pages/privacy',
    label: 'Privacy Policy',
    desc: 'Edit all sections of the Privacy Policy page.',
    icon: Shield,
    color: 'blue',
  },
  {
    href: '/admin/pages/terms',
    label: 'Terms & Conditions',
    desc: 'Edit all sections of the Terms & Conditions page.',
    icon: FileText,
    color: 'amber',
  },
  {
    href: '/admin/pages/schedule',
    label: 'World Cup Schedule',
    desc: 'Edit the schedule page hero title and description.',
    icon: Calendar,
    color: 'purple',
  },
];

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
};

export default function AdminPagesHub() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-emerald-400" />
          Page Content Editor
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Select a page below to edit its content. Changes are saved to the database and appear live on your site.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pages.map((page) => {
          const Icon = page.icon;
          const colorClass = colorMap[page.color];
          return (
            <Link
              key={page.href}
              href={page.href}
              className="group flex items-start gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {page.label}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{page.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
