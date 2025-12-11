import type { Listing } from '@/types';
import { Pencil, ShoppingCart, Trash2 } from 'lucide-react';

interface ListingCardProps {
  listing: Listing & { optimistic?: boolean };
  onEdit: (listing: Listing) => void;
  onDelete: (listing: Listing) => void;
  onAddToCart?: (listing: Listing) => void;
}

export function ListingCard({ listing, onEdit, onDelete, onAddToCart }: ListingCardProps) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/70 p-5 text-sm text-slate-200 shadow-card transition hover:shadow-elevation">
      <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-brand-500/15 blur-2xl" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-white">{listing.title}</h3>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
            <span>{listing.currency}</span>
            <span>
              {listing.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
        {listing.optimistic ? (
          <span className="rounded-full border border-amber-400/60 bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-200">
            Syncing…
          </span>
        ) : null}
      </div>
      {listing.description ? <p className="mt-3 text-xs leading-relaxed text-slate-400">{listing.description}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(listing)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-950/60 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:border-brand-400/60 hover:bg-brand-500/15"
        >
          <Pencil size={14} /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(listing)}
          className="inline-flex items-center gap-2 rounded-full border border-rose-500/60 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-100 transition hover:bg-rose-500/20"
        >
          <Trash2 size={14} /> Delete
        </button>
        {onAddToCart ? (
          <button
            type="button"
            onClick={() => onAddToCart(listing)}
            className="inline-flex items-center gap-2 rounded-full border border-brand-400/70 bg-brand-500/15 px-3 py-1.5 text-xs font-medium text-brand-50 transition hover:bg-brand-500/25"
          >
            <ShoppingCart size={14} /> Add to cart
          </button>
        ) : null}
      </div>
    </article>
  );
}
