const columns = [3, 3, 3];

/** Placeholder with the same geometry as the real board, shown until saved data is loaded. */
export function BoardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading board"
      className="flex flex-1 items-start gap-column-gap overflow-hidden px-4 py-6 animate-fade-in-delayed md:px-8"
    >
      {columns.map((cards, i) => (
        <div
          key={i}
          className="flex w-[calc(100vw-2rem)] max-w-column shrink-0 flex-col rounded-column bg-column p-column-pad sm:w-column"
        >
          <div className="mb-2.5 flex min-h-9 items-center gap-2 px-1.5">
            <div className="h-4 w-24 rounded bg-ink/10 motion-safe:animate-pulse" />
            <div className="h-6 w-7 rounded-full bg-surface" />
          </div>
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: cards }, (_, j) => (
              <div key={j} className="rounded-card border border-line bg-surface p-card-pad shadow-card">
                <div className="h-4 w-3/4 rounded bg-ink/10 motion-safe:animate-pulse" />
                <div className="mt-3 h-5 w-16 rounded-md bg-ink/5" />
                <div className="mt-2.5 h-5 w-12 rounded-md bg-ink/5" />
              </div>
            ))}
          </div>
          <div className="mt-2.5 h-control rounded-card border border-dashed border-ink-muted/30" />
        </div>
      ))}
    </div>
  );
}
