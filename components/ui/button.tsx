import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex select-none touch-manipulation items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-zinc-100 text-zinc-950 hover:bg-white active:bg-zinc-200",
  secondary:
    "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 active:border-zinc-600 active:bg-zinc-800/80 active:text-zinc-50",
  ghost:
    "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 active:bg-zinc-800 active:text-zinc-50",
  danger:
    "border border-red-900/60 bg-red-950/40 text-red-300 hover:border-red-700 hover:bg-red-900/40 active:bg-red-900/60",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs sm:h-7 sm:px-2.5",
  md: "h-10 px-4 text-sm sm:h-8 sm:px-3.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "secondary", size = "md", className = "", type = "button", ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
