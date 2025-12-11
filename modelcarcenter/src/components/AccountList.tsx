import clsx from 'clsx';
import type { AccountSummary } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';

interface AccountListProps {
  accounts: AccountSummary[];
  selectedAccountId?: string;
  onSelect: (account: AccountSummary) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function AccountList({ accounts, selectedAccountId, onSelect, onClear, isLoading }: AccountListProps) {
  return (
    <div className="card-surface relative overflow-hidden space-y-5">
      <div className="absolute -right-14 top-0 h-28 w-28 rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Boutiques</h2>
          <p className="text-xs text-slate-400">Select a storefront to browse its drop-ready inventory.</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white transition hover:-translate-y-[1px] hover:border-white/40 hover:bg-white/10"
        >
          Clear
        </button>
      </div>
      {isLoading ? (
        <LoadingSpinner label="Loading accounts" />
      ) : (
        <ul className="soft-grid rounded-2xl border border-slate-800/60 p-2">
          {accounts.map((account) => (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => onSelect(account)}
                className={clsx(
                  'group relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition duration-200 ease-out',
                  selectedAccountId === account.id
                    ? 'border-transparent bg-gradient-to-r from-brand-500/25 via-brand-500/15 to-accent-500/20 text-white shadow-card'
                    : 'border-transparent bg-slate-900/55 text-slate-200 hover:border-brand-400/30 hover:bg-slate-900/75'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{account.name}</p>
                    <p className="text-xs text-slate-400">{account.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right text-[11px] text-slate-400">
                    <span className="chip uppercase tracking-[0.2em] text-[10px]">
                      {account.type}
                    </span>
                    {account.stats?.listing_count !== undefined ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-200">
                        {account.stats.listing_count} listings
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <div className="absolute inset-x-2 bottom-0 h-14 rounded-t-full bg-gradient-to-t from-brand-500/25 via-brand-500/10 to-transparent blur-2xl" />
                </div>
              </button>
            </li>
          ))}
          {!accounts.length ? (
            <li className="rounded-xl border border-dashed border-slate-700/70 px-3.5 py-6 text-center text-sm text-slate-400">
              No accounts yet. Create one to get started.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
