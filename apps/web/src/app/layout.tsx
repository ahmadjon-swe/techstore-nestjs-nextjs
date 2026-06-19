import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'TechStore — The Future of Devices', template: '%s · TechStore' },
  description:
    'New and certified pre-owned smartphones, laptops and electronics. Engineered experience, honest grading, instant checkout.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'),
  openGraph: { siteName: 'TechStore', type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#06070b' },
    { media: '(prefers-color-scheme: light)', color: '#f5f7fb' },
  ],
};

// Set the theme class before first paint to avoid a flash of the wrong palette.
const THEME_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem('techstore-prefs')||'{}');var t=p&&p.state&&p.state.theme;if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} h-full`}
      suppressHydrationWarning
    >
      <head />
      <body className="grain min-h-full flex flex-col antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
