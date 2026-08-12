"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import type { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { TaskPriority, TaskStatus } from "@/lib/types";
import { TASK_PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/lib/types";

export interface FilterBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  priorities: ReadonlySet<TaskPriority>;
  onTogglePriority: (priority: TaskPriority) => void;
  onClearPriorities: () => void;
  statuses: ReadonlySet<TaskStatus>;
  onToggleStatus: (status: TaskStatus) => void;
  onClearStatuses: () => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

const pillTriggerClasses =
  "h-10 flex-1 touch-manipulation gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-xs font-medium text-zinc-300 transition-colors duration-150 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 active:border-zinc-600 active:bg-zinc-800 active:text-zinc-50 sm:h-9 sm:flex-none";

function joinLabels(
  selected: ReadonlySet<string>,
  labels: Readonly<Record<string, string>>
): string {
  return selected.size === 0
    ? ""
    : [...selected]
        .map((key) => labels[key])
        .sort()
        .join(", ");
}

export function FilterBar({
  query,
  onQueryChange,
  priorities,
  onTogglePriority,
  onClearPriorities,
  statuses,
  onToggleStatus,
  onClearStatuses,
  hasActiveFilters,
  onClearAll,
}: FilterBarProps) {
  const priorityItems: DropdownMenuItem[] = [
    {
      id: "all",
      label: "All priorities",
      checked: priorities.size === 0,
      onSelect: onClearPriorities,
    },
    ...(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map((key) => ({
      id: key,
      label: TASK_PRIORITY_LABEL[key],
      checked: priorities.has(key),
      onSelect: () => onTogglePriority(key),
    })),
  ];

  const statusItems: DropdownMenuItem[] = [
    {
      id: "all",
      label: "All statuses",
      checked: statuses.size === 0,
      onSelect: onClearStatuses,
    },
    ...(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((key) => ({
      id: key,
      label: TASK_STATUS_LABEL[key],
      checked: statuses.has(key),
      onSelect: () => onToggleStatus(key),
    })),
  ];

  const priorityLabel =
    priorities.size === 0
      ? "Priority"
      : `Priority · ${joinLabels(priorities, TASK_PRIORITY_LABEL)}`;

  const statusLabel =
    statuses.size === 0
      ? "Status"
      : `Status · ${joinLabels(statuses, TASK_STATUS_LABEL)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 basis-56">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search tasks…"
          aria-label="Search tasks"
          className="h-10 w-full touch-manipulation rounded-md border border-zinc-800 bg-zinc-900 pr-3 pl-9 text-sm text-zinc-200 placeholder:text-zinc-600 transition-colors duration-150 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 sm:h-9 [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

      <DropdownMenu
        label="Filter by priority"
        closeOnSelect={false}
        items={priorityItems}
        triggerClassName={pillTriggerClasses}
      >
        <span className="max-w-40 truncate">{priorityLabel}</span>
        <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 opacity-60" />
      </DropdownMenu>

      <DropdownMenu
        label="Filter by status"
        closeOnSelect={false}
        items={statusItems}
        triggerClassName={pillTriggerClasses}
      >
        <span className="max-w-40 truncate">{statusLabel}</span>
        <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 opacity-60" />
      </DropdownMenu>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex h-10 touch-manipulation flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-zinc-500 transition-colors duration-150 hover:bg-zinc-800/60 hover:text-zinc-200 active:bg-zinc-800 active:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 sm:h-9 sm:flex-none"
        >
          <X aria-hidden="true" className="size-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
