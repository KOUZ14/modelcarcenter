interface ErrorStateProps {
  title?: string;
  description?: string;
  retry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  retry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
      <h3 className="text-base font-semibold text-rose-100">{title}</h3>
      {description ? <p className="mt-2 text-rose-200/80">{description}</p> : null}
      {retry ? (
        <button
          type="button"
          className="mt-4 rounded-full border border-rose-400/60 px-3 py-1.5 text-xs font-medium text-rose-100 transition hover:bg-rose-500/20"
          onClick={retry}
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
