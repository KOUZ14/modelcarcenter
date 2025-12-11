import type { PaymentIntent } from '@/types';

interface StripeClientSecretCardProps {
  payment?: PaymentIntent | null;
}

export function StripeClientSecretCard({ payment }: StripeClientSecretCardProps) {
  if (!payment) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-xl shadow-slate-200/70">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-slate-400">Client secret</p>
        <h3 className="mt-3 text-xl font-semibold text-slate-900">No payment yet</h3>
        <p className="text-xs text-slate-500">Create a payment to unlock the secret you can plug into your checkout sandbox.</p>
        <div className="mt-5 space-y-3 text-xs text-slate-500">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">1 · Configure</p>
            <p className="mt-1">Enter amount, currency, and optional storefront.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">2 · Generate</p>
            <p className="mt-1">
              Stripe returns a <code className="rounded bg-slate-200 px-1 text-[0.7rem] text-slate-800">client_secret</code>.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700">
            <p className="text-sm font-semibold">3 · Test</p>
            <p className="mt-1">Use 4242 4242 4242 4242 · 04/42 · 424 in Stripe test mode.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-xl shadow-slate-200/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-slate-400">Client secret</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Latest payment intent</h3>
          <p className="text-xs text-slate-500">Paste this code into your checkout demo to mimic a real order.</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold capitalize text-slate-700">
          {payment.status}
        </span>
      </div>
      <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4">
        <p className="text-[0.6rem] uppercase tracking-[0.4em] text-slate-400">Secret</p>
        <code className="mt-2 block overflow-x-auto rounded-2xl bg-white px-3 py-3 text-xs text-slate-900">
          {payment.client_secret ?? 'Unavailable'}
        </code>
        <p className="mt-2 text-[0.7rem] text-slate-500">Intent • {payment.id}</p>
      </div>
      <dl className="mt-4 grid gap-4 text-xs text-slate-500 sm:grid-cols-3">
        <div>
          <dt className="text-slate-400">Amount</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">
            {payment.currency.toUpperCase()} {payment.amount}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Storefront</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">{payment.account_id ?? 'Unassigned'}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Updated</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">{payment.updated_at ?? '—'}</dd>
        </div>
      </dl>
      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
        Use Stripe&apos;s test cards: <code>4242 4242 4242 4242</code> exp <code>04/42</code> CVC <code>424</code> to simulate checkout.
      </div>
    </div>
  );
}
