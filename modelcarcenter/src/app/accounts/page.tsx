'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { listAccounts } from '@/api/accounts';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AccountsIndexPage() {
  const accountsQuery = useQuery({ queryKey: ['accounts'], queryFn: listAccounts });

  if (accountsQuery.isLoading) {
    return <LoadingSpinner label="Loading accounts" />;
  }

  if (accountsQuery.error) {
    return (
      <div className="card-surface text-sm text-rose-100">
        {(accountsQuery.error as { message?: string }).message ?? 'Unable to fetch accounts.'}
      </div>
    );
  }

  const accounts = accountsQuery.data ?? [];

  return (
    <div className="card-surface space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Accounts</h1>
        <p className="text-sm text-slate-400">Choose an account to view detailed listings and analytics.</p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {accounts.map((account) => (
          <li key={account.id} className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">{account.name}</h2>
                <p className="text-xs text-slate-400">{account.email}</p>
              </div>
              <span className="rounded-full border border-slate-800/70 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300">
                {account.type}
              </span>
            </div>
            <Link
              href={`/accounts/${account.id}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-200 transition hover:text-brand-100"
            >
              View details →
            </Link>
          </li>
        ))}
        {!accounts.length ? <li className="text-sm text-slate-400">No accounts created yet.</li> : null}
      </ul>
    </div>
  );
}
