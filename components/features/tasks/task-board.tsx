"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  CheckSquare,
  LogOut,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { AppLogo } from "@/components/ui/AppLogo";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { Kbd } from "@/components/ui/kbd";
import { toast } from "@/components/ui/toast";
import { signOut } from "@/lib/auth/actions";
import { FilterBar } from "./filter-bar";
import { createTaskColumns } from "./columns";
import { TaskForm } from "./task-form";
import { TaskEditPanel } from "./task-edit-panel";
import { TaskDeleteDialog } from "./task-delete-dialog";
import { useTasks } from "@/lib/tasks/use-tasks";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "@/lib/types";

type ViewMode = "active" | "trash";

export function TaskBoard() {
  const {
    tasks,
    status,
    error,
    retry,
    createTask,
    updateTask,
    permanentlyDeleteTask,
    bulkUpdateStatus,
    bulkSoftDelete,
    bulkRestore,
  } = useTasks();
  const [isSigningOut, startTransition] = useTransition();

  const [view, setView] = useState<ViewMode>("active");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [priorities, setPriorities] = useState<Set<TaskPriority>>(new Set());
  const [statuses, setStatuses] = useState<Set<TaskStatus>>(new Set());

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.is_deleted),
    [tasks]
  );
  const trashedTasks = useMemo(
    () => tasks.filter((task) => task.is_deleted),
    [tasks]
  );
  const baseTasks = view === "trash" ? trashedTasks : activeTasks;

  const visibleTasks = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    return baseTasks.filter((task) => {
      const matchesQuery =
        normalized.length === 0 ||
        task.title.toLowerCase().includes(normalized) ||
        (task.description ?? "").toLowerCase().includes(normalized);
      const matchesPriority =
        priorities.size === 0 || priorities.has(task.priority);
      const matchesStatus =
        statuses.size === 0 || statuses.has(task.status);
      return matchesQuery && matchesPriority && matchesStatus;
    });
  }, [baseTasks, debouncedQuery, priorities, statuses]);

  const completedCount = useMemo(
    () => activeTasks.filter((task) => task.status === "completed").length,
    [activeTasks]
  );
  const progress =
    activeTasks.length === 0
      ? 0
      : Math.round((completedCount / activeTasks.length) * 100);

  const hasActiveFilters =
    query.trim().length > 0 || priorities.size > 0 || statuses.size > 0;

  const selectedTasks = useMemo(
    () => baseTasks.filter((task) => selectedIds.has(task.id)),
    [baseTasks, selectedIds]
  );

  // ------------------------------------------------------------
  // Single-row handlers
  // ------------------------------------------------------------
  const handleCreate = useCallback(
    async (input: TaskInput) => {
      if (await createTask(input)) {
        setFormOpen(false);
        toast.success("Task created successfully.");
      }
    },
    [createTask]
  );

  const handleSaveEdit = useCallback(
    async (input: TaskInput) => {
      if (!editingTask) {
        return;
      }
      if (await updateTask(editingTask.id, input)) {
        setEditingTask(null);
        toast.success("Task updated.");
      }
    },
    [editingTask, updateTask]
  );

  const handleDeletePermanently = useCallback(
    async (task: Task) => {
      if (await permanentlyDeleteTask(task.id)) {
        setDeletingTask(null);
        toast.success("Task permanently deleted.");
      }
    },
    [permanentlyDeleteTask]
  );

  // ------------------------------------------------------------
  // Batch handlers (floating action bar)
  // ------------------------------------------------------------
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBatchComplete = useCallback(async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) {
      return;
    }
    if (await bulkUpdateStatus(ids, "completed")) {
      toast.success(
        `${ids.length} ${ids.length === 1 ? "task" : "tasks"} marked as completed.`
      );
    }
    clearSelection();
  }, [selectedIds, bulkUpdateStatus, clearSelection]);

  const handleBatchDelete = useCallback(async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) {
      return;
    }
    const previousIds = new Set(ids);
    if (await bulkSoftDelete(ids)) {
      toast.success(
        `${ids.length} ${ids.length === 1 ? "task" : "tasks"} moved to recycling bin.`,
        {
          action: {
            label: "Undo",
            onSelect: () => void bulkRestore([...previousIds]),
          },
        }
      );
    }
    clearSelection();
  }, [selectedIds, bulkSoftDelete, bulkRestore, clearSelection]);

  const handleBatchRestore = useCallback(async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) {
      return;
    }
    if (await bulkRestore(ids)) {
      toast.success(
        `${ids.length} ${ids.length === 1 ? "task" : "tasks"} restored to active list.`
      );
    }
    clearSelection();
  }, [selectedIds, bulkRestore, clearSelection]);

  // ------------------------------------------------------------
  // Filters
  // ------------------------------------------------------------
  const togglePriority = useCallback((priority: TaskPriority) => {
    setPriorities((current) => {
      const next = new Set(current);
      if (next.has(priority)) {
        next.delete(priority);
      } else {
        next.add(priority);
      }
      return next;
    });
  }, []);

  const toggleStatus = useCallback((status: TaskStatus) => {
    setStatuses((current) => {
      const next = new Set(current);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setPriorities(new Set());
    setStatuses(new Set());
  }, []);

  const clearPriorities = useCallback(() => setPriorities(new Set()), []);
  const clearStatuses = useCallback(() => setStatuses(new Set()), []);

  const handleSignOut = useCallback(() => {
    startTransition(async () => {
      await signOut();
    });
  }, []);

  // ------------------------------------------------------------
  // Keyboard shortcuts (N · Escape · Backspace)
  // ------------------------------------------------------------
  const shortcuts = useRef<{
    openCreate: () => void;
    closeOverlays: () => void;
    deleteSelected: () => void;
    selectedCount: number;
  }>({
    openCreate: () => {},
    closeOverlays: () => {},
    deleteSelected: () => {},
    selectedCount: 0,
  });

  useEffect(() => {
    shortcuts.current = {
      openCreate: () => setFormOpen(true),
      closeOverlays: () => {
        setFormOpen(false);
        setEditingTask(null);
      },
      deleteSelected: () => void handleBatchDelete(),
      selectedCount: selectedIds.size,
    };
  });

  useEffect(() => {
    const isTyping = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }
      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target)) {
        return;
      }
      const s = shortcuts.current;

      if (event.key === "Escape") {
        s.closeOverlays();
        return;
      }
      if (
        (event.key === "n" || event.key === "N") &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        s.openCreate();
        return;
      }
      if (event.key === "Backspace" && s.selectedCount > 0) {
        event.preventDefault();
        s.deleteSelected();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const columns = useMemo(
    () =>
      createTaskColumns(
        {
          onEdit: setEditingTask,
          onDeletePermanently: setDeletingTask,
        },
        view
      ),
    [view]
  );

  const renderSummary = () => {
    if (status === "loading") {
      return "Loading tasks…";
    }
    return view === "active"
      ? `${completedCount} of ${activeTasks.length} completed`
      : `${trashedTasks.length} ${
          trashedTasks.length === 1 ? "task" : "tasks"
        } in recycling bin`;
  };

  const renderCount = (count: number) =>
    status === "loading" ? "…" : `(${count})`;

  const selectedLabel = `${selectedTasks.length} ${
    selectedTasks.length === 1 ? "task" : "tasks"
  } selected`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex items-center justify-between sm:mb-10">
        <div className="flex min-w-0 items-center gap-2.5">
          <AppLogo size={24} className="shrink-0 text-zinc-200" />
          <span className="truncate text-base font-semibold tracking-tight text-zinc-100">
            Taskflow
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
          <LogOut aria-hidden="true" className="size-3.5" />
          Sign out
        </Button>
      </div>

      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-500 sm:text-xs">
              Workspace
            </p>
            <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-zinc-100 sm:mt-2 sm:text-2xl md:text-3xl">
              Tasks
            </h1>
            <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
              {renderSummary()}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <SegmentedControl<ViewMode>
              ariaLabel="Task list view"
              value={view}
              onChange={setView}
              options={[
                {
                  value: "active",
                  label: (
                    <>
                      Tasks
                      <span className="ml-1.5 tabular-nums text-zinc-500">
                        {renderCount(activeTasks.length)}
                      </span>
                    </>
                  ),
                },
                {
                  value: "trash",
                  label: (
                    <>
                      Trash
                      <span className="ml-1.5 tabular-nums text-zinc-500">
                        {renderCount(trashedTasks.length)}
                      </span>
                    </>
                  ),
                },
              ]}
            />
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={() => setFormOpen(true)}
            >
              <Plus aria-hidden="true" className="size-4" />
              New task
              <Kbd>N</Kbd>
            </Button>
          </div>
        </div>
      </header>

      {status === "ready" && view === "active" && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-500">Progress</span>
            <span className="tabular-nums text-zinc-400">{progress}% completed</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1 w-full overflow-hidden rounded-full bg-zinc-800"
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        priorities={priorities}
        onTogglePriority={togglePriority}
        onClearPriorities={clearPriorities}
        statuses={statuses}
        onToggleStatus={toggleStatus}
        onClearStatuses={clearStatuses}
        hasActiveFilters={hasActiveFilters}
        onClearAll={clearFilters}
      />

      <div className="mt-4">
        {status === "loading" ? (
          <SkeletonTable />
        ) : status === "error" ? (
          <div
            role="alert"
            className="flex flex-col items-center justify-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-6 py-14 text-center"
          >
            <p className="text-sm font-medium text-zinc-100">
              We couldn&apos;t load your tasks.
            </p>
            <p className="max-w-md text-xs leading-5 text-zinc-500">{error}</p>
            <Button variant="secondary" onClick={retry}>
              <RotateCcw aria-hidden="true" className="size-4" />
              Try again
            </Button>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={visibleTasks}
              getRowId={(task) => task.id}
              initialSort={{ key: "dueDate", direction: "asc" }}
              selectable
              selectedRowIds={selectedIds}
              onSelectionChange={setSelectedIds}
              emptyState={
                view === "trash"
                  ? "The recycling bin is empty."
                  : "No tasks match your current filters."
              }
            />
            {selectedTasks.length > 0 && (
              <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:bottom-6">
                <div className="pointer-events-auto flex w-full max-w-md animate-slide-up flex-wrap items-center justify-center gap-2 rounded-xl border border-zinc-700/70 bg-zinc-950/85 px-3.5 py-3 shadow-2xl shadow-black/50 backdrop-blur-md sm:w-auto">
                  <span className="flex items-center gap-2 px-1.5 text-xs font-medium text-zinc-200 sm:text-sm">
                    <CheckSquare
                      aria-hidden="true"
                      className="size-4 shrink-0 text-zinc-500"
                    />
                    {selectedLabel}
                  </span>
                  <div className="mx-1 hidden h-5 w-px bg-zinc-800 sm:block" />
                  {view === "active" ? (
                    <>
                      <Button variant="secondary" size="sm" onClick={handleBatchComplete}>
                        Mark as completed
                      </Button>
                      <Button variant="danger" size="sm" onClick={handleBatchDelete}>
                        <Trash2 aria-hidden="true" className="size-3.5" />
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={handleBatchRestore}>
                      <RotateCcw aria-hidden="true" className="size-3.5" />
                      Restore
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="ml-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-zinc-500 transition-colors duration-150 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                  >
                    <Kbd>Esc</Kbd>
                    Clear
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <TaskForm
        key={formOpen ? "open" : "closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />
      <TaskEditPanel
        key={editingTask?.id}
        open={editingTask !== null}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
      />
      <TaskDeleteDialog
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeletePermanently}
      />
    </div>
  );
}