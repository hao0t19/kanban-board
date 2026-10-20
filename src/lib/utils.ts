export function createId(): string {
  return crypto.randomUUID();
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const dueFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

/** Formats a YYYY-MM-DD date as e.g. "Oct 21", in local time. */
export function formatDue(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return dueFormatter.format(new Date(year, month - 1, day));
}

export function isDoneColumn(title: string): boolean {
  return title.trim().toLowerCase() === "done";
}
