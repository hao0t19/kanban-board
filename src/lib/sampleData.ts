import type { BoardState, Card } from "@/types/board";

const createdAt = "2026-10-20T09:00:00.000Z";

const cards: Card[] = [
  { id: "c1", title: "Fix login redirect bug", priority: "high", dueDate: "2026-10-21", tags: ["bug", "auth"], createdAt },
  { id: "c2", title: "Write README with GIF demo", priority: "medium", dueDate: "2026-10-24", tags: ["docs"], createdAt },
  { id: "c3", title: "Add keyboard shortcuts help", priority: "low", tags: [], createdAt },
  { id: "c4", title: "Build drag and drop with dnd-kit", priority: "high", dueDate: "2026-10-22", tags: ["frontend", "a11y"], createdAt },
  { id: "c5", title: "Undo / redo history stack", priority: "medium", tags: ["state"], createdAt },
  { id: "c6", title: "Add search and filters", priority: "medium", tags: ["frontend"], createdAt },
  { id: "c7", title: "Set up Next.js + Tailwind", priority: "low", tags: ["setup"], createdAt },
  { id: "c8", title: "Deploy empty shell to Vercel", priority: "low", tags: ["deploy"], createdAt },
  { id: "c9", title: "Define normalized data types", priority: "medium", tags: ["state"], createdAt },
];

export function createSampleBoard(): BoardState {
  return {
    cards: Object.fromEntries(cards.map((card) => [card.id, { ...card, tags: [...card.tags] }])),
    columns: {
      todo: { id: "todo", title: "To Do", cardIds: ["c1", "c2", "c3"] },
      doing: { id: "doing", title: "In Progress", cardIds: ["c4", "c5", "c6"] },
      done: { id: "done", title: "Done", cardIds: ["c7", "c8", "c9"] },
    },
    columnOrder: ["todo", "doing", "done"],
  };
}
