import type { Metadata } from 'next';
import { Inter, Patrick_Hand, Caveat } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const patrickHand = Patrick_Hand({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-patrick',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
});

export const metadata: Metadata = {
  title: {
    default: 'AURA Learn - Your Personal AI University',
    template: '%s | AURA Learn',
  },
  description:
    'Learn any subject with an intelligent AI professor that teaches step by step like a real human instructor. Interactive whiteboard, live coding, voice narration, and personalized learning.',
  keywords: [
    'AI education',
    'online learning',
    'AI teacher',
    'programming courses',
    'machine learning',
    'interactive classroom',
    'personalized learning',
  ],
  authors: [{ name: 'AURA Learn' }],
  creator: 'AURA Learn',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AURA Learn',
    title: 'AURA Learn - Your Personal AI University',
    description: 'Learn any subject with an intelligent AI professor.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AURA Learn - Your Personal AI University',
    description: 'Learn any subject with an intelligent AI professor.',
  },
  robots: {
    index: true,
    follow: true,
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
        <link rel="icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} ${patrickHand.variable} ${caveat.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
