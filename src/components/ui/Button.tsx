import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "dashed" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-contrast font-semibold hover:bg-accent/90",
  secondary: "border border-line bg-surface text-ink hover:bg-page",
  dashed: "border border-dashed border-ink-muted/30 text-ink-muted hover:bg-surface/60 hover:text-ink",
  ghost: "text-ink-muted hover:bg-column hover:text-ink",
  danger: "border border-line bg-surface text-priority-high hover:bg-priority-high-bg",
};

export function Button({ variant = "secondary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-control items-center justify-center gap-2 whitespace-nowrap rounded-control px-4 text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  variant?: Variant;
}

export function IconButton({ variant = "secondary", className, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-control w-control shrink-0 items-center justify-center rounded-control transition-colors disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
