"use client";

import { memo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button, IconButton } from "@/components/ui/Button";
import { TrashIcon } from "@/components/ui/Icons";
import { cn, isDoneColumn } from "@/lib/utils";
import { useBoardStore } from "@/store/useBoardStore";
import { useUiStore } from "@/store/useUiStore";
import type { Card } from "@/types/board";
import { SortableCard } from "./Card";

interface ColumnProps {
  id: string;
  title: string;
  cards: Card[];
  onAddCard: (columnId: string) => void;
  onOpenCard: (cardId: string) => void;
}

export const Column = memo(function Column({ id, title, cards, onAddCard, onOpenCard }: ColumnProps) {
  const [editing, setEditing] = useState(false);
  const renameColumn = useBoardStore((s) => s.renameColumn);
  const deleteColumn = useBoardStore((s) => s.deleteColumn);
  const undo = useBoardStore((s) => s.undo);
  const showToast = useUiStore((s) => s.showToast);
  const { setNodeRef, isOver } = useDroppable({ id });

  const done = isDoneColumn(title);
  const headingId = `column-${id}`;

  const onDelete = () => {
    deleteColumn(id);
    showToast({ message: "Column deleted", onAction: undo });
  };

  return (
    <section
      aria-labelledby={headingId}
      className="flex max-h-full w-[calc(100vw-2rem)] max-w-column shrink-0 snap-center flex-col rounded-column bg-column p-column-pad sm:w-column"
    >
      <header className="group mb-2.5 flex min-h-9 items-center gap-2 px-1.5">
        {editing ? (
          <form
            className="flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              const value = new FormData(event.currentTarget).get("title");
              renameColumn(id, typeof value === "string" ? value : title);
              setEditing(false);
            }}
          >
            <label className="sr-only" htmlFor={`${headingId}-input`}>
              Column name
            </label>
            <input
              id={`${headingId}-input`}
              name="title"
              defaultValue={title}
              autoFocus
              onBlur={(event) => event.currentTarget.form?.requestSubmit()}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.currentTarget.value = title;
                  setEditing(false);
                }
              }}
              className="h-9 w-full rounded-md border border-accent bg-surface px-2 text-[15px] font-semibold"
            />
          </form>
        ) : (
          <>
            <h2 id={headingId} className="min-w-0">
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label={`Rename column ${title}`}
                className="truncate rounded-md text-[15px] font-semibold hover:text-accent"
              >
                {title}
              </button>
            </h2>
            <span className="rounded-full bg-surface px-2 text-[13px] font-medium leading-6 text-ink-muted">
              {cards.length}
            </span>
            <IconButton
              aria-label={`Delete column ${title}`}
              variant="ghost"
              onClick={onDelete}
              className="ml-auto h-8 w-8 md:opacity-0 md:focus-visible:opacity-100 md:group-hover:opacity-100"
            >
              <TrashIcon width={16} height={16} />
            </IconButton>
          </>
        )}
      </header>

      <SortableContext id={id} items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <ul
          ref={setNodeRef}
          aria-label={`${title} cards`}
          className={cn(
            "-mx-1 flex min-h-2 flex-col gap-2.5 overflow-y-auto px-1 py-0.5",
            isOver && cards.length === 0 && "rounded-card bg-accent-soft",
          )}
        >
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} done={done} onOpen={onOpenCard} />
          ))}
        </ul>
      </SortableContext>

      <Button variant="dashed" onClick={() => onAddCard(id)} className="mt-2.5 w-full rounded-card">
        + Add card
      </Button>
    </section>
  );
});
