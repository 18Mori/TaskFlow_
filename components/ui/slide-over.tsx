"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useDialogBehavior } from "./dialog-utils";

export interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function SlideOver({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogBehavior({ open, onClose, containerRef: panelRef });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-zinc-950/70 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="slide-over-title"
        aria-describedby={description ? "slide-over-description" : undefined}
        className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in-right flex-col border-l border-zinc-800 bg-zinc-950"
      >
        <header className="flex items-start justify-between gap-4 border-b border-zinc-800 px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <h2
              id="slide-over-title"
              className="text-base font-semibold tracking-tight text-zinc-100"
            >
              {title}
            </h2>
            {description && (
              <p
                id="slide-over-description"
                className="mt-1 text-sm text-zinc-500"
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="-m-1.5 shrink-0 rounded-md p-3.5 text-zinc-500 transition-colors duration-150 hover:bg-zinc-800 hover:text-zinc-100 active:bg-zinc-800 active:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 sm:p-1.5"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <footer className="flex justify-end gap-2 border-t border-zinc-800 px-5 py-4 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
