import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AppHeader } from '@/components/AppHeader';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'ModelCarCenter • Ops Console',
  description:
    'Manage accounts, listings, marketplace search, and Stripe payments for the ModelCarCenter platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 text-slate-100 antialiased`}>
        <Providers>
          <AppHeader />
          <main className="mx-auto flex min-h-[calc(100vh-5.5rem)] w-full max-w-6xl flex-col gap-8 px-6 py-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
