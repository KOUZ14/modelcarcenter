'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AccountType } from '@/types';

const schema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(120, 'Name must be under 120 characters'),
  email: z.string().email('Enter a valid email address'),
  type: z.enum(['collector', 'shop']),
});

type FormValues = z.infer<typeof schema>;

interface AccountFormProps {
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const accountTypes: { value: AccountType; label: string; description: string }[] = [
  { value: 'collector', label: 'Collector', description: 'Curate a personal collection and wishlist.' },
  { value: 'shop', label: 'Shop', description: 'Manage inventory, pricing, and sales readiness.' },
];

export function AccountForm({ onSubmit, isSubmitting = false }: AccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      type: 'collector',
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    reset({ name: '', email: '', type: 'collector' });
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-200">
          Display name
        </label>
        <input
          id="name"
          {...register('name')}
          placeholder="Midtown Collectibles"
          className="w-full rounded-xl border border-slate-800/80 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 shadow-inner transition focus:border-brand-400/80"
        />
        {errors.name ? <p className="text-xs text-rose-300">{errors.name.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-200">
          Contact email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-slate-800/80 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 shadow-inner transition focus:border-brand-400/80"
        />
        {errors.email ? <p className="text-xs text-rose-300">{errors.email.message}</p> : null}
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-200">Account type</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {accountTypes.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer flex-col gap-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 text-sm text-slate-200 shadow-sm transition hover:border-brand-400/60"
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  value={option.value}
                  {...register('type')}
                  className="h-4 w-4 border-slate-700 text-brand-400 focus:ring-brand-400"
                />
                <span className="font-semibold text-white">{option.label}</span>
              </div>
              <span className="pl-7 text-xs text-slate-400">{option.description}</span>
            </label>
          ))}
        </div>
        {errors.type ? <p className="text-xs text-rose-300">{errors.type.message}</p> : null}
      </fieldset>
      <button
        type="submit"
        disabled={isSubmitting || formSubmitting}
        className="w-full rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting || formSubmitting ? 'Creating…' : 'Create account'}
      </button>
    </form>
  );
}
