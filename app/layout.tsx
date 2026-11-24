import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Finglora — Create your nail moment',
  description: 'From inspiration on hands to your hands. Customize each nail, try it on, and share your Design Passport.',
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
      <body>{children}</body>
    </html>
  );
}
