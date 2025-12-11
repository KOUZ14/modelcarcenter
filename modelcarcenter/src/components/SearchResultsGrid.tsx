import Image from 'next/image';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import type { SearchResult } from '@/types';

interface SearchResultsGridProps {
  results: SearchResult[];
  isLoading?: boolean;
  onAddToCart?: (result: SearchResult) => void;
}

export function SearchResultsGrid({ results, isLoading = false, onAddToCart }: SearchResultsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-4 shadow-card">
            <div className="h-40 w-full animate-pulse rounded-2xl bg-slate-800/40" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded-lg bg-slate-800/50" />
              <div className="h-3 w-1/2 animate-pulse rounded-lg bg-slate-800/50" />
              <div className="h-9 w-full animate-pulse rounded-full bg-slate-800/50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!results.length) {
    return <p className="text-sm text-slate-400">No results yet. Try searching for a model or brand.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((result, index) => (
        <article
          key={result.id ?? `${result.title}-${index}`}
          className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/65 p-4 shadow-card transition hover:shadow-elevation"
        >
          <div className="pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
          <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950">
            {result.image_url ? (
              <Image
                src={result.image_url}
                alt={result.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-600">No image</div>
            )}
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-white">{result.title}</h3>
              <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-100">
                <span>{result.price_currency ?? 'USD'}</span>
                <span>
                  {result.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-brand-400/50 hover:bg-brand-500/10 hover:text-white"
              >
                <ExternalLink size={14} /> View listing
              </a>
              {onAddToCart ? (
                <button
                  type="button"
                  onClick={() => onAddToCart(result)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-400/70 bg-brand-500/15 px-3 py-1.5 text-xs font-medium text-brand-50 transition hover:bg-brand-500/25"
                >
                  <ShoppingCart size={14} />
                </button>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
