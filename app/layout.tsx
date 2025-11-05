import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'SafeTrade - Secure Escrow Service for Safe Online Transactions',
    template: '%s | SafeTrade'
  },
  description: 'SafeTrade provides secure escrow services for online transactions. Buy and sell with confidence using our trusted platform that protects both buyers and sellers.',
  keywords: [
    'escrow service',
    'secure transactions',
    'online marketplace',
    'buyer protection',
    'seller protection',
    'safe trading',
    'transaction security',
    'payment protection',
    'trusted escrow',
    'secure payments'
  ],
  authors: [{ name: 'SafeTrade', url: 'https://safetrade.app' }],
  creator: 'SafeTrade',
  publisher: 'SafeTrade',
  metadataBase: new URL('https://safetrade.app'),
  alternates: {
    canonical: 'https://safetrade.app',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'SafeTrade - Secure Escrow Service for Safe Online Transactions',
    description: 'Buy and sell with confidence using our trusted escrow platform that protects both parties.',
    url: 'https://safetrade.app',
    siteName: 'SafeTrade',
    images: [
      {
        url: '/safetrade-og.jpg',
        width: 1200,
        height: 630,
        alt: 'SafeTrade - Secure Escrow Service',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafeTrade - Secure Escrow Service',
    description: 'Buy and sell with confidence using our trusted escrow platform.',
    images: ['/safetrade-og.jpg'],
    creator: '@SafeTradeApp',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'business',
  classification: 'Financial Technology and Escrow Services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}