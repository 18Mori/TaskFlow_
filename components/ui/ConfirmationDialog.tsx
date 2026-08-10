"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { useDialogBehavior } from "./dialog-utils";
import { Button } from "./button";

export interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  tone?: "default" | "danger";
  /** Optional leading icon rendered inside a muted icon tile. */
  icon?: ReactNode;
}

export function ConfirmationDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  tone = "default",
  icon,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogBehavior({ open, onClose, containerRef: dialogRef });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-zinc-950/70 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
        className="relative w-full max-w-sm animate-slide-up rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-lg shadow-black/40"
      >
        {icon && (
          <div
            className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border ${
              tone === "danger"
                ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                : "border-zinc-700 bg-zinc-800 text-zinc-300"
            }`}
          >
            {icon}
          </div>
        )}
        <h2
          id="confirmation-dialog-title"
          className="text-base font-semibold tracking-tight text-zinc-100"
        >
          {title}
        </h2>
        <p
          id="confirmation-dialog-description"
          className="mt-2 text-sm leading-relaxed text-zinc-400"
        >
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" data-autofocus onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
