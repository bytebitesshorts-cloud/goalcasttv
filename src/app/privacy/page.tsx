import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | GoalCast',
  description: 'GoalCast privacy policy — how we handle your data.',
};

export default function PrivacyPage() {
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

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-zinc-700 dark:text-zinc-300">

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">1. Introduction</h2>
          <p className="leading-relaxed">
            Welcome to <strong>GoalCast</strong> (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website at <strong>goalcast.live</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">2. Information We Collect</h2>
          <p className="leading-relaxed mb-3">We collect minimal data to provide the best experience:</p>
          <ul className="space-y-2 list-disc ml-5">
            <li><strong>Local Storage Data:</strong> We store your preferences (theme, favorites, recently watched channels) locally in your browser. This data never leaves your device.</li>
            <li><strong>Usage Analytics:</strong> We may use anonymized analytics (e.g., page views) to improve our service. No personally identifiable information is collected.</li>
            <li><strong>Cookies:</strong> We use session cookies for the admin panel only. No tracking cookies are used for regular visitors.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">3. How We Use Your Information</h2>
          <ul className="space-y-2 list-disc ml-5">
            <li>To provide and maintain the GoalCast service</li>
            <li>To remember your preferences (dark mode, favorite channels)</li>
            <li>To improve our content and user experience</li>
            <li>To operate the admin panel securely</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">4. Third-Party Streams</h2>
          <p className="leading-relaxed">
            GoalCast indexes publicly available IPTV streams. We do not host any video content ourselves. When you play a stream, your device connects directly to the third-party stream provider. We are not responsible for the privacy practices of those providers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">5. Data Sharing</h2>
          <p className="leading-relaxed">
            We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We do not share any personal data because we do not collect it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">6. Children&apos;s Privacy</h2>
          <p className="leading-relaxed">
            GoalCast is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">7. Changes to This Policy</h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you by updating the &quot;Last updated&quot; date at the top of this page. Continued use of GoalCast after changes constitutes your acceptance of the new policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">8. Contact Us</h2>
          <p className="leading-relaxed">
            If you have questions about this Privacy Policy, please reach out via our website.
          </p>
        </section>
      </div>
    </div>
  );
}
