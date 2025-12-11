'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createPaymentIntent, getPaymentIntent } from '@/api/payments';
import { listAccounts } from '@/api/accounts';
import { PaymentDialog } from '@/components/PaymentDialog';
import { StripeClientSecretCard } from '@/components/StripeClientSecretCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

const terminalStatuses = new Set(['succeeded', 'failed', 'canceled']);

const retailTimeline = [
  {
    id: 'requires_payment_method',
    label: 'Add to Bag',
    description: 'Set the amount and currency before kickoff.',
  },
  {
    id: 'requires_confirmation',
    label: 'Review & Confirm',
    description: 'Stripe validates payment details on submit.',
  },
  {
    id: 'processing',
    label: 'Processing',
    description: 'Payment is being authorized in real time.',
  },
  {
    id: 'requires_capture',
    label: 'Ready to Capture',
    description: 'Capture funds when you are ready to fulfill.',
  },
  {
    id: 'succeeded',
    label: 'Completed',
    description: 'Order is paid and ready to ship.',
  },
];

export default function PaymentsPage() {
  const { toast } = useToast();
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [latestPayment, setLatestPayment] = useState<Awaited<ReturnType<typeof createPaymentIntent>> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const accountsQuery = useQuery({ queryKey: ['accounts'], queryFn: listAccounts });

  const createPayment = useMutation({
    mutationFn: createPaymentIntent,
    onSuccess: (payment) => {
      setLatestPayment(payment);
      setActivePaymentId(payment.id);
      toast({ title: 'Payment intent created', description: payment.id, variant: 'success' });
    },
    onError: (error: { message?: string }) => {
      toast({ title: 'Payment intent failed', description: error.message ?? 'Unknown error', variant: 'error' });
    },
  });

  const paymentStatusQuery = useQuery({
    queryKey: ['payments', activePaymentId],
    queryFn: () => getPaymentIntent(activePaymentId as string),
    enabled: Boolean(activePaymentId),
    refetchInterval: (query) => {
      if (!query || terminalStatuses.has(query.status)) {
        return false;
      }
      return 3000;
    },
  });

  useEffect(() => {
    if (paymentStatusQuery.data) {
      setLatestPayment(paymentStatusQuery.data);
      if (terminalStatuses.has(paymentStatusQuery.data.status)) {
        toast({
          title: `Payment ${paymentStatusQuery.data.status}`,
          description: paymentStatusQuery.data.id,
          variant: paymentStatusQuery.data.status === 'succeeded' ? 'success' : 'warning',
        });
      }
    }
  }, [paymentStatusQuery.data, toast]);

  const accountCount = accountsQuery.data?.length ?? 0;

  const statusDisplay = useMemo(() => {
    if (!latestPayment) {
      return (
        <div className="rounded-[28px] border border-slate-200 bg-white/95 p-6 text-slate-800 shadow-lg shadow-slate-200/70">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">Order timeline</span>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">Track every payment like an order</h3>
          <p className="mt-2 text-sm text-slate-500">
            Start a checkout to see each milestone light up. You&apos;ll get live updates the moment Stripe advances the status.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">1 · Build your cart</p>
              <p className="text-xs text-slate-500">Pick an amount, currency, and optional storefront.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">2 · Watch fulfillment</p>
              <p className="text-xs text-slate-500">Statuses refresh every 3 seconds until complete.</p>
            </div>
          </div>
        </div>
      );
    }

    const timeline = retailTimeline.some((stage) => stage.id === latestPayment.status)
      ? retailTimeline
      : [...retailTimeline, { id: latestPayment.status, label: latestPayment.status, description: 'Stripe custom status.' }];
    const activeIndex = timeline.findIndex((stage) => stage.id === latestPayment.status);

    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-slate-900 shadow-xl shadow-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">Order timeline</span>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Payment progress</h3>
            <p className="text-xs text-slate-500">Stripe updates are mirrored here automatically.</p>
          </div>
          <span className="rounded-full border border-slate-200 px-4 py-1 text-sm font-semibold capitalize text-slate-900">
            {latestPayment.status}
          </span>
        </div>
        <div className="mt-6 space-y-4">
          {timeline.map((stage, index) => {
            const isActive = index === activeIndex;
            const isComplete = index < activeIndex;
            return (
              <div key={stage.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : isComplete
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-200 bg-white text-slate-400'
                    } text-[0.6rem] font-semibold`}
                  >
                    {isComplete ? '✓' : index + 1}
                  </span>
                  {index !== timeline.length - 1 ? (
                    <span className={`mt-1 h-10 w-px ${isComplete ? 'bg-emerald-200' : 'bg-slate-200'}`} aria-hidden />
                  ) : null}
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{stage.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Intent ID</p>
            <p className="mt-2 font-mono text-slate-900">{latestPayment.id}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Amount</p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {latestPayment.currency.toUpperCase()} {latestPayment.amount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Storefront</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{latestPayment.account_id ?? 'Unassigned'}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <p>Last updated · {paymentStatusQuery.data?.updated_at ?? '—'}</p>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-50"
            onClick={() => activePaymentId && paymentStatusQuery.refetch()}
          >
            Refresh status
          </button>
        </div>
      </div>
    );
  }, [activePaymentId, latestPayment, paymentStatusQuery]);

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-8 text-slate-900 shadow-2xl shadow-slate-200/80">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">Model Car Center Checkout</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.5rem]">Create a payment just like adding a car to your bag.</h1>
            <p className="text-sm text-slate-600">
              Choose the storefront, currency, and metadata you need and generate a Stripe client secret ready for your shopping experience.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white px-4 py-1 font-semibold">
                {accountCount} linked store{accountCount === 1 ? '' : 's'}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-4 py-1 font-semibold">
                {latestPayment ? `${latestPayment.currency.toUpperCase()} ${latestPayment.amount}` : 'No payments yet'}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-4 py-1 font-semibold">
                {paymentStatusQuery.isFetching ? 'Updating live' : 'Standing by'}
              </span>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-100 bg-white/90 p-6 shadow-lg shadow-slate-200/60">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Ready to create</p>
              <span className="text-xs text-slate-500">Safe Stripe sandbox</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Generate an intent and share the client secret with your checkout surface.</p>
            <div className="mt-5">
              <PaymentDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) {
                    createPayment.reset();
                  }
                }}
                onSubmit={async (values) => {
                  await createPayment.mutateAsync(values);
                }}
                isSubmitting={createPayment.isPending}
                accounts={accountsQuery.data ?? []}
                latestPayment={latestPayment}
              />
            </div>
            {createPayment.isPending ? (
              <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                Submitting intent…
              </div>
            ) : null}
            {createPayment.isError ? (
              <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-600">
                {(createPayment.error as { message?: string }).message ?? 'Failed to create payment intent.'}
              </div>
            ) : null}
            <p className="mt-4 text-xs text-slate-500">Latest intent ID · {latestPayment?.id ?? '—'}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-6">
          {statusDisplay}
        </section>

        <aside className="space-y-6">
          <StripeClientSecretCard payment={latestPayment} />
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-xl shadow-slate-200/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-slate-400">Live updates</span>
                <h3 className="mt-2 text-base font-semibold text-slate-900">Polling overview</h3>
                <p className="text-xs text-slate-500">Every 3 seconds we request the latest Stripe status.</p>
              </div>
              <span className={`rounded-full border px-4 py-1 text-xs font-semibold ${paymentStatusQuery.isFetching ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                {paymentStatusQuery.isFetching ? 'Updating' : 'Idle'}
              </span>
            </div>
            <dl className="mt-4 grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-slate-400">Active intent</dt>
                <dd className="mt-2 font-mono text-slate-900">{activePaymentId ?? 'None'}</dd>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-slate-400">Last updated</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900">{paymentStatusQuery.data?.updated_at ?? '—'}</dd>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-slate-400">Next refresh</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900">
                  {paymentStatusQuery.isFetching ? 'Auto · 3s cadence' : 'Manual refresh'}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-slate-400">Terminal?</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900">
                  {latestPayment && terminalStatuses.has(latestPayment.status) ? 'Yes · settled' : 'Pending'}
                </dd>
              </div>
            </dl>
          </div>
          {accountsQuery.isLoading ? <LoadingSpinner label="Fetching accounts" /> : null}
        </aside>
      </div>
    </div>
  );
}
