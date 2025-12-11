'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Listing } from '@/types';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  currency: z.string().min(3).max(3),
  quantity: z.coerce.number().min(0).optional().default(0),
  status: z.string().optional(),
  description: z.string().max(400).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface ListingEditorModalProps {
  open: boolean;
  initialListing?: Listing | null;
  onClose: () => void;
  onSave: (values: FormValues) => void;
  isSaving?: boolean;
}

export function ListingEditorModal({ open, initialListing, onClose, onSave, isSaving = false }: ListingEditorModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialListing?.title ?? '',
      price: initialListing?.price ?? 0,
      currency: initialListing?.currency ?? 'USD',
      quantity: initialListing?.quantity ?? 0,
      status: initialListing?.status ?? 'draft',
      description: initialListing?.description ?? '',
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      title: initialListing?.title ?? '',
      price: initialListing?.price ?? 0,
      currency: initialListing?.currency ?? 'USD',
      quantity: initialListing?.quantity ?? 0,
      status: initialListing?.status ?? 'draft',
      description: initialListing?.description ?? '',
    });
  }, [initialListing, open, reset]);

  const submit = handleSubmit((values) => {
    onSave(values);
  });

  return (
    <Dialog.Root open={open} onOpenChange={(value) => (!value ? onClose() : null)}>
      <Dialog.Portal>
        <Dialog.Overlay data-dialog-overlay />
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <Dialog.Content data-dialog-content>
            <Dialog.Title className="text-lg font-semibold text-white">
              {initialListing ? 'Edit listing' : 'Add listing'}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-slate-400">
              Configure the inventory details shown to collectors.
            </Dialog.Description>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-xs font-medium uppercase tracking-wide text-slate-300">
                  Title
                </label>
                <input
                  id="title"
                  {...register('title')}
                  className="w-full rounded-xl border border-slate-800/80 bg-slate-950 px-4 py-2 text-sm text-slate-100"
                  placeholder="1:18 Ferrari SF90"
                />
                {errors.title ? <p className="text-xs text-rose-300">{errors.title.message}</p> : null}
              </div>
              <div className="grid gap-4 md:grid-cols-[1.5fr,1fr,1fr]">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-xs font-medium uppercase tracking-wide text-slate-300">
                    Price
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price')}
                    className="w-full rounded-xl border border-slate-800/80 bg-slate-950 px-4 py-2 text-sm text-slate-100"
                  />
                  {errors.price ? <p className="text-xs text-rose-300">{errors.price.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="currency" className="text-xs font-medium uppercase tracking-wide text-slate-300">
                    Currency
                  </label>
                  <input
                    id="currency"
                    maxLength={3}
                    {...register('currency')}
                    className="w-full rounded-xl border border-slate-800/80 bg-slate-950 px-4 py-2 text-sm text-slate-100 uppercase"
                  />
                  {errors.currency ? <p className="text-xs text-rose-300">{errors.currency.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-xs font-medium uppercase tracking-wide text-slate-300">
                    Quantity
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min={0}
                    {...register('quantity')}
                    className="w-full rounded-xl border border-slate-800/80 bg-slate-950 px-4 py-2 text-sm text-slate-100"
                  />
                  {errors.quantity ? <p className="text-xs text-rose-300">{errors.quantity.message}</p> : null}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-xs font-medium uppercase tracking-wide text-slate-300">
                  Status
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full rounded-xl border border-slate-800/80 bg-slate-950 px-4 py-2 text-sm text-slate-100"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                {errors.status ? <p className="text-xs text-rose-300">{errors.status.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-xs font-medium uppercase tracking-wide text-slate-300">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  {...register('description')}
                  className="w-full rounded-xl border border-slate-800/80 bg-slate-950 px-4 py-2 text-sm text-slate-100"
                  placeholder="Any special edition details, packaging notes, etc."
                />
                {errors.description ? <p className="text-xs text-rose-300">{errors.description.message}</p> : null}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-slate-700/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isSubmitting}
                  className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving || isSubmitting ? 'Saving…' : 'Save listing'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
