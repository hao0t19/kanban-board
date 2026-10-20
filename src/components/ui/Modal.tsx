"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Native <dialog>: focus trapping, Escape to close and top-layer rendering for free. */
export function Modal({ title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="w-[calc(100%-2rem)] max-w-lg rounded-column border border-line bg-surface p-0 text-ink shadow-drag backdrop:bg-ink/40"
    >
      {children}
    </dialog>
  );
}
