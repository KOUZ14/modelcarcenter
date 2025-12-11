'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { searchMarketplace } from '@/api/search';
import { SearchResultsGrid } from '@/components/SearchResultsGrid';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/hooks/useToast';
import { useAccountStore } from '@/store/account-store';

const schema = z.object({
  query: z
    .string()
    .refine((value) => value.trim().length === 0 || value.trim().length >= 2, {
      message: 'Enter at least 2 characters',
    }),
});

type FormValues = z.infer<typeof schema>;

export default function SearchPage() {
  const { toast } = useToast();
  const addToCart = useAccountStore((state) => state.addToCart);
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { query: '' },
  });

  const queryValue = watch('query') ?? '';
  const debouncedQuery = useDebouncedValue(queryValue, 500);

  const searchQuery = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchMarketplace(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
  });

  const onSubmit = handleSubmit(() => undefined);

  return (
    <div className="space-y-8">
      <header className="card-surface space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Marketplace search</h2>
          <p className="text-sm text-slate-400">
            Query the eBay-backed search endpoint and quickly stash interesting finds in your cart.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="query" className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Search for a model, brand, or SKU
            </label>
            <input
              id="query"
              type="search"
              {...register('query')}
              placeholder="Ferrari 488 Pista"
              className="w-full rounded-2xl border border-slate-800/80 bg-slate-950 px-4 py-3 text-sm text-slate-100 shadow-inner focus:border-brand-400/80"
            />
          </div>
          {errors.query ? <p className="text-xs text-rose-300">{errors.query.message}</p> : null}
          <p className="text-xs text-slate-500">Results auto-refresh after you pause typing for 500ms.</p>
        </form>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Results</h3>
          {searchQuery.isFetching ? <span className="text-xs text-slate-400">Fetching latest…</span> : null}
        </div>
        {searchQuery.error ? (
          <div className="card-surface border border-rose-500/50 bg-rose-500/10 text-sm text-rose-100">
            {(searchQuery.error as { message?: string }).message ?? 'Failed to fetch results.'}
          </div>
        ) : null}
        <SearchResultsGrid
          results={searchQuery.data ?? []}
          isLoading={searchQuery.isFetching && debouncedQuery.trim().length >= 2}
          onAddToCart={(result) => {
            addToCart({
              id: result.id ?? result.url,
              title: result.title,
              price: result.price,
              currency: result.price_currency ?? 'USD',
              source: 'search',
            });
            toast({ title: 'Added to cart', description: result.title, variant: 'success' });
          }}
        />
        {debouncedQuery.trim().length < 2 ? (
          <p className="text-sm text-slate-500">Type at least two characters to begin searching.</p>
        ) : null}
      </section>
    </div>
  );
}
