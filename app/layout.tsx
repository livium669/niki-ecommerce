import React from 'react';
import Providers from './providers';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.BETTER_AUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Niki | Beyond Motion',
    template: '%s | Niki',
  },
  description: 'Experience the future of footwear with Niki. Premium cinematic design meets unparalleled performance.',
  openGraph: {
    title: 'Niki | Beyond Motion',
    description: 'Experience the future of footwear with Niki. Premium cinematic design meets unparalleled performance.',
    url: '/',
    siteName: 'Niki',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Niki | Beyond Motion',
    description: 'Experience the future of footwear with Niki.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
