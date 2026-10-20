import type { BoardState, Card } from "@/types/board";

/** Local YYYY-MM-DD for today + n days, so sample due dates never go stale. */
function inDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function sampleCards(): Card[] {
  const createdAt = new Date().toISOString();
  return [
    {
      id: "c1",
      title: "Drag me to In Progress",
      description:
        "Grab a card and drop it in another column, or reorder it within a column. With a keyboard: Tab to a card, press Space, move with the arrow keys, then press Space again.",
      priority: "medium",
      tags: ["tip"],
      createdAt,
    },
    { id: "c2", title: "Pay electricity bill", priority: "high", dueDate: inDays(2), tags: ["home"], createdAt },
    { id: "c3", title: "Plan weekend trip", priority: "low", dueDate: inDays(5), tags: ["personal"], createdAt },
    { id: "c4", title: "Prepare weekly report", priority: "high", dueDate: inDays(1), tags: ["work"], createdAt },
    {
      id: "c5",
      title: "Click a card to edit it",
      description: "Change the title, description, priority, due date and tags. You can delete the card from here too.",
      priority: "medium",
      tags: ["tip"],
      createdAt,
    },
    {
      id: "c6",
      title: "Search, filter and undo",
      description:
        "Use the search box or the Priority and Tag filters at the top. Made a mistake? Press Ctrl+Z to undo and Ctrl+Shift+Z to redo.",
      priority: "low",
      tags: ["tip"],
      createdAt,
    },
    { id: "c7", title: "Buy groceries", priority: "medium", tags: ["home"], createdAt },
    { id: "c8", title: "Book dentist appointment", priority: "low", tags: ["personal"], createdAt },
    { id: "c9", title: "Reply to team emails", priority: "medium", tags: ["work"], createdAt },
  ];
}

export function createSampleBoard(): BoardState {
  return {
    cards: Object.fromEntries(sampleCards().map((card) => [card.id, card])),
    columns: {
      todo: { id: "todo", title: "To Do", cardIds: ["c1", "c2", "c3"] },
      doing: { id: "doing", title: "In Progress", cardIds: ["c4", "c5", "c6"] },
      done: { id: "done", title: "Done", cardIds: ["c7", "c8", "c9"] },
    },
    columnOrder: ["todo", "doing", "done"],
  };
}
