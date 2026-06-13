import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | GoalCast',
  description: 'GoalCast terms of service — rules for using the platform.',
};

export default function TermsPage() {
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
        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            By accessing or using GoalCast (<strong>goalcast.live</strong>), you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">2. Description of Service</h2>
          <p className="leading-relaxed">
            GoalCast is a directory and aggregator of publicly available IPTV stream links. We do not host, store, or transmit any video content. All streams are sourced from the open-source community and third-party providers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">3. Use of the Service</h2>
          <ul className="space-y-2 list-disc ml-5">
            <li>You must be at least 13 years of age to use GoalCast.</li>
            <li>You agree not to use the service for any unlawful purpose.</li>
            <li>You agree not to attempt to interfere with the service or servers.</li>
            <li>Commercial use of GoalCast&apos;s channel listings requires written permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">4. Disclaimer of Warranties</h2>
          <p className="leading-relaxed">
            GoalCast is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that streams will be available, error-free, or of any particular quality. Stream availability and quality are entirely dependent on third-party providers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">5. Content Responsibility</h2>
          <p className="leading-relaxed">
            GoalCast indexes publicly available streams. We are not responsible for the content of streams provided by third parties. If you believe any stream infringes on your copyright, please contact us and we will remove it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">6. Limitation of Liability</h2>
          <p className="leading-relaxed">
            To the maximum extent permitted by law, GoalCast and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">7. Intellectual Property</h2>
          <p className="leading-relaxed">
            The GoalCast name, logo, and website design are our intellectual property. Channel logos and names belong to their respective owners. GoalCast does not claim ownership of any third-party content indexed on this platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">8. Modifications to Terms</h2>
          <p className="leading-relaxed">
            We reserve the right to modify these Terms at any time. Continued use of GoalCast after changes constitutes your acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">9. Governing Law</h2>
          <p className="leading-relaxed">
            These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through good-faith negotiation before pursuing legal action.
          </p>
        </section>
      </div>
    </div>
  );
}
