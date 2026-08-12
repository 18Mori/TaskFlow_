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
      className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
        active
          ? "border-zinc-100 bg-zinc-100 text-zinc-950"
          : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
      }`}
    >
      {indeterminate ? (
        <Minus aria-hidden="true" className="size-3" />
      ) : checked ? (
        <Check aria-hidden="true" className="size-3" />
      ) : null}
    </button>
  );
}