"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type ToastKind = "success" | "info" | "error";

export interface ToastAction {
  label: string;
  onSelect: () => void;
}

export interface ToastOptions {
  /** Time in milliseconds before the toast auto-dismisses. Defaults to 4000. */
  duration?: number;
  /** Optional action rendered on the right of the toast body. */
  action?: ToastAction;
}

interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  duration: number;
  action?: ToastAction;
}

let nextId = 0;
let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ToastItem[] {
  return toasts;
}

/**
 * `toasts` is only reassigned inside `emit()` (via push/dismiss), so
 * `getSnapshot` returns a stable reference between renders.
 */
const EMPTY_TOASTS: ToastItem[] = [];

/** Stable snapshot for SSR/hydration — must not allocate a new array per call. */
const getServerSnapshot = () => EMPTY_TOASTS;

function push(kind: ToastKind, title: string, options: ToastOptions = {}): number {
  const item: ToastItem = {
    id: ++nextId,
    kind,
    title,
    duration: options.duration ?? 4000,
    action: options.action,
  };
  toasts = [...toasts, item];
  emit();
  return item.id;
}

export const toast = {
  success: (title: string, options?: ToastOptions) =>
    push("success", title, options),
  info: (title: string, options?: ToastOptions) => push("info", title, options),
  error: (title: string, options?: ToastOptions) => push("error", title, options),
  dismiss: (id: number) => {
    toasts = toasts.filter((item) => item.id !== id);
    emit();
  },
};

const ICONS: Record<ToastKind, ReactNode> = {
  success: <CheckCircle2 aria-hidden="true" className="size-4" />,
  info: <Info aria-hidden="true" className="size-4" />,
  error: <AlertTriangle aria-hidden="true" className="size-4" />,
};

const ICON_TONES: Record<ToastKind, string> = {
  success: "text-emerald-400",
  info: "text-sky-400",
  error: "text-rose-400",
};

function ToastCard({ item }: { item: ToastItem }) {
  useEffect(() => {
    const timer = window.setTimeout(() => toast.dismiss(item.id), item.duration);
    return () => window.clearTimeout(timer);
  }, [item.id, item.duration]);

  const action = item.action;

  return (
    <div
      role="status"
      className="flex animate-slide-up items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/95 px-4 py-3 shadow-lg shadow-black/40 backdrop-blur-sm"
    >
      <span className={`mt-0.5 shrink-0 ${ICON_TONES[item.kind]}`}>
        {ICONS[item.kind]}
      </span>
      <p className="flex-1 text-sm leading-5 text-zinc-200">{item.title}</p>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onSelect();
            toast.dismiss(item.id);
          }}
          className="shrink-0 rounded-sm text-xs font-medium text-zinc-300 underline-offset-4 transition-colors duration-150 hover:text-zinc-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => toast.dismiss(item.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-sm p-0.5 text-zinc-500 transition-colors duration-150 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  );
}

export function Toaster() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
    >
      {items.map((item) => (
        <div key={item.id} className="pointer-events-auto w-full max-w-sm">
          <ToastCard item={item} />
        </div>
      ))}
    </div>
  );
}
