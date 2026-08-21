import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { Providers } from './providers';
import { common } from '@/content/common';

// latin-ext covers the Bosnian diacritics (š, č, ć, đ, ž).
const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: `${common.appName} — ${common.appTagline}`,
  description: 'Sistem bodovanja za Soapbox utrku: ocjene sudija, vremena i rang lista uživo.',
  // Nothing here is public, so keep the whole app out of search results.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  // Judges hold this at arm's length in daylight; the navy is the page ground
  // even in the browser chrome.
  themeColor: '#0B1436',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs" className={poppins.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
