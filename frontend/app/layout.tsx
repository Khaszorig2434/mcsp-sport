import type { Metadata } from 'next';
import { Roboto, Montserrat } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import ThemeProvider from '@/components/ThemeProvider';

const roboto = Roboto({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '700', '900'],
  variable: '--font-roboto',
  display:  'swap',
});

const montserrat = Montserrat({
  subsets:  ['latin'],
  weight:   ['400', '500', '700', '800', '900'],
  variable: '--font-montserrat',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'MCSP Sport Day',
  description: 'Multi-sport tournament tracking & analytics platform',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-surface">
        <ThemeProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
