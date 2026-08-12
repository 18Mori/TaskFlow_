import { MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { Column, Task } from "@/lib/types";
import {
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_ORDER,
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
} from "@/lib/types";
import type { TaskPriority, TaskStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import type { BadgeTone } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

export type TaskTableMode = "active" | "trash";

export interface TaskColumnHandlers {
  onEdit: (task: Task) => void;
  onMoveToTrash: (task: Task) => void;
  onRestore: (task: Task) => void;
  onDeletePermanently: (task: Task) => void;
}

const STATUS_TONES: Record<TaskStatus, BadgeTone> = {
  backlog: "slate",
  "in-progress": "amber",
  completed: "emerald",
};

const PRIORITY_TONES: Record<TaskPriority, BadgeTone> = {
  low: "zinc",
  medium: "sky",
  high: "rose",
};

function formatDueDate(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function isPastDue(task: Task): boolean {
  if (task.status === "completed" || !task.due_date) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.due_date);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  return dueDay < today;
}

function TaskTitle({ task }: { task: Task }) {
  return (
    <span className="block max-w-md min-w-0">
      <span
        className={`block truncate ${
          task.status === "completed"
            ? "text-zinc-500 line-through"
            : "text-zinc-200"
        }`}
      >
        {task.title}
      </span>
      {task.description && (
        <span className="mt-0.5 block truncate text-xs text-zinc-500">
          {task.description}
        </span>
      )}
    </span>
  );
}

function TaskDueDate({ task }: { task: Task }) {
  const overdue = isPastDue(task);
  return (
    <span
      className={`text-xs tabular-nums ${
        overdue ? "font-medium text-rose-400" : "text-zinc-400"
      }`}
    >
      {formatDueDate(task.due_date)}
      {overdue && (
        <span className="ml-1.5 font-normal text-rose-500/80">overdue</span>
      )}
    </span>
  );
}

export function createTaskColumns(
  { onEdit, onMoveToTrash, onRestore, onDeletePermanently }: TaskColumnHandlers,
  mode: TaskTableMode
): Column<Task>[] {
  return [
    {
      id: "title",
      header: "Task",
      accessor: (row) => row.title,
      sortable: true,
      cell: (task) => <TaskTitle task={task} />,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => TASK_STATUS_ORDER[row.status],
      sortable: true,
      cell: (task) => (
        <Badge tone={STATUS_TONES[task.status]} dot>
          {TASK_STATUS_LABEL[task.status]}
        </Badge>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      accessor: (row) => TASK_PRIORITY_ORDER[row.priority],
      sortable: true,
      cell: (task) => (
        <Badge tone={PRIORITY_TONES[task.priority]}>
          {TASK_PRIORITY_LABEL[task.priority]}
        </Badge>
      ),
    },
    {
      id: "dueDate",
      header: "Due date",
      accessor: (row) => row.due_date ?? "",
      sortable: true,
      cell: (task) => <TaskDueDate task={task} />,
    },
    {
      id: "actions",
      header: "",
      sortable: false,
      className: "w-10",
      cell: (task) => {
        const actions =
          mode === "active"
            ? [
                {
                  id: "edit",
                  label: "Edit",
                  icon: <Pencil className="size-4" />,
                  onSelect: () => onEdit(task),
                },
                {
                  id: "trash",
                  label: "Delete",
                  icon: <Trash2 className="size-4" />,
                  onSelect: () => onMoveToTrash(task),
                  destructive: true,
                },
              ]
            : [
                {
                  id: "restore",
                  label: "Restore",
                  icon: <RotateCcw className="size-4" />,
                  onSelect: () => onRestore(task),
                },
                {
                  id: "delete-permanent",
                  label: "Delete permanently",
                  icon: <Trash2 className="size-4" />,
                  onSelect: () => onDeletePermanently(task),
                  destructive: true,
                },
              ];
        return (
          <DropdownMenu
            label={`Actions for ${task.title}`}
            align="end"
            items={actions}
          >
            <MoreHorizontal aria-hidden="true" className="size-4" />
          </DropdownMenu>
        );
      },
    },
  ];
}
