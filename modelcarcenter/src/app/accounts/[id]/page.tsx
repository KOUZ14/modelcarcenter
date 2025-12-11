'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccountDetail } from '@/api/accounts';
import { createListing, deleteListing, updateListing, type ListingPayload } from '@/api/listings';
import { ListingEditorModal } from '@/components/ListingEditorModal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { useToast } from '@/hooks/useToast';
import type { Listing } from '@/types';

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const accountId = params?.id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  const accountQuery = useQuery({
    queryKey: ['account-detail', accountId],
    queryFn: () => getAccountDetail(accountId),
    enabled: Boolean(accountId),
  });

  const listings = useMemo(() => accountQuery.data?.listings ?? [], [accountQuery.data?.listings]);

  const analytics = useMemo(() => {
    if (!listings.length) {
      return {
        totalInventory: 0,
        totalValue: 0,
        averagePrice: 0,
        publishedCount: 0,
        highestPriced: undefined as Listing | undefined,
      };
    }
    const totalValue = listings.reduce((acc, listing) => acc + listing.price, 0);
    const publishedCount = listings.filter((listing) => listing.status === 'published').length;
    const highestPriced = listings.slice().sort((a, b) => b.price - a.price)[0];
    return {
      totalInventory: listings.length,
      totalValue,
      averagePrice: totalValue / listings.length,
      publishedCount,
      highestPriced,
    };
  }, [listings]);

  const createListingMutation = useMutation({
    mutationFn: (values: ListingPayload) => createListing(accountId, values),
    onSuccess: () => {
      toast({ title: 'Listing created', variant: 'success' });
      setEditorOpen(false);
      setEditingListing(null);
      queryClient.invalidateQueries({ queryKey: ['account-detail', accountId] });
    },
    onError: (error: { message?: string }) => {
      toast({ title: 'Could not create listing', description: error.message ?? 'Unknown error', variant: 'error' });
    },
  });

  const updateListingMutation = useMutation({
    mutationFn: ({ listingId, updates }: { listingId: string; updates: Partial<ListingPayload> }) =>
      updateListing(accountId, listingId, updates),
    onSuccess: () => {
      toast({ title: 'Listing updated', variant: 'success' });
      setEditorOpen(false);
      setEditingListing(null);
      queryClient.invalidateQueries({ queryKey: ['account-detail', accountId] });
    },
    onError: (error: { message?: string }) => {
      toast({ title: 'Update failed', description: error.message ?? 'Unknown error', variant: 'error' });
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: (listingId: string) => deleteListing(accountId, listingId),
    onSuccess: () => {
      toast({ title: 'Listing deleted', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['account-detail', accountId] });
    },
    onError: (error: { message?: string }) => {
      toast({ title: 'Delete failed', description: error.message ?? 'Unknown error', variant: 'error' });
    },
  });

  const handleSave = (values: ListingPayload) => {
    if (!editingListing) {
      createListingMutation.mutate(values);
    } else {
      updateListingMutation.mutate({ listingId: editingListing.id, updates: values });
    }
  };

  if (accountQuery.isLoading) {
    return <LoadingSpinner label="Loading account" />;
  }

  if (accountQuery.error) {
    return (
      <ErrorState
        description={(accountQuery.error as { message?: string }).message ?? 'Failed to load account'}
        retry={() => accountId && queryClient.invalidateQueries({ queryKey: ['account-detail', accountId] })}
      />
    );
  }

  if (!accountQuery.data) {
    return (
      <div className="card-surface space-y-3 text-sm text-slate-300">
        <p>Account not found.</p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="rounded-full border border-slate-700/70 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500/80"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const account = accountQuery.data;

  return (
    <div className="space-y-8">
      <header className="card-surface space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Account</p>
            <h1 className="text-2xl font-semibold text-white">{account.name}</h1>
            <p className="text-sm text-slate-400">{account.email} • {account.type}</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="rounded-full border border-slate-700/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500/80"
          >
            Back to dashboard
          </button>
        </div>
        <div className="grid gap-4 rounded-2xl border border-slate-800/80 bg-slate-950 p-4 text-sm text-slate-300 md:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Total listings</p>
            <p className="text-lg font-semibold text-white">{analytics.totalInventory}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Published</p>
            <p className="text-lg font-semibold text-white">{analytics.publishedCount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Average price</p>
            <p className="text-lg font-semibold text-white">
              {analytics.totalInventory ? `${account.listings[0]?.currency ?? 'USD'} ${analytics.averagePrice.toFixed(2)}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Top listing</p>
            <p className="text-lg font-semibold text-white">
              {analytics.highestPriced
                ? `${analytics.highestPriced.title} (${analytics.highestPriced.currency} ${analytics.highestPriced.price.toFixed(2)})`
                : '—'}
            </p>
          </div>
        </div>
      </header>

      <section className="card-surface space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Listings</h2>
          <button
            type="button"
            onClick={() => {
              setEditingListing(null);
              setEditorOpen(true);
            }}
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-400"
          >
            Add listing
          </button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-800/70">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {listings.map((listing) => (
                <tr key={listing.id} className="bg-slate-950/80 text-slate-200">
                  <td className="px-4 py-3 font-medium text-white">{listing.title}</td>
                  <td className="px-4 py-3">
                    {listing.currency} {listing.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 capitalize">{listing.status ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{listing.updated_at ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingListing(listing);
                          setEditorOpen(true);
                        }}
                        className="rounded-full border border-slate-700/70 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-slate-500/80"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteListingMutation.mutate(listing.id)}
                        className="rounded-full border border-rose-500/60 px-3 py-1 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!listings.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">
                    No listings yet. Add one to populate analytics.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <ListingEditorModal
        open={editorOpen}
        initialListing={editingListing}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        isSaving={createListingMutation.isPending || updateListingMutation.isPending}
      />
    </div>
  );
}
