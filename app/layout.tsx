import type { Metadata } from 'next';
import './globals.css';
import PWAInstallBanner from '@/components/common/PWAInstallBanner';

export const metadata: Metadata = {
  title: 'Finglora — Create your nail moment',
  description: 'From inspiration on hands to your hands. Customize each nail, try it on, and share your Design Passport.',
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/finglora_logo.png',
    apple: '/assets/finglora_logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://xwfazcaxniogiyyaovau.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://xwfazcaxniogiyyaovau.supabase.co" />
        <meta name="theme-color" content="#E0246A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Finglora" />
      </head>
      <body>
        <PWAInstallBanner />
        {children}
      </body>
    </html>
  );
}
