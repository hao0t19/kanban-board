import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { parseBoard } from "@/lib/schema";
import { createSampleBoard } from "@/lib/sampleData";
import { createId } from "@/lib/utils";
import type { BoardState, Card, CardInput } from "@/types/board";

export const HISTORY_LIMIT = 50;
export const STORAGE_KEY = "kanban-board";

interface BoardActions {
  // columns
  addColumn: (title: string) => void;
  renameColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;

  // cards
  addCard: (columnId: string, data: CardInput) => void;
  updateCard: (id: string, patch: Partial<Omit<Card, "id" | "createdAt">>) => void;
  deleteCard: (id: string) => void;

  // drag & drop
  moveCard: (cardId: string, toColumnId: string, toIndex: number) => void;
  moveColumn: (fromIndex: number, toIndex: number) => void;

  // history
  undo: () => void;
  redo: () => void;

  // misc
  loadSampleData: () => void;
  reset: () => void;
}

interface History {
  past: BoardState[];
  future: BoardState[];
}

export type BoardStore = BoardState & History & BoardActions;

const emptyBoard = (): BoardState => ({ cards: {}, columns: {}, columnOrder: [] });

const pickBoard = (state: BoardState): BoardState => ({
  cards: state.cards,
  columns: state.columns,
  columnOrder: state.columnOrder,
});

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => {
      /**
       * Applies an immutable update and records the previous board in history.
       * Returning null from the updater means "nothing changed".
       */
      const commit = (updater: (board: BoardState) => BoardState | null) => {
        const state = get();
        const current = pickBoard(state);
        const next = updater(current);
        if (!next) return;
        set({
          ...next,
          past: [...state.past, current].slice(-HISTORY_LIMIT),
          future: [],
        });
      };

      return {
        ...createSampleBoard(),
        past: [],
        future: [],

        addColumn: (title) =>
          commit((board) => {
            const trimmed = title.trim();
            if (!trimmed) return null;
            const id = createId();
            return {
              ...board,
              columns: { ...board.columns, [id]: { id, title: trimmed, cardIds: [] } },
              columnOrder: [...board.columnOrder, id],
            };
          }),

        renameColumn: (id, title) =>
          commit((board) => {
            const column = board.columns[id];
            const trimmed = title.trim();
            if (!column || !trimmed || trimmed === column.title) return null;
            return { ...board, columns: { ...board.columns, [id]: { ...column, title: trimmed } } };
          }),

        deleteColumn: (id) =>
          commit((board) => {
            const column = board.columns[id];
            if (!column) return null;
            const cards = { ...board.cards };
            for (const cardId of column.cardIds) delete cards[cardId];
            const columns = { ...board.columns };
            delete columns[id];
            return { cards, columns, columnOrder: board.columnOrder.filter((c) => c !== id) };
          }),

        addCard: (columnId, data) =>
          commit((board) => {
            const column = board.columns[columnId];
            const title = data.title.trim();
            if (!column || !title) return null;
            const card: Card = { ...data, title, id: createId(), createdAt: new Date().toISOString() };
            return {
              ...board,
              cards: { ...board.cards, [card.id]: card },
              columns: { ...board.columns, [columnId]: { ...column, cardIds: [...column.cardIds, card.id] } },
            };
          }),

        updateCard: (id, patch) =>
          commit((board) => {
            const card = board.cards[id];
            if (!card) return null;
            return { ...board, cards: { ...board.cards, [id]: { ...card, ...patch } } };
          }),

        deleteCard: (id) =>
          commit((board) => {
            if (!board.cards[id]) return null;
            const cards = { ...board.cards };
            delete cards[id];
            const columns = Object.fromEntries(
              Object.entries(board.columns).map(([columnId, column]) => [
                columnId,
                column.cardIds.includes(id)
                  ? { ...column, cardIds: column.cardIds.filter((c) => c !== id) }
                  : column,
              ]),
            );
            return { ...board, cards, columns };
          }),

        moveCard: (cardId, toColumnId, toIndex) =>
          commit((board) => {
            const from = Object.values(board.columns).find((c) => c.cardIds.includes(cardId));
            const to = board.columns[toColumnId];
            if (!from || !to) return null;

            const fromIndex = from.cardIds.indexOf(cardId);
            const sourceIds = from.cardIds.filter((c) => c !== cardId);
            const targetIds = from.id === to.id ? sourceIds : [...to.cardIds];
            const index = Math.max(0, Math.min(toIndex, targetIds.length));
            if (from.id === to.id && index === fromIndex) return null;
            targetIds.splice(index, 0, cardId);

            return {
              ...board,
              columns: {
                ...board.columns,
                [from.id]: { ...from, cardIds: sourceIds },
                [to.id]: { ...to, cardIds: targetIds },
              },
            };
          }),

        moveColumn: (fromIndex, toIndex) =>
          commit((board) => {
            const order = [...board.columnOrder];
            if (fromIndex === toIndex || !order[fromIndex] || toIndex < 0 || toIndex >= order.length) {
              return null;
            }
            const [moved] = order.splice(fromIndex, 1);
            order.splice(toIndex, 0, moved);
            return { ...board, columnOrder: order };
          }),

        undo: () => {
          const { past, future } = get();
          const previous = past.at(-1);
          if (!previous) return;
          set({ ...previous, past: past.slice(0, -1), future: [pickBoard(get()), ...future] });
        },

        redo: () => {
          const { past, future } = get();
          const [next, ...rest] = future;
          if (!next) return;
          set({ ...next, past: [...past, pickBoard(get())].slice(-HISTORY_LIMIT), future: rest });
        },

        loadSampleData: () => commit(() => createSampleBoard()),
        reset: () => commit(() => emptyBoard()),
      };
    },
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only board data is persisted; history stays in memory.
      partialize: (state) => pickBoard(state),
      // Validate what comes back from localStorage; fall back to the current board if corrupt.
      merge: (persisted, current) => {
        const board = parseBoard(persisted);
        return board ? { ...current, ...board } : current;
      },
      // Hydrate on the client after mount to avoid SSR mismatches.
      skipHydration: true,
    },
  ),
);
