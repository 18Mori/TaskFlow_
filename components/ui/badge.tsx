import type { ReactNode } from "react";

export type BadgeTone =
  | "slate"
  | "amber"
  | "emerald"
  | "sky"
  | "rose"
  | "zinc";

export interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

const tones: Record<BadgeTone, string> = {
  slate:
    "border-zinc-700/60 bg-zinc-800/50 text-zinc-300",
  amber:
    "border-amber-500/25 bg-amber-500/10 text-amber-400",
  emerald:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  sky: "border-sky-500/25 bg-sky-500/10 text-sky-400",
  rose: "border-rose-500/25 bg-rose-500/10 text-rose-400",
  zinc: "border-zinc-700 bg-zinc-800 text-zinc-300",
};

const dotColors: Record<BadgeTone, string> = {
  slate: "bg-zinc-400",
  amber: "bg-amber-400",
  emerald: "bg-emerald-400",
  sky: "bg-sky-400",
  rose: "bg-rose-400",
  zinc: "bg-zinc-400",
};

export function Badge({ tone, children, dot = false, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${dotColors[tone]}`}
        />
      )}
      {children}
    </span>
  );
}
