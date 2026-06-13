import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | GoalCast',
  description: 'GoalCast privacy policy — how we handle your data.',
};

const DEFAULT_SECTIONS = [
  { heading: '1. Introduction', body: 'Welcome to GoalCast ("we", "our", "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website at goalcast-tv.vercel.app.' },
  { heading: '2. Information We Collect', body: 'We collect minimal data to provide the best experience. We store your preferences (theme, favorites, recently watched channels) locally in your browser. This data never leaves your device. We may use anonymized analytics to improve our service. No personally identifiable information is collected.' },
  { heading: '3. How We Use Your Information', body: 'We use information to provide and maintain the GoalCast service, to remember your preferences (dark mode, favorite channels), to improve our content and user experience, and to operate the admin panel securely.' },
  { heading: '4. Third-Party Streams', body: 'GoalCast indexes publicly available IPTV streams. We do not host any video content ourselves. When you play a stream, your device connects directly to the third-party stream provider. We are not responsible for the privacy practices of those providers.' },
  { heading: '5. Data Sharing', body: 'We do not sell, trade, or rent your personal information to third parties. We do not share any personal data because we do not collect it.' },
  { heading: '6. Children\'s Privacy', body: 'GoalCast is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us.' },
  { heading: '7. Changes to This Policy', body: 'We may update this Privacy Policy from time to time. We will notify you by updating the "Last updated" date. Continued use of GoalCast after changes constitutes your acceptance of the new policy.' },
  { heading: '8. Contact Us', body: 'If you have questions about this Privacy Policy, please reach out via our website.' },
];

async function getPrivacyContent() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://goalcast-tv.vercel.app'}/api/admin/pages/page_privacy`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data?.sections?.length) return data.sections;
  } catch { /* fallback */ }
  return DEFAULT_SECTIONS;
}

export default async function PrivacyPage() {
  const sections = await getPrivacyContent();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-500 transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Privacy Policy</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Last updated: June 2026</p>
        </div>
      </div>

      <div className="space-y-8 text-zinc-700 dark:text-zinc-300">
        {sections.map((sec: { heading: string; body: string }, i: number) => (
          <section key={i}>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{sec.heading}</h2>
            <p className="leading-relaxed">{sec.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
