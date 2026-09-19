import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'AuraCareer - Your Personal AI University',
    template: '%s | AuraCareer',
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
  authors: [{ name: 'AuraCareer' }],
  creator: 'AuraCareer',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AuraCareer',
    title: 'AuraCareer - Your Personal AI University',
    description: 'Learn any subject with an intelligent AI professor.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AuraCareer - Your Personal AI University',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Inter:wght@300;400;500;600;700;800&family=Patrick+Hand&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
