import { version } from "../../../package.json";

export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-[13px] text-ink-muted md:px-8">
      <span>Kanban v{version}</span>
      <span>Data is saved in this browser only.</span>
    </footer>
  );
}
