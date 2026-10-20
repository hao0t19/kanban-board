export type Priority = "low" | "medium" | "high";

export interface Card {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // ISO date, YYYY-MM-DD
  tags: string[];
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[]; // determines card order
}

export interface BoardState {
  cards: Record<string, Card>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

export type CardInput = Omit<Card, "id" | "createdAt">;
