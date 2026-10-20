"use client";

import { Button } from "@/components/ui/Button";
import { useBoardStore } from "@/store/useBoardStore";

interface AddColumnProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddColumn({ open, onOpenChange }: AddColumnProps) {
  const addColumn = useBoardStore((s) => s.addColumn);

  if (!open) {
    return (
      <Button variant="dashed" onClick={() => onOpenChange(true)} className="w-[calc(100vw-2rem)] max-w-column shrink-0 snap-center rounded-column sm:w-[236px]">
        + Add column
      </Button>
    );
  }

  return (
    <form
      className="flex w-[calc(100vw-2rem)] max-w-column shrink-0 snap-center flex-col gap-2 rounded-column bg-column p-column-pad sm:w-column"
      onSubmit={(event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get("title");
        if (typeof value === "string" && value.trim()) addColumn(value);
        onOpenChange(false);
      }}
    >
      <label htmlFor="new-column-title" className="px-1 text-[13px] font-medium text-ink-muted">
        Column name
      </label>
      <input
        id="new-column-title"
        name="title"
        autoFocus
        placeholder="e.g. Review"
        onKeyDown={(event) => {
          if (event.key === "Escape") onOpenChange(false);
        }}
        className="h-control rounded-control border border-line bg-surface px-3 text-[15px]"
      />
      <div className="flex gap-2">
        <Button type="submit" variant="primary" className="flex-1">
          Add column
        </Button>
        <Button onClick={() => onOpenChange(false)}>Cancel</Button>
      </div>
    </form>
  );
}
