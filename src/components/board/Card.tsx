"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PriorityChip, TagChip } from "@/components/ui/Chip";
import { cn, formatDue } from "@/lib/utils";
import type { Card as CardData } from "@/types/board";

interface CardContentProps {
  card: CardData;
  done: boolean;
}

function CardContent({ card, done }: CardContentProps) {
  return (
    <>
      <h3 className={cn("text-[15px] font-medium leading-snug", done && "text-ink-muted line-through")}>
        {card.title}
      </h3>
      <div className="mt-2 flex items-center gap-2">
        <PriorityChip priority={card.priority} />
        {card.dueDate && !done && <span className="text-[13px] text-ink-muted">Due {formatDue(card.dueDate)}</span>}
      </div>
      {card.tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Tags">
          {card.tags.map((tag) => (
            <li key={tag}>
              <TagChip tag={tag} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const cardClass = "relative rounded-card border border-line bg-surface p-card-pad shadow-card";

/**
 * Rendered inside the DragOverlay while a card is being dragged. The tilt lives on the inner
 * element so dnd-kit measures the unrotated box (a rotated box breaks keyboard navigation).
 */
export function CardOverlay({ card, done }: CardContentProps) {
  return (
    <div className="cursor-grabbing">
      <div className={cn(cardClass, "rotate-drag border-accent shadow-drag")}>
        <CardContent card={card} done={done} />
      </div>
    </div>
  );
}

interface SortableCardProps extends CardContentProps {
  onOpen: (cardId: string) => void;
}

export const SortableCard = memo(function SortableCard({ card, done, onOpen }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={`${card.title}. Press space to move.`}
      className={cn(
        cardClass,
        "cursor-grab touch-manipulation",
        isDragging && "border-2 border-dashed border-accent bg-accent-soft shadow-none",
      )}
    >
      <div className={cn(isDragging && "invisible")}>
        <CardContent card={card} done={done} />
      </div>
      {/* Stretched button so the whole card opens the editor; keydown stays off the drag handle. */}
      <button
        type="button"
        aria-label={`Edit ${card.title}`}
        onClick={() => onOpen(card.id)}
        onKeyDown={(event) => event.stopPropagation()}
        className="absolute inset-0 cursor-[inherit] rounded-card"
      />
    </li>
  );
});
