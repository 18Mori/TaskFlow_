"use client";

import { Check, Minus } from "lucide-react";

export interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
}

export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  label,
}: CheckboxProps) {
  const active = checked || indeterminate;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      className="group -m-3.5 flex touch-manipulation items-center justify-center rounded-full p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 sm:-m-2 sm:p-2"
    >
      {/*
        The visual 16px box is intentionally smaller than the padded
        transparent hit area (~44px) so the row remains easy to tap on touch
        screens while desktop stays tight.
      */}
      <span
        aria-hidden="true"
        className={`pointer-events-none flex size-4 items-center justify-center rounded-[4px] border transition-[color,background-color,border-color,transform] duration-150 group-active:scale-90 ${
          active
            ? "border-zinc-100 bg-zinc-100 text-zinc-950"
            : "border-zinc-700 bg-zinc-900 group-hover:border-zinc-500"
        }`}
      >
        {indeterminate ? (
          <Minus className="size-3" />
        ) : checked ? (
          <Check className="size-3" />
        ) : null}
      </span>
    </button>
  );
}