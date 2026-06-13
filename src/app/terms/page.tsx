import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | GoalCast',
  description: 'GoalCast terms of service — rules for using the platform.',
};

const DEFAULT_SECTIONS = [
  { heading: '1. Acceptance of Terms', body: 'By accessing or using GoalCast (goalcast-tv.vercel.app), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the service.' },
  { heading: '2. Description of Service', body: 'GoalCast is a directory and aggregator of publicly available IPTV stream links. We do not host, store, or transmit any video content. All streams are sourced from the open-source community and third-party providers.' },
  { heading: '3. Use of the Service', body: 'You must be at least 13 years of age to use GoalCast. You agree not to use the service for any unlawful purpose. You agree not to attempt to interfere with the service or servers. Commercial use of GoalCast\'s channel listings requires written permission.' },
  { heading: '4. Disclaimer of Warranties', body: 'GoalCast is provided "as is" without warranties of any kind. We do not guarantee that streams will be available, error-free, or of any particular quality. Stream availability and quality are entirely dependent on third-party providers.' },
  { heading: '5. Content Responsibility', body: 'GoalCast indexes publicly available streams. We are not responsible for the content of streams provided by third parties. If you believe any stream infringes on your copyright, please contact us and we will remove it promptly.' },
  { heading: '6. Limitation of Liability', body: 'To the maximum extent permitted by law, GoalCast and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the service.' },
  { heading: '7. Intellectual Property', body: 'The GoalCast name, logo, and website design are our intellectual property. Channel logos and names belong to their respective owners. GoalCast does not claim ownership of any third-party content indexed on this platform.' },
  { heading: '8. Modifications to Terms', body: 'We reserve the right to modify these Terms at any time. Continued use of GoalCast after changes constitutes your acceptance of the revised Terms.' },
  { heading: '9. Governing Law', body: 'These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through good-faith negotiation before pursuing legal action.' },
];

async function getTermsContent() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://goalcast-tv.vercel.app'}/api/admin/pages/page_terms`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data?.sections?.length) return data.sections;
  } catch { /* fallback */ }
  return DEFAULT_SECTIONS;
}

export default async function TermsPage() {
  const sections = await getTermsContent();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-500 transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Terms &amp; Conditions</h1>
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
