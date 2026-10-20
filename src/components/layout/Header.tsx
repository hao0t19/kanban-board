"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button, IconButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { priorityLabel } from "@/components/ui/Chip";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";
import logoMark from "../../../logo/logo-mark.svg";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/store/useBoardStore";
import { useUiStore, type PriorityFilter } from "@/store/useUiStore";
import type { Priority } from "@/types/board";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";

const priorities: Priority[] = ["high", "medium", "low"];

const selectClass =
  "h-control appearance-none rounded-control border border-line bg-surface px-4 text-[15px] font-medium text-ink hover:bg-page";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const cards = useBoardStore((s) => s.cards);
  const canUndo = useBoardStore((s) => s.past.length > 0);
  const canRedo = useBoardStore((s) => s.future.length > 0);
  const undo = useBoardStore((s) => s.undo);
  const redo = useBoardStore((s) => s.redo);
  const reset = useBoardStore((s) => s.reset);
  const isEmpty = useBoardStore((s) => s.columnOrder.length === 0);

  const priority = useUiStore((s) => s.priority);
  const tag = useUiStore((s) => s.tag);
  const setPriority = useUiStore((s) => s.setPriority);
  const setTag = useUiStore((s) => s.setTag);
  const showToast = useUiStore((s) => s.showToast);

  const tags = useMemo(
    () => [...new Set(Object.values(cards).flatMap((card) => card.tags))].sort(),
    [cards],
  );

  const onClear = () => {
    reset();
    showToast({ message: "Board cleared", onAction: undo });
  };

  return (
    <header className="sticky left-0 top-0 z-20 border-b border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-8 md:py-4">
        <div className="mr-1 flex items-center gap-2.5">
          <Image src={logoMark} alt="" width={28} height={28} priority className="rounded-md dark:ring-1 dark:ring-line" />
          <h1 className="text-xl font-semibold tracking-tight">Kanban</h1>
        </div>

        <SearchBar className="order-last w-full md:order-none md:w-[282px]" />

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <IconButton
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="header-controls"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <ThemeToggle />
        </div>

        <div
          id="header-controls"
          className={cn(
            "order-last w-full flex-wrap items-center gap-3 md:order-none md:flex md:w-auto md:flex-1",
            menuOpen ? "flex" : "hidden",
          )}
        >
          <label>
            <span className="sr-only">Filter by priority</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as PriorityFilter)}
              className={selectClass}
            >
              <option value="all">Priority: All</option>
              {priorities.map((p) => (
                <option key={p} value={p}>
                  Priority: {priorityLabel[p]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by tag</span>
            <select value={tags.includes(tag) ? tag : "all"} onChange={(event) => setTag(event.target.value)} className={selectClass}>
              <option value="all">Tag: All</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  Tag: {t}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3 md:ml-auto">
            <Button onClick={undo} disabled={!canUndo} aria-keyshortcuts="Control+Z">
              Undo
            </Button>
            <Button onClick={redo} disabled={!canRedo} aria-keyshortcuts="Control+Shift+Z">
              Redo
            </Button>
            <Button onClick={() => setConfirmingClear(true)} disabled={isEmpty}>
              Clear board
            </Button>
          </div>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
      {confirmingClear && (
        <ConfirmDialog
          title="Clear board?"
          message="This removes all columns and cards. You can undo right after, but not after reloading the page."
          confirmLabel="Clear board"
          onConfirm={onClear}
          onClose={() => setConfirmingClear(false)}
        />
      )}
    </header>
  );
}
