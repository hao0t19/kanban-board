import { Button } from "./Button";

interface EmptyStateProps {
  onLoadSample: () => void;
  onAddColumn: () => void;
}

export function EmptyState({ onLoadSample, onAddColumn }: EmptyStateProps) {
  return (
    <div className="mx-4 mt-16 flex max-w-sm flex-col items-center gap-3 self-center rounded-column border border-dashed border-ink-muted/30 px-6 py-10 text-center">
      <h2 className="text-lg font-semibold">Your board is empty</h2>
      <p className="text-sm text-ink-muted">
        Add a column to get started, or load an example board to see how it works.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button variant="primary" onClick={onAddColumn}>
          Add column
        </Button>
        <Button onClick={onLoadSample}>Load example board</Button>
      </div>
    </div>
  );
}
