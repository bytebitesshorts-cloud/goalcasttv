import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { UserPrefsProvider } from '@/context/UserPrefsContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import ScoresTicker from '@/components/ScoresTicker';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://goalcast-tv.vercel.app'),
  title: {
    default: 'GoalCast – Free Live Sports TV Worldwide',
    template: '%s | GoalCast',
  },
  description:
    'GoalCast streams live sports channels from every country. Watch football, cricket, basketball, tennis and more – free, worldwide, no subscription.',
  keywords: [
    'live sports TV',
    'free sports streaming',
    'football live stream',
    'cricket live',
    'sports channels worldwide',
    'IPTV sports',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://goalcast-tv.vercel.app',
    siteName: 'GoalCast',
    title: 'GoalCast – Free Live Sports TV Worldwide',
    description: 'Watch live sports channels from every country, for free.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'GoalCast' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoalCast – Free Live Sports TV Worldwide',
    description: 'Watch live sports channels from every country, for free.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme — inline script sets dark class before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var s = localStorage.getItem('goalcast-theme');
                  if (s === 'dark' || (!s && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3600961769317289"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${inter.variable} font-sans min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased`}
      >
        <ThemeProvider>
          <UserPrefsProvider>
            <ScoresTicker />
            <MaintenanceBanner />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </UserPrefsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
