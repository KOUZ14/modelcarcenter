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

  const listings = listingsQuery.data ?? [];
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
    <div className="space-y-8">
      <section className="card-surface relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-accent-500/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-56 w-56 rounded-full bg-brand-500/15 blur-3xl" aria-hidden />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="badge-pill">Marketplace heartbeat</span>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">
              Prime your flagship inventory in minutes.
            </h2>
            <p className="max-w-xl text-sm text-slate-300">
              Upload accounts, tune listings, and sync payments in a cockpit built for fast-moving diecast sellers.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-200">
              <span className="chip border border-brand-400/40 bg-brand-500/15 text-brand-50">
                {accountCount} active account{accountCount === 1 ? '' : 's'}
              </span>
              <span className="chip border border-white/10 bg-white/5">
                {analytics.totalValue ? `${listings[0]?.currency ?? 'USD'} ${analytics.totalValue.toFixed(2)} in pipeline` : 'No pipeline yet'}
              </span>
              <span className="chip border border-accent-500/40 bg-accent-500/20 text-white">
                {cart.length} cart item{cart.length === 1 ? '' : 's'} staged
              </span>
            </div>
          </div>
          <div className="glow-ring soft-grid rounded-3xl border border-white/10 bg-slate-950/40 p-6 text-xs text-slate-200">
            <p className="uppercase tracking-[0.28em] text-slate-400">Quick glance</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-slate-400">Listings live</p>
                <p className="mt-1 text-lg font-semibold text-white">{listings.length}</p>
              </div>
              <div>
                <p className="text-slate-400">Published</p>
                <p className="mt-1 text-lg font-semibold text-white">{analytics.publishedCount}</p>
              </div>
              <div>
                <p className="text-slate-400">Avg price</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {analytics.totalValue ? `${listings[0]?.currency ?? 'USD'} ${analytics.averagePrice.toFixed(2)}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Cart ready</p>
                <p className="mt-1 text-lg font-semibold text-white">{cart.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
        <section className="card-surface">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-white">Create account</h2>
            <p className="text-xs text-slate-400">Provision demo collector or shop accounts without auth.</p>
          </div>
          <div className="mt-6">
            <AccountForm onSubmit={createAccountMutation.mutateAsync} isSubmitting={createAccountMutation.isPending} />
          </div>
        </section>

        <section className="card-surface space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Inventory dashboard</h2>
              {selectedAccount ? (
                <p className="text-xs text-slate-400">
                  Managing <span className="font-semibold text-white">{selectedAccount.name}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-400">Select an account to manage listings.</p>
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
              className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-400"
            >
              Add listing
            </button>
          </div>
          {selectedAccountId ? (
            <div className="grid gap-3 rounded-xl border border-slate-800/80 bg-slate-950 px-4 py-3 text-xs text-slate-300 md:grid-cols-3">
              <div>
                <p className="text-slate-500">Listings</p>
                <p className="text-base font-semibold text-white">{listings.length}</p>
              </div>
              <div>
                <p className="text-slate-500">Published</p>
                <p className="text-base font-semibold text-white">{analytics.publishedCount}</p>
              </div>
              <div>
                <p className="text-slate-500">Avg price</p>
                <p className="text-base font-semibold text-white">
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
            <p className="text-sm text-slate-400">No listings yet. Add your first product.</p>
          ) : null}
          <div className="grid gap-3">
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
            <div>
              <h2 className="text-base font-semibold text-white">Cart snapshot</h2>
              <p className="text-xs text-slate-400">Populated from listing and search add-to-cart actions.</p>
            </div>
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-950/60 px-4 py-3 text-sm shadow-inner"
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
                    className="rounded-full border border-rose-500/40 px-3 py-1 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {!cart.length ? <p className="text-sm text-slate-500">No items yet.</p> : null}
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
