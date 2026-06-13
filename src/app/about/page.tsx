import type { Metadata } from 'next';
import Link from 'next/link';
import { Tv2, Globe2, Zap, Users, Heart, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | GoalCast',
  description: 'Learn about GoalCast — our mission to bring free live sports to everyone, everywhere.',
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'Global Access': Globe2,
  'Always Fast': Zap,
  'Truly Free': Heart,
  'Community Powered': Users,
};

const DEFAULT = {
  heroTitle: 'About GoalCast',
  heroDesc: 'GoalCast was built with a simple mission: give every sports fan on Earth access to live sports TV — for free, forever, with no strings attached.',
  stats: [
    { value: '1,100+', label: 'Channels' },
    { value: '80+', label: 'Countries' },
    { value: '10+', label: 'Categories' },
    { value: '100%', label: 'Free' },
  ],
  storyParagraphs: [
    'GoalCast started as a personal project — a simple idea born out of frustration with expensive sports subscriptions and geo-restrictions. Why should where you live determine whether you can watch your favorite team?',
    'We built GoalCast on top of the incredible open-source IPTV community, organizing over 1,100 channels from 80+ countries into a clean, fast, and beautiful interface. No ads, no tracking, no registration — just sports.',
    'Today, GoalCast serves sports fans worldwide who want to watch football, cricket, basketball, tennis, F1, and more without paying a premium.',
  ],
  values: [
    { title: 'Global Access', desc: 'We believe sports should be borderless. GoalCast brings channels from every corner of the world into one place.' },
    { title: 'Always Fast', desc: 'Our lightweight interface loads instantly on any device, from the latest flagship phone to an old laptop.' },
    { title: 'Truly Free', desc: 'No subscriptions, no sign-ups, no paywalls. GoalCast will always be free for everyone.' },
    { title: 'Community Powered', desc: 'Our stream sources are powered by the open-source IPTV community. We stand on the shoulders of giants.' },
  ],
  ctaTitle: 'Ready to watch?',
  ctaDesc: 'Browse 1,100+ channels from 80+ countries — completely free.',
};

async function getAboutContent() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://goalcast-tv.vercel.app'}/api/admin/pages/page_about`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data && Object.keys(data).length > 0) return { ...DEFAULT, ...data };
  } catch { /* fallback */ }
  return DEFAULT;
}

export default async function AboutPage() {
  const c = await getAboutContent();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-500 transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
      </Link>

      {/* Hero */}
      <section className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
          <Tv2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tight">
          {c.heroTitle}
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          {c.heroDesc}
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        {c.stats.map((s: { value: string; label: string }) => (
          <div key={s.label} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-center hover:border-emerald-500/40 transition-colors">
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">{s.value}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Story */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Our Story</h2>
        <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {c.storyParagraphs.map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">What We Stand For</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {c.values.map((v: { title: string; desc: string }) => {
            const Icon = ICON_MAP[v.title] || Globe2;
            return (
              <div key={v.title} className="flex gap-4 p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{v.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center p-8 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-3xl">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">{c.ctaTitle}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">{c.ctaDesc}</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5">
          <Tv2 className="w-5 h-5" />
          Browse Channels
        </Link>
      </section>
    </div>
  );
}
