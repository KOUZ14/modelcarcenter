import type { Metadata } from 'next';
import { DM_Sans, Inter, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout';

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
});

const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'ModelCarCenter • Premium Model Car Search',
  description:
    'Discover rare and collectible model cars from trusted sellers worldwide. The premier destination for serious model car collectors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${inter.variable} ${geistMono.variable} bg-background text-foreground antialiased`}>
        <Providers>
          <Header />
          <main className="mx-auto flex min-h-[calc(100vh-5.5rem)] w-full max-w-7xl flex-col gap-8 px-6 py-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
