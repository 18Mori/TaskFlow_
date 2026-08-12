"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Column, SortState } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

export interface DataTableProps<T> {
  columns: readonly Column<T>[];
  data: readonly T[];
  getRowId: (row: T) => string;
  initialSort?: SortState;
  initialPageSize?: number;
  pageSizeOptions?: readonly number[];
  emptyState?: ReactNode;
  /** When `true`, renders a checkbox column and keeps selection UI. */
  selectable?: boolean;
  /** Controlled row ids currently selected. */
  selectedRowIds?: ReadonlySet<string>;
  /** Called whenever the selected set changes. */
  onSelectionChange?: (selected: Set<string>) => void;
}

function getSortValue<T>(column: Column<T>, row: T): string | number {
  const accessor = column.accessor;
  if (typeof accessor === "function") {
    return accessor(row);
  }
  if (accessor === undefined) {
    return "";
  }
  const value = row[accessor];
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  return String(value);
}

function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const pages: (number | "ellipsis")[] = [];
  const start = Math.max(1, current - 1);
  const end = Math.min(total, current + 1);

  if (start > 1) {
    pages.push(1);
    if (start > 2) {
      pages.push("ellipsis");
    }
  }
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }
  if (end < total) {
    if (end < total - 1) {
      pages.push("ellipsis");
    }
    pages.push(total);
  }
  return pages;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  initialSort,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25],
  emptyState = "No rows to display.",
  selectable = false,
  selectedRowIds = new Set<string>(),
  onSelectionChange,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(initialSort ?? null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const sortedData = useMemo(() => {
    const copy = [...data];
    if (!sort) {
      return copy;
    }
    const column = columns.find((candidate) => candidate.id === sort.key);
    if (!column?.sortable) {
      return copy;
    }
    const direction = sort.direction === "asc" ? 1 : -1;
    return copy.sort((a, b) => {
      const left = getSortValue(column, a);
      const right = getSortValue(column, b);
      if (left < right) return -1 * direction;
      if (left > right) return 1 * direction;
      return 0;
    });
  }, [data, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => sortedData.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sortedData, safePage, pageSize]
  );

  const from = sortedData.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, sortedData.length);

  const toggleSelection = (id: string) => {
    if (!onSelectionChange) {
      return;
    }
    const next = new Set(selectedRowIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  const selection = (() => {
    if (!selectable || !onSelectionChange) {
      return null;
    }
    const pageIds = pageRows.map(getRowId);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedRowIds.has(id));
    const someSelected = pageIds.some((id) => selectedRowIds.has(id));

    const togglePage = () => {
      const next = new Set(selectedRowIds);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      onSelectionChange(next);
    };

    return { allSelected, someSelected, togglePage };
  })();

  const totalColumns = columns.length + (selection ? 1 : 0);

  function toggleSort(columnId: string) {
    setSort((current) => {
      if (current?.key === columnId) {
        return current.direction === "asc"
          ? { key: columnId, direction: "desc" }
          : null;
      }
      return { key: columnId, direction: "asc" };
    });
    setPage(1);
  }

  function changePageSize(next: number) {
    setPageSize(next);
    setPage(1);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {selection && (
                <th scope="col" className="h-10 w-10 px-4 pr-0">
                  <div className="flex items-center">
                    <Checkbox
                      checked={selection.allSelected}
                      indeterminate={selection.someSelected && !selection.allSelected}
                      onChange={selection.togglePage}
                      label={
                        selection.allSelected
                          ? "Clear selection"
                          : "Select all tasks on this page"
                      }
                    />
                  </div>
                </th>
              )}
              {columns.map((column) => {
                const isActive = sort?.key === column.id;
                const ariaSort = isActive
                  ? sort.direction === "asc"
                    ? ("ascending" as const)
                    : ("descending" as const)
                  : undefined;

                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={ariaSort}
                    className={`h-10 px-4 text-xs font-medium tracking-wide whitespace-nowrap text-zinc-500 select-none ${column.headerClassName ?? ""}`}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.id)}
                        aria-label={`Sort by ${column.header}`}
                        className={`inline-flex h-full items-center gap-1 transition-colors duration-150 hover:text-zinc-200 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${isActive ? "text-zinc-200" : ""}`}
                      >
                        {column.header}
                        {isActive ? (
                          sort.direction === "asc" ? (
                            <ArrowUp aria-hidden="true" className="size-3.5" />
                          ) : (
                            <ArrowDown aria-hidden="true" className="size-3.5" />
                          )
                        ) : (
                          <ArrowUpDown
                            aria-hidden="true"
                            className="size-3 opacity-50"
                          />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const id = getRowId(row);
              const selected = selectedRowIds.has(id);
              return (
                <tr
                  key={id}
                  onClick={
                    selection ? () => toggleSelection(id) : undefined
                  }
                  className={`group border-b border-zinc-800/60 transition-colors duration-150 last:border-b-0 ${
                    selected
                      ? "bg-zinc-800/40 hover:bg-zinc-800/50"
                      : "hover:bg-zinc-800/30"
                  } ${selection ? "cursor-pointer" : ""}`}
                >
                  {selection && (
                    <td className="px-4 py-3 pr-0 align-middle">
                      <div className="flex items-center">
                        <Checkbox
                          checked={selected}
                          onChange={() => toggleSelection(id)}
                          label={`Select row ${id}`}
                        />
                      </div>
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`px-4 py-3 align-middle ${column.className ?? ""}`}
                    >
                      {column.cell ? column.cell(row) : getSortValue(column, row)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={totalColumns}
                  className="h-32 px-4 text-center text-sm text-zinc-500"
                >
                  {emptyState}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3">
        <p role="status" className="text-xs tabular-nums text-zinc-500">
          Showing {from}–{to} of {sortedData.length}
        </p>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => changePageSize(Number(event.target.value))}
              className="h-7 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-300 focus:border-zinc-600 focus:outline-none"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <nav aria-label="Pagination" className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1}
              aria-label="Previous page"
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors duration-150 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>

            {getPageItems(safePage, totalPages).map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden="true"
                  className="px-1 text-xs text-zinc-600"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  aria-current={item === safePage ? "page" : undefined}
                  aria-label={`Page ${item}`}
                  className={`h-7 min-w-7 rounded-md px-1.5 text-xs tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
                    item === safePage
                      ? "bg-zinc-700 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages}
              aria-label="Next page"
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors duration-150 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}