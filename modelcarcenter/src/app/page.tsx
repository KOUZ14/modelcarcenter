'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AccountForm } from '@/components/AccountForm';
import { AccountList } from '@/components/AccountList';
import { ListingCard } from '@/components/ListingCard';
import { ListingEditorModal } from '@/components/ListingEditorModal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { useToast } from '@/hooks/useToast';
import { createAccount, listAccounts } from '@/api/accounts';
import { createListing, deleteListing, listListings, updateListing, type ListingPayload } from '@/api/listings';
import { listingToCartItem, useAccountStore } from '@/store/account-store';
import type { Listing } from '@/types';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const { selectedAccountId, setSelectedAccountId, cart, addToCart, removeFromCart } = useAccountStore((state) => ({
    selectedAccountId: state.selectedAccountId,
    setSelectedAccountId: state.setSelectedAccountId,
    cart: state.cart,
    addToCart: state.addToCart,
    removeFromCart: state.removeFromCart,
  }));

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: listAccounts,
  });

  const listingsQuery = useQuery({
    queryKey: ['accounts', selectedAccountId, 'listings'],
    queryFn: () => listListings(selectedAccountId as string),
    enabled: Boolean(selectedAccountId),
  });

  const createAccountMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: (account) => {
      toast({ title: 'Account created', description: account.name, variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setSelectedAccountId(account.id);
    },
    onError: (error: { message?: string }) => {
      toast({ title: 'Could not create account', description: error.message ?? 'Unknown error', variant: 'error' });
    },
  });

  const createListingMutation = useMutation({
    mutationFn: (payload: ListingPayload) => createListing(selectedAccountId as string, payload),
    onMutate: async (payload) => {
      if (!selectedAccountId) return undefined;
      await queryClient.cancelQueries({ queryKey: ['accounts', selectedAccountId, 'listings'] });
      const previousListings = queryClient.getQueryData<Listing[]>(['accounts', selectedAccountId, 'listings']) ?? [];
      const optimisticListing: Listing & { optimistic: boolean } = {
        id: `temp-${Date.now()}`,
        optimistic: true,
        ...payload,
      };
      queryClient.setQueryData(['accounts', selectedAccountId, 'listings'], [...previousListings, optimisticListing]);
      setEditorOpen(false);
      setEditingListing(null);
      return { previousListings };
    },
    onError: (error: { message?: string }, _payload, context) => {
      if (selectedAccountId && context?.previousListings) {
        queryClient.setQueryData(['accounts', selectedAccountId, 'listings'], context.previousListings);
      }
      toast({ title: 'Listing creation failed', description: error.message ?? 'Unknown error', variant: 'error' });
    },
    onSuccess: (listing) => {
      if (!selectedAccountId) return;
      queryClient.setQueryData<Listing[]>(['accounts', selectedAccountId, 'listings'], (current = []) =>
        current.map((item) => (item.id.startsWith('temp-') ? listing : item))
      );
      toast({ title: 'Listing created', variant: 'success' });
    },
    onSettled: () => {
      if (!selectedAccountId) return;
      queryClient.invalidateQueries({ queryKey: ['accounts', selectedAccountId, 'listings'] });
    },
  });

  const updateListingMutation = useMutation({
    mutationFn: ({ listingId, updates }: { listingId: string; updates: Partial<ListingPayload> }) =>
      updateListing(selectedAccountId as string, listingId, updates),
    onMutate: async ({ listingId, updates }) => {
      if (!selectedAccountId) return undefined;
      await queryClient.cancelQueries({ queryKey: ['accounts', selectedAccountId, 'listings'] });
      const previousListings = queryClient.getQueryData<Listing[]>(['accounts', selectedAccountId, 'listings']) ?? [];
      queryClient.setQueryData<Listing[]>(['accounts', selectedAccountId, 'listings'], (current = []) =>
        current.map((item) => (item.id === listingId ? { ...item, ...updates, optimistic: true } : item))
      );
      setEditorOpen(false);
      setEditingListing(null);
      return { previousListings };
    },
    onError: (error: { message?: string }, _payload, context) => {
      if (selectedAccountId && context?.previousListings) {
        queryClient.setQueryData(['accounts', selectedAccountId, 'listings'], context.previousListings);
      }
      toast({ title: 'Listing update failed', description: error.message ?? 'Unknown error', variant: 'error' });
    },
    onSuccess: () => {
      toast({ title: 'Listing updated', variant: 'success' });
    },
    onSettled: () => {
      if (!selectedAccountId) return;
      queryClient.invalidateQueries({ queryKey: ['accounts', selectedAccountId, 'listings'] });
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: (listing: Listing) => deleteListing(selectedAccountId as string, listing.id),
    onMutate: async (listing) => {
      if (!selectedAccountId) return undefined;
      await queryClient.cancelQueries({ queryKey: ['accounts', selectedAccountId, 'listings'] });
      const previousListings = queryClient.getQueryData<Listing[]>(['accounts', selectedAccountId, 'listings']) ?? [];
      queryClient.setQueryData<Listing[]>(['accounts', selectedAccountId, 'listings'], (current = []) =>
        current.filter((item) => item.id !== listing.id)
      );
      return { previousListings };
    },
    onError: (error: { message?: string }, listing, context) => {
      if (selectedAccountId && context?.previousListings) {
        queryClient.setQueryData(['accounts', selectedAccountId, 'listings'], context.previousListings);
      }
      toast({ title: 'Delete failed', description: error.message ?? listing.title, variant: 'error' });
    },
    onSuccess: () => {
      toast({ title: 'Listing deleted', variant: 'success' });
    },
    onSettled: () => {
      if (!selectedAccountId) return;
      queryClient.invalidateQueries({ queryKey: ['accounts', selectedAccountId, 'listings'] });
    },
  });

  const listings = useMemo(() => listingsQuery.data ?? [], [listingsQuery.data]);
  const analytics = useMemo(() => {
    if (!listings.length) {
      return { totalValue: 0, averagePrice: 0, publishedCount: 0 };
    }
    const totalValue = listings.reduce((sum, listing) => sum + listing.price, 0);
    const publishedCount = listings.filter((listing) => listing.status === 'published').length;
    return {
      totalValue,
      averagePrice: totalValue / listings.length,
      publishedCount,
    };
  }, [listings]);

  const handleListingSave = (values: ListingPayload) => {
    if (!selectedAccountId) {
      toast({ title: 'Select an account first', variant: 'warning' });
      return;
    }
    if (editingListing) {
      updateListingMutation.mutate({ listingId: editingListing.id, updates: values });
    } else {
      createListingMutation.mutate(values);
    }
  };

  const selectedAccount = accountsQuery.data?.find((account) => account.id === selectedAccountId);

  const accountCount = accountsQuery.data?.length ?? 0;

  return (
    <div className="space-y-10">
      <section className="hero-surface relative overflow-hidden rounded-4xl border border-white/10 p-8 shadow-elevation sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(96,165,250,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(244,113,181,0.16),transparent_30%)]" aria-hidden />
        <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-brand-500/20 blur-[120px]" aria-hidden />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-accent-500/20 blur-[130px]" aria-hidden />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr,1fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-card">
              Modelcar atelier
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-[2.4rem]">
                A clean, elevated shop for limited-run diecast collectibles.
              </h1>
              <p className="max-w-2xl text-sm text-slate-200 sm:text-base">
                Browse curated boutiques, preview carts, and launch new drops without leaving the page. Everything stays light, modern, and ready for shoppers.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!selectedAccountId) {
                    toast({ title: 'Select an account first', variant: 'warning' });
                    return;
                  }
                  setEditingListing(null);
                  setEditorOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-[1px] hover:shadow-elevation"
              >
                List a collectible
              </button>
              <a
                href="#boutiques"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/15"
              >
                Browse boutiques
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Listings live</p>
                <p className="mt-2 text-2xl font-semibold text-white">{listings.length}</p>
                <p className="text-xs text-slate-400">From {accountCount} boutique{accountCount === 1 ? '' : 's'}.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Average price</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {analytics.totalValue ? `${listings[0]?.currency ?? 'USD'} ${analytics.averagePrice.toFixed(2)}` : '—'}
                </p>
                <p className="text-xs text-slate-400">Balanced between premium and playful.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Bag preview</p>
                <p className="mt-2 text-2xl font-semibold text-white">{cart.length}</p>
                <p className="text-xs text-slate-400">Quickly stage items before checkout.</p>
              </div>
            </div>
          </div>

          <div className="card-surface relative overflow-hidden border-white/10 bg-white/5 p-6 shadow-card">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_45%)]" aria-hidden />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span className="rounded-full bg-white/10 px-3 py-1 font-semibold uppercase tracking-[0.18em] text-white">New drop</span>
                <span className="text-slate-300">{new Date().toLocaleDateString()}</span>
              </div>
              <p className="text-lg font-semibold text-white">Weekend Launchpad</p>
              <p className="text-sm leading-relaxed text-slate-200">
                Rotate in a new boutique, refresh listing photography, and nudge shoppers with limited quantities. Your storefront stays beautifully minimal while the data stays live.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <p className="text-xs text-slate-300">Published pieces</p>
                  <p className="text-xl font-semibold text-white">{analytics.publishedCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <p className="text-xs text-slate-300">Pipeline value</p>
                  <p className="text-xl font-semibold text-white">
                    {analytics.totalValue ? `${listings[0]?.currency ?? 'USD'} ${analytics.totalValue.toFixed(2)}` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[2fr,1.05fr]">
        <div className="space-y-6">
          <section className="card-surface space-y-5" id="collection">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Curated collection</h2>
                {selectedAccount ? (
                  <p className="text-xs text-slate-300">
                    Browsing <span className="font-semibold text-white">{selectedAccount.name}</span> — smooth enough for shoppers, powerful enough for editors.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Choose a boutique on the right to shop their latest pieces.</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!selectedAccountId) {
                    toast({ title: 'Select an account first', variant: 'warning' });
                    return;
                  }
                  setEditingListing(null);
                  setEditorOpen(true);
                }}
                className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-white/50 hover:bg-white/10"
              >
                Add listing
              </button>
            </div>

            {selectedAccountId ? (
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-xs text-slate-200 md:grid-cols-3">
                <div>
                  <p className="text-slate-400">Listings</p>
                  <p className="text-lg font-semibold text-white">{listings.length}</p>
                </div>
                <div>
                  <p className="text-slate-400">Published</p>
                  <p className="text-lg font-semibold text-white">{analytics.publishedCount}</p>
                </div>
                <div>
                  <p className="text-slate-400">Avg price</p>
                  <p className="text-lg font-semibold text-white">
                    {selectedAccount?.stats?.listing_count === 0 && !listings.length
                      ? '—'
                      : `${listings[0]?.currency ?? 'USD'} ${analytics.averagePrice.toFixed(2)}`}
                  </p>
                </div>
              </div>
            ) : null}

            {listingsQuery.isLoading ? <LoadingSpinner label="Loading listings" /> : null}
            {listingsQuery.error ? (
              <ErrorState
                description={(listingsQuery.error as { message?: string })?.message ?? 'Failed to load listings.'}
                retry={() => queryClient.invalidateQueries({ queryKey: ['accounts', selectedAccountId, 'listings'] })}
              />
            ) : null}
            {!listingsQuery.isLoading && !listings.length ? (
              <p className="text-sm text-slate-400">No listings yet. Add your first model car to make the shelf feel alive.</p>
            ) : null}
            <div className="grid gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onEdit={(item) => {
                    setEditingListing(item);
                    setEditorOpen(true);
                  }}
                  onDelete={(item) => deleteListingMutation.mutate(item)}
                  onAddToCart={(item) => addToCart(listingToCartItem(item))}
                />
              ))}
            </div>
          </section>

          <section className="card-surface space-y-4" id="boutiques">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Open a boutique</h2>
                <p className="text-xs text-slate-400">Spin up a demo shop, then curate listings with the same clean experience shoppers see.</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                {accountCount} ready
              </span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-200">
              <p className="font-semibold text-white">Guidance</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-slate-300">
                <li>Create a collector or shop account without authentication.</li>
                <li>Switch between boutiques instantly to keep the browsing flow.</li>
                <li>Use listings below to stage items into the bag.</li>
              </ul>
            </div>
            <AccountForm onSubmit={createAccountMutation.mutateAsync} isSubmitting={createAccountMutation.isPending} />
          </section>
        </div>

        <aside className="space-y-6">
          <AccountList
            accounts={accountsQuery.data ?? []}
            selectedAccountId={selectedAccountId}
            onSelect={(account) => setSelectedAccountId(account.id)}
            onClear={() => setSelectedAccountId(undefined)}
            isLoading={accountsQuery.isLoading}
          />

          <section className="card-surface space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">Shopping bag</h2>
                <p className="text-xs text-slate-400">Curate a short list before checkout. Items sync straight from listings.</p>
              </div>
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                {cart.length} item{cart.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm shadow-inner"
                >
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-xs text-slate-400">
                      {item.currency} {item.price}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="rounded-full border border-white/30 px-3 py-1 text-xs font-medium text-white transition hover:-translate-y-[1px] hover:bg-white/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {!cart.length ? <p className="text-sm text-slate-500">No items yet. Add a favorite to start the bag.</p> : null}
            </div>
          </section>
        </aside>

        <ListingEditorModal
          open={editorOpen}
          initialListing={editingListing}
          onClose={() => setEditorOpen(false)}
          onSave={handleListingSave}
          isSaving={createListingMutation.isPending || updateListingMutation.isPending}
        />
      </div>
    </div>
  );
}
