import Image from 'next/image';
import type { Listing } from '@/types';
import { Pencil, ShoppingCart, Trash2 } from 'lucide-react';

interface ListingCardProps {
  listing: Listing & { optimistic?: boolean };
  onEdit: (listing: Listing) => void;
  onDelete: (listing: Listing) => void;
  onAddToCart?: (listing: Listing) => void;
}

export function ListingCard({ listing, onEdit, onDelete, onAddToCart }: ListingCardProps) {
  const statusTone = listing.status === 'published' ? 'bg-emerald-500/15 text-emerald-100 border-emerald-400/50' : 'bg-white/10 text-white border-white/20';

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/65 p-5 text-sm text-slate-200 shadow-card transition hover:-translate-y-[1px] hover:shadow-elevation">
      <div className="pointer-events-none absolute -right-10 -top-16 h-32 w-32 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
      <div className="flex gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt={`${listing.title} preview`}
              fill
              sizes="96px"
              className="object-cover"
              priority={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white">
              {listing.title.slice(0, 1).toUpperCase()}
            </div>
          )}
          <span className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${statusTone}`}>
            {listing.status ?? 'Fresh'}
          </span>
          {listing.optimistic ? (
            <span className="absolute bottom-2 right-2 rounded-full border border-amber-400/60 bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-200">
              Syncing…
            </span>
          ) : null}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">{listing.title}</h3>
              {listing.description ? <p className="text-xs leading-relaxed text-slate-300">{listing.description}</p> : null}
              {listing.quantity ? (
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-100">
                  {listing.quantity} in stock
                </span>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Price</p>
              <p className="text-xl font-semibold text-white">
                {listing.currency}{' '}
                {listing.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onEdit(listing)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:-translate-y-[1px] hover:border-white/40 hover:bg-white/10"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(listing)}
              className="inline-flex items-center gap-2 rounded-full border border-rose-400/50 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-100 transition hover:-translate-y-[1px] hover:bg-rose-500/20"
            >
              <Trash2 size={14} /> Delete
            </button>
            {onAddToCart ? (
              <button
                type="button"
                onClick={() => onAddToCart(listing)}
                className="inline-flex items-center gap-2 rounded-full border border-brand-400/60 bg-brand-500/15 px-3 py-1.5 text-xs font-medium text-brand-50 transition hover:-translate-y-[1px] hover:bg-brand-500/25"
              >
                <ShoppingCart size={14} /> Add to bag
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
