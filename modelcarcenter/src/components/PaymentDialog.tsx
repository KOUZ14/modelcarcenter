'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { AccountSummary, PaymentIntent } from '@/types';

const schema = z.object({
  amount: z
    .coerce
    .number()
    .int('Amount must be an integer')
    .min(50, 'Minimum amount is 50 (smallest currency unit).'),
  currency: z
    .string()
    .min(3, 'Currency must be ISO alpha-3')
    .max(3, 'Currency must be ISO alpha-3'),
  account_id: z
    .string()
    .max(60)
    .optional()
    .transform((value) => (value ? value : undefined)),
  metadata: z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (!value) return;
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Metadata must be a JSON object with key/value pairs.',
          });
        }
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Metadata must be valid JSON.',
        });
      }
    }),
  idempotency: z.string().max(60).optional(),
});

type FormValues = z.infer<typeof schema>;
type PreparedPaymentPayload = Omit<FormValues, 'metadata'> & {
  metadata?: Record<string, string>;
};

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSubmit: (values: PreparedPaymentPayload) => Promise<void>;
  isSubmitting?: boolean;
  accounts: AccountSummary[];
  latestPayment?: PaymentIntent | null;
}

export function PaymentDialog({ open, onOpenChange, onSubmit, isSubmitting = false, accounts, latestPayment }: PaymentDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 1000,
      currency: 'usd',
      account_id: undefined,
      metadata: undefined,
      idempotency: undefined,
    },
  });

  const submit = handleSubmit(async (values) => {
    const metadataObject = values.metadata ? (JSON.parse(values.metadata) as Record<string, string>) : undefined;
    await onSubmit({
      ...values,
      currency: values.currency.toLowerCase(),
      metadata: metadataObject,
    });
    reset({ amount: 1000, currency: 'usd', account_id: values.account_id, metadata: undefined, idempotency: undefined });
    onOpenChange(false);
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:bg-black">
          Start checkout
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay data-dialog-overlay />
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <Dialog.Content data-dialog-content className="max-w-2xl rounded-[28px] border border-slate-200 bg-white p-8 text-slate-900 shadow-2xl shadow-slate-900/10">
            <Dialog.Title className="text-2xl font-semibold text-slate-900">Create checkout amount</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-slate-500">
              Enter the price, currency, and optional account before sharing the client secret with your storefront.
            </Dialog.Description>
            <form onSubmit={submit} className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Amount (smallest unit)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    min={50}
                    step={1}
                    {...register('amount')}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                    placeholder="1999"
                  />
                  {errors.amount ? <p className="text-xs text-rose-300">{errors.amount.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="currency" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Currency
                  </label>
                  <input
                    id="currency"
                    maxLength={3}
                    {...register('currency')}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 uppercase"
                    placeholder="USD"
                  />
                  {errors.currency ? <p className="text-xs text-rose-300">{errors.currency.message}</p> : null}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="account_id" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Account (optional)
                </label>
                <select
                  id="account_id"
                  {...register('account_id')}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                >
                  <option value="">Unassigned intent</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </option>
                  ))}
                </select>
                {errors.account_id ? <p className="text-xs text-rose-300">{errors.account_id.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label htmlFor="idempotency" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Idempotency key
                </label>
                <input
                  id="idempotency"
                  {...register('idempotency')}
                  placeholder={latestPayment?.id ?? 'optional-key-123'}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
                <p className="text-xs text-slate-500">
                  Provide a unique value to guard against duplicate intent submissions.
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="metadata" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Metadata JSON (optional)
                </label>
                <textarea
                  id="metadata"
                  {...register('metadata')}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                  placeholder='{"reference":"order-123"}'
                />
                {errors.metadata ? (
                  <p className="text-xs text-rose-300">{errors.metadata.message as string}</p>
                ) : null}
                <p className="text-xs text-slate-500">Parsed as key/value metadata on the Stripe intent.</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={isSubmitting || formSubmitting}
                  className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting || formSubmitting ? 'Creating…' : 'Create payment'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
