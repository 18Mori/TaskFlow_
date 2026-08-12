"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { Check } from "lucide-react";

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  /** When defined, renders a trailing check indicator reserving space. */
  checked?: boolean;
}

export interface DropdownMenuProps {
  /** Accessible name for the trigger button and the menu. */
  label: string;
  align?: "start" | "end";
  items: readonly DropdownMenuItem[];
  children: ReactNode;
  /** When `true` (default) the menu closes after an item is selected. */
  closeOnSelect?: boolean;
  /** Extra classes for the trigger button (e.g. pill styling). */
  triggerClassName?: string;
}

interface MenuPosition {
  top: number;
  left?: number;
  right?: number;
}

export function DropdownMenu({
  label,
  align = "start",
  items,
  children,
  closeOnSelect = true,
  triggerClassName = "",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) {
        return;
      }
      if (buttonRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    function handleScroll() {
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      menuRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();
    }
  }, [open]);

  function openMenu() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    setPosition(
      align === "end"
        ? {
            top: rect.bottom + 4,
            right: Math.max(8, window.innerWidth - rect.right),
          }
        : { top: rect.bottom + 4, left: rect.left }
    );
    setOpen(true);
  }

  function handleSelect(item: DropdownMenuItem) {
    if (closeOnSelect) {
      setOpen(false);
    }
    item.onSelect();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        className={`inline-flex touch-manipulation items-center justify-center rounded-md p-2 text-zinc-500 transition-colors duration-150 hover:bg-zinc-800 hover:text-zinc-100 active:bg-zinc-800 active:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 sm:p-1.5 ${triggerClassName}`}
      >
        {children}
      </button>
      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            style={position}
            className="fixed z-50 min-w-40 animate-slide-up rounded-md border border-zinc-800 bg-zinc-900 p-1 shadow-lg shadow-black/40"
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                role={
                  item.checked !== undefined
                    ? "menuitemcheckbox"
                    : "menuitem"
                }
                aria-checked={item.checked}
                onClick={() => handleSelect(item)}
                className={`flex w-full touch-manipulation items-center gap-2 rounded-sm px-2.5 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 sm:py-1.5 ${
                  item.destructive
                    ? "text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 active:bg-zinc-800 active:text-zinc-50"
                }`}
              >
                {item.icon && (
                  <span aria-hidden="true" className="size-4">
                    {item.icon}
                  </span>
                )}
                {item.label}
                {item.checked !== undefined && (
                  <span className="ml-auto flex size-4 items-center justify-center">
                    {item.checked && (
                      <Check aria-hidden="true" className="size-4" />
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
