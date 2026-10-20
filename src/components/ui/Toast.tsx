"use client";

import { useEffect } from "react";
import { useUiStore } from "@/store/useUiStore";

const TOAST_DURATION = 5000;

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  const dismiss = useUiStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismiss, TOAST_DURATION);
    return () => window.clearTimeout(timer);
  }, [toast, dismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      {toast && (
        <div className="pointer-events-auto flex items-center gap-4 rounded-control bg-ink py-2 pl-4 pr-2 text-[15px] font-medium text-surface shadow-drag">
          <span>{toast.message}</span>
          {toast.onAction && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                dismiss();
              }}
              className="rounded-md px-2 py-1 font-semibold text-accent-on-ink hover:bg-surface/10"
            >
              {toast.actionLabel ?? "Undo"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
