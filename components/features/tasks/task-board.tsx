"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { AppLogo } from "@/components/ui/AppLogo";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { toast } from "@/components/ui/toast";
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
    softDeleteTask,
    restoreTask,
    permanentlyDeleteTask,
  } = useTasks();

  const [view, setView] = useState<ViewMode>("active");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

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
        task.title.toLowerCase().includes(normalized);
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

  const hasActiveFilters =
    query.trim().length > 0 || priorities.size > 0 || statuses.size > 0;

  const handleMoveToTrash = useCallback(
    (task: Task) => {
      void softDeleteTask(task.id);
      toast.success("Task moved to recycling bin.", {
        action: {
          label: "Undo",
          onSelect: () => void restoreTask(task.id),
        },
      });
    },
    [softDeleteTask, restoreTask]
  );

  const handleRestore = useCallback(
    (task: Task) => {
      void restoreTask(task.id);
      toast.success("Task restored to active list.");
    },
    [restoreTask]
  );

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

  const columns = useMemo(
    () =>
      createTaskColumns(
        {
          onEdit: setEditingTask,
          onMoveToTrash: handleMoveToTrash,
          onRestore: handleRestore,
          onDeletePermanently: setDeletingTask,
        },
        view
      ),
    [view, handleMoveToTrash, handleRestore]
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

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-10 flex items-center gap-2.5">
        <AppLogo size={24} className="text-zinc-200" />
        <span className="text-base font-semibold tracking-tight text-zinc-100">
          Taskflow
        </span>
      </div>

      <header className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-500">
              Workspace
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
              Tasks
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{renderSummary()}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
            <Button variant="primary" onClick={() => setFormOpen(true)}>
              <Plus aria-hidden="true" className="size-4" />
              New task
            </Button>
          </div>
        </div>
      </header>

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
            <p className="max-w-md text-xs leading-5 text-zinc-500">
              {error}
            </p>
            <Button variant="secondary" onClick={retry}>
              <RotateCcw aria-hidden="true" className="size-4" />
              Try again
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={visibleTasks}
            getRowId={(task) => task.id}
            initialSort={{ key: "dueDate", direction: "asc" }}
            emptyState={
              view === "trash"
                ? "The recycling bin is empty."
                : "No tasks match your current filters."
            }
          />
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