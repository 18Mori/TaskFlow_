import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  direction: SortDirection;
}

export type SortAccessor<T> = (row: T) => string | number;

export interface Column<T> {
  /** Unique identifier used for sorting state and React keys. */
  id: string;
  /** Text rendered in the table header. */
  header: string;
  /**
   * Where to read the sortable value from: either a direct key of `T` or a
   * function that projects a `string | number` out of the row.
   */
  accessor?: keyof T | SortAccessor<T>;
  /** When `true`, the header becomes an interactive sort control. */
  sortable?: boolean;
  /** Custom renderer for the cell. Falls back to the raw accessor value. */
  cell?: (row: T) => ReactNode;
  /** Extra classes applied to every `<td>` for this column. */
  className?: string;
  /** Extra classes applied to the `<th>` for this column. */
  headerClassName?: string;
}

export type TaskStatus = "backlog" | "in-progress" | "completed";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  /** Optional detailed notes / markdown. */
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  /** ISO 8601 timestamp (UTC). Null when no due date was set. */
  due_date: string | null;
  /** When `true` the task lives in the recycling bin instead of the active list. */
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  /** Owner of the task. Applied via `auth.uid()` at insert time. */
  user_id: string | null;
}

/** Editable task fields, shared by the create/update forms and server actions. */
export type TaskInput = Pick<
  Task,
  "title" | "description" | "status" | "priority" | "due_date"
>;

export const TASK_STATUS_ORDER: Record<TaskStatus, number> = {
  backlog: 0,
  "in-progress": 1,
  completed: 2,
};

export const TASK_PRIORITY_ORDER: Record<TaskPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  backlog: "Backlog",
  "in-progress": "In progress",
  completed: "Completed",
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
