import { z } from "zod";
import type { BoardState } from "@/types/board";

export const prioritySchema = z.enum(["low", "medium", "high"]);

export const cardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: prioritySchema,
  dueDate: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.string(),
});

export const columnSchema = z.object({
  id: z.string(),
  title: z.string(),
  cardIds: z.array(z.string()),
});

export const boardStateSchema = z
  .object({
    cards: z.record(z.string(), cardSchema),
    columns: z.record(z.string(), columnSchema),
    columnOrder: z.array(z.string()),
  })
  .refine(
    (board) =>
      board.columnOrder.every((id) => id in board.columns) &&
      Object.values(board.columns).every((column) =>
        column.cardIds.every((id) => id in board.cards),
      ),
    { message: "Board references missing columns or cards" },
  );

/** Returns a valid board, or null when the stored data is corrupt. */
export function parseBoard(data: unknown): BoardState | null {
  const result = boardStateSchema.safeParse(data);
  return result.success ? result.data : null;
}
