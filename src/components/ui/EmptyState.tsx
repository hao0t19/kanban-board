import { Button } from "./Button";

interface EmptyStateProps {
  onLoadSample: () => void;
  onAddColumn: () => void;
}

export function EmptyState({ onLoadSample, onAddColumn }: EmptyStateProps) {
  return (
    <div className="mx-auto mt-16 flex max-w-sm flex-col items-center gap-3 rounded-column border border-dashed border-ink-muted/30 px-6 py-10 text-center">
      <h2 className="text-lg font-semibold">Your board is empty</h2>
      <p className="text-sm text-ink-muted">Start with a few example cards, or create your first column.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button variant="primary" onClick={onLoadSample}>
          Load sample data
        </Button>
        <Button onClick={onAddColumn}>Add column</Button>
      </div>
    </div>
  );
}
