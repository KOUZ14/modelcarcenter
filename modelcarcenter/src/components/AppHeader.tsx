'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Database, CreditCard, LayoutDashboard, Search } from 'lucide-react';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/accounts', label: 'Accounts', icon: Database },
];

export function AppHeader() {
  const pathname = usePathname();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-6 py-5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="badge-pill">Marketplace Ops</span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-[2.15rem]">
                ModelCarCenter Control Room
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Run listings, pricing, and payments for every diecast channel from one clean, creative cockpit.
              </p>
            </div>
          </div>
          <div className="glow-ring rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs text-slate-200 shadow-card">
            <p className="uppercase tracking-[0.28em] text-slate-400">Connected to</p>
            <p className="mt-1 text-sm font-medium text-white">{apiBase}</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="marketplace-divider" />
          <nav className="flex flex-wrap items-center gap-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'group flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                  pathname === href
                    ? 'border-transparent bg-gradient-to-r from-brand-500 via-brand-500/90 to-accent-500/80 text-white shadow-elevation'
                    : 'border-slate-800/70 bg-slate-900/60 text-slate-200 hover:border-brand-400/40 hover:bg-slate-900/80 hover:text-white'
                )}
              >
                <span className={clsx('rounded-full border px-2 py-1 transition', pathname === href ? 'border-white/20 bg-white/20' : 'border-slate-800/70 bg-slate-950 group-hover:border-brand-400/40 group-hover:bg-brand-500/10')}>
                  <Icon size={16} />
                </span>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
