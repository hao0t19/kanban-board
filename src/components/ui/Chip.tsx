import type { ReactNode } from "react";
import type { Priority } from "@/types/board";
import { cn } from "@/lib/utils";

const priorityStyles: Record<Priority, string> = {
  high: "bg-priority-high-bg text-priority-high",
  medium: "bg-priority-medium-bg text-priority-medium",
  low: "bg-priority-low-bg text-priority-low",
};

export const priorityLabel: Record<Priority, string> = { high: "High", medium: "Medium", low: "Low" };

const chip = "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[13px] font-medium leading-5";

export function PriorityChip({ priority }: { priority: Priority }) {
  return <span className={cn(chip, priorityStyles[priority])}>{priorityLabel[priority]}</span>;
}

export function TagChip({ tag, children }: { tag: string; children?: ReactNode }) {
  return (
    <span className={cn(chip, "bg-tag-bg font-normal text-tag")}>
      {tag}
      {children}
    </span>
  );
}
