# Kanban Board

A local-first Kanban board with drag and drop, undo/redo, search and filters, and dark mode. Built with Next.js, TypeScript, Tailwind CSS, Zustand, and dnd-kit.

**Live demo:** _coming soon_

## Features

- Columns: add, rename (click the title), delete
- Cards: add, edit, delete, with priority, due date, tags and description
- Drag and drop to reorder within a column or move across columns, with mouse, touch or keyboard
- Undo / redo for every change (`Ctrl+Z` / `Ctrl+Shift+Z`), plus an Undo action in the toast after a delete
- Debounced search and priority / tag filters
- Persists to `localStorage`; first visit opens an example board with usage tips
- "Clear board" (with confirmation and undo) to start fresh; an empty board offers to load the example again
- Dark mode that follows the system, with a manual toggle
- Responsive: on phones the columns scroll horizontally with snap

## Keyboard

| Action | Keys |
| --- | --- |
| Pick up / drop a focused card | `Space` |
| Move a picked-up card | Arrow keys |
| Cancel a move | `Esc` |
| Undo / redo | `Ctrl+Z` / `Ctrl+Shift+Z` (or `Ctrl+Y`) |

## Design decisions

- **Normalized state.** Cards live in `cards: Record<id, Card>`, and each column holds an ordered `cardIds` array. A move only rewrites two `cardIds` arrays, and editing a card never touches column data.
- **Zustand over Redux or Context.** Small API, no provider, and selector subscriptions so a change to one part of the board doesn't re-render everything.
- **Undo / redo as snapshots.** Every mutation pushes the previous board onto `past` (capped at 50 entries) and clears `future`. Immutable updates keep this cheap because unchanged cards are shared between snapshots.
- **One history entry per drag.** While dragging, moves are previewed in local component state, and the store is updated once on drop.
- **Only the board is persisted.** History stays in memory. Data read back from `localStorage` is validated with Zod; corrupt data falls back to the sample board instead of crashing. The persisted state is versioned for future migrations.
- **Accessible drag and drop.** dnd-kit's keyboard sensor, custom screen reader announcements ("Fix login redirect bug is in column In Progress, position 2 of 4"), real `<button>`s and labels, and visible focus rings.
- **Theme tokens as CSS variables.** Tailwind colors map to CSS variables, so dark mode swaps the variables instead of adding `dark:` classes everywhere.

## Getting started

```bash
npm install
npm run dev
```

| Script | |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (store logic) |

## Project structure

```
src/
├── app/              layout, page, global styles and theme tokens
├── components/
│   ├── board/        Board (drag and drop), Column, Card, CardModal, AddColumn
│   ├── layout/       Header, SearchBar, ThemeToggle
│   └── ui/           Button, Chip, Modal, Toast, EmptyState, Icons
├── hooks/            useDebounce, useKeyboardShortcuts
├── lib/              Zod schema, sample data, utils
├── store/            useBoardStore (+ tests), useUiStore
└── types/            board types
```

## Future improvements

- Export / import the board as JSON
- Multiple boards
- Drag to reorder columns (the store already supports `moveColumn`)
- Keyboard shortcut help on `?`
- An end-to-end test (load sample data, add a card, reload, card is still there)
