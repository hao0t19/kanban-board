"use client";

import { useCallback, useLayoutEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { EmptyState } from "@/components/ui/EmptyState";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { isDoneColumn } from "@/lib/utils";
import { useBoardStore } from "@/store/useBoardStore";
import { useUiStore } from "@/store/useUiStore";
import type { Card } from "@/types/board";
import { AddColumn } from "./AddColumn";
import { BoardSkeleton } from "./BoardSkeleton";
import { CardOverlay } from "./Card";
import { CardModal } from "./CardModal";
import { Column } from "./Column";

type Lists = Record<string, string[]>;

/** While dragging we preview moves locally and commit once on drop, so history gets one entry. */
interface DragState {
  activeId: string;
  lists: Lists;
}

type ModalState = { cardId: string } | { columnId: string } | null;

const findContainer = (lists: Lists, id: UniqueIdentifier) => {
  const key = String(id);
  if (key in lists) return key;
  return Object.keys(lists).find((columnId) => lists[columnId].includes(key));
};

// `persist` is only attached where localStorage exists, i.e. not during SSR.
const subscribeHydration = (onChange: () => void) =>
  useBoardStore.persist?.onFinishHydration(onChange) ?? (() => {});
const hasHydrated = () => useBoardStore.persist?.hasHydrated() ?? false;

const useHydrated = () => {
  // Layout effect: localStorage is read and the board rendered before the first client paint.
  useLayoutEffect(() => {
    void useBoardStore.persist?.rehydrate();
  }, []);
  return useSyncExternalStore(subscribeHydration, hasHydrated, () => false);
};

export function Board() {
  const hydrated = useHydrated();
  const cards = useBoardStore((s) => s.cards);
  const columns = useBoardStore((s) => s.columns);
  const columnOrder = useBoardStore((s) => s.columnOrder);
  const moveCard = useBoardStore((s) => s.moveCard);
  const undo = useBoardStore((s) => s.undo);
  const redo = useBoardStore((s) => s.redo);
  const loadSampleData = useBoardStore((s) => s.loadSampleData);

  const query = useUiStore((s) => s.query);
  const priority = useUiStore((s) => s.priority);
  const tag = useUiStore((s) => s.tag);

  const [drag, setDrag] = useState<DragState | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [addingColumn, setAddingColumn] = useState(false);

  useKeyboardShortcuts({ onUndo: undo, onRedo: redo });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // A tag filter for a tag no card has any more (e.g. after deleting or clearing) is ignored.
  const activeTag = useMemo(
    () => (tag !== "all" && Object.values(cards).some((card) => card.tags.includes(tag)) ? tag : "all"),
    [cards, tag],
  );

  const matches = useCallback(
    (card: Card) => {
      if (priority !== "all" && card.priority !== priority) return false;
      if (activeTag !== "all" && !card.tags.includes(activeTag)) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [card.title, card.description ?? "", ...card.tags].join(" ").toLowerCase().includes(q);
    },
    [query, priority, activeTag],
  );

  const visibleCards = useMemo(() => {
    const result: Record<string, Card[]> = {};
    for (const columnId of columnOrder) {
      const ids = drag?.lists[columnId] ?? columns[columnId].cardIds;
      result[columnId] = ids.map((id) => cards[id]).filter((card) => card && matches(card));
    }
    return result;
  }, [cards, columns, columnOrder, drag, matches]);

  // When the closest droppable is a column that has cards, target the closest card inside it instead,
  // so keyboard and pointer moves resolve to a position rather than the column itself.
  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      const collisions = closestCorners(args);
      const first = collisions[0];
      const lists = drag?.lists;
      if (!first || !lists) return collisions;
      const ids = lists[String(first.id)];
      if (!ids?.length) return collisions;
      const inColumn = closestCorners({
        ...args,
        droppableContainers: args.droppableContainers.filter((c) => ids.includes(String(c.id))),
      });
      return inColumn.length ? inColumn : collisions;
    },
    [drag],
  );

  const openCard = useCallback((cardId: string) => setModal({ cardId }), []);
  const addCard = useCallback((columnId: string) => setModal({ columnId }), []);

  const onDragStart = ({ active }: DragStartEvent) => {
    setDrag({
      activeId: String(active.id),
      lists: Object.fromEntries(columnOrder.map((id) => [id, columns[id].cardIds])),
    });
  };

  // Moving into another column happens during the drag so the placeholder follows the pointer.
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || !drag) return;
    const from = findContainer(drag.lists, active.id);
    const to = findContainer(drag.lists, over.id);
    if (!from || !to || from === to) return;

    const activeId = String(active.id);
    const toList = [...drag.lists[to]];
    let index = toList.indexOf(String(over.id));
    if (index === -1) {
      index = toList.length;
    } else {
      const translated = active.rect.current.translated;
      if (translated && translated.top > over.rect.top + over.rect.height / 2) index += 1;
    }
    toList.splice(index, 0, activeId);

    setDrag({
      ...drag,
      lists: { ...drag.lists, [from]: drag.lists[from].filter((id) => id !== activeId), [to]: toList },
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const current = drag;
    setDrag(null);
    if (!over || !current) return;

    const activeId = String(active.id);
    const container = findContainer(current.lists, activeId);
    if (!container) return;

    let list = current.lists[container];
    const overId = String(over.id);
    if (overId !== container && findContainer(current.lists, overId) === container) {
      list = arrayMove(list, list.indexOf(activeId), list.indexOf(overId));
    }
    moveCard(activeId, container, list.indexOf(activeId));
  };

  const titleOf = (id: UniqueIdentifier) => cards[String(id)]?.title ?? "card";
  const describeTarget = (overId: UniqueIdentifier | undefined) => {
    const lists = drag?.lists;
    const columnId = lists && overId !== undefined ? findContainer(lists, overId) : undefined;
    if (!lists || !columnId) return "outside any column";
    const columnTitle = columns[columnId]?.title;
    const index = lists[columnId].indexOf(String(overId));
    return index === -1
      ? `in column ${columnTitle}`
      : `in column ${columnTitle}, position ${index + 1} of ${lists[columnId].length}`;
  };

  const announcements: Announcements = {
    onDragStart: ({ active: a }) => `Picked up ${titleOf(a.id)}.`,
    onDragOver: ({ active: a, over }) => `${titleOf(a.id)} is ${describeTarget(over?.id)}.`,
    onDragEnd: ({ active: a, over }) => `Dropped ${titleOf(a.id)} ${describeTarget(over?.id)}.`,
    onDragCancel: ({ active: a }) => `Cancelled. ${titleOf(a.id)} returned to its original position.`,
  };

  if (!hydrated) {
    return <BoardSkeleton />;
  }

  const activeCard = drag ? cards[drag.activeId] : undefined;
  const activeColumn = drag ? findContainer(drag.lists, drag.activeId) : undefined;
  const editingCard = modal && "cardId" in modal ? cards[modal.cardId] : undefined;

  return (
    <>
      {columnOrder.length === 0 && !addingColumn ? (
        <EmptyState onLoadSample={loadSampleData} onAddColumn={() => setAddingColumn(true)} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={() => setDrag(null)}
          accessibility={{
            announcements,
            screenReaderInstructions: {
              draggable:
                "To pick up a card, press space. Use the arrow keys to move it between positions and columns. Press space again to drop, or escape to cancel.",
            },
          }}
        >
          <div className="flex flex-1 snap-x snap-mandatory items-start gap-column-gap overflow-x-auto px-4 py-6 motion-safe:animate-fade-in sm:snap-none md:px-8">
            {columnOrder.map((columnId) => (
              <Column
                key={columnId}
                id={columnId}
                title={columns[columnId].title}
                cards={visibleCards[columnId]}
                onAddCard={addCard}
                onOpenCard={openCard}
              />
            ))}
            <AddColumn open={addingColumn} onOpenChange={setAddingColumn} />
          </div>
          <DragOverlay>
            {activeCard && <CardOverlay card={activeCard} done={isDoneColumn(columns[activeColumn ?? ""]?.title ?? "")} />}
          </DragOverlay>
        </DndContext>
      )}

      {modal && (
        <CardModal
          key={"cardId" in modal ? modal.cardId : `new-${modal.columnId}`}
          card={editingCard}
          columnId={"columnId" in modal ? modal.columnId : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
