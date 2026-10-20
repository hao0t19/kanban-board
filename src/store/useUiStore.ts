import { create } from "zustand";
import type { Priority } from "@/types/board";

export type PriorityFilter = Priority | "all";

interface Toast {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface UiStore {
  query: string;
  priority: PriorityFilter;
  tag: string;
  toast: Toast | null;
  setQuery: (query: string) => void;
  setPriority: (priority: PriorityFilter) => void;
  setTag: (tag: string) => void;
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: () => void;
}

/** Ephemeral UI state (filters, toast). Not persisted. */
export const useUiStore = create<UiStore>()((set) => ({
  query: "",
  priority: "all",
  tag: "all",
  toast: null,
  setQuery: (query) => set({ query }),
  setPriority: (priority) => set({ priority }),
  setTag: (tag) => set({ tag }),
  showToast: (toast) => set({ toast: { ...toast, id: Date.now() } }),
  dismissToast: () => set({ toast: null }),
}));
