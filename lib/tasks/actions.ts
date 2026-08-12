"use server";

import { createClient } from "@/lib/supabase/server";
import type { Task, TaskInput, TaskStatus } from "@/lib/types";

const VALID_STATUSES = new Set(["backlog", "in-progress", "completed"]);
const VALID_PRIORITIES = new Set(["low", "medium", "high"]);

function assertValidInput(input: TaskInput): void {
  if (typeof input.title !== "string" || input.title.trim().length === 0) {
    throw new Error("Task title is required.");
  }
  if (!VALID_STATUSES.has(input.status)) {
    throw new Error(`Invalid status: ${input.status}`);
  }
  if (!VALID_PRIORITIES.has(input.priority)) {
    throw new Error(`Invalid priority: ${input.priority}`);
  }
  if (
    input.due_date !== null &&
    (typeof input.due_date !== "string" || Number.isNaN(Date.parse(input.due_date)))
  ) {
    throw new Error("Invalid due date.");
  }
  if (
    input.description !== null &&
    typeof input.description !== "undefined" &&
    typeof input.description !== "string"
  ) {
    throw new Error("Invalid description.");
  }
}

function assertStatus(status: TaskStatus): void {
  if (!VALID_STATUSES.has(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
}

function assertIds(ids: string[]): void {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("No tasks selected.");
  }
  if (ids.some((id) => typeof id !== "string" || id.length === 0)) {
    throw new Error("Invalid task id.");
  }
}

async function throwAction(message: string): Promise<never> {
  throw new Error(message);
}

async function requireSession(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<void> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    await throwAction("You must be signed in to continue.");
  }
}

function normalizeDescription(description: unknown): string | null {
  if (typeof description !== "string" || description.trim().length === 0) {
    return null;
  }
  return description.trim();
}

export async function createTask(input: TaskInput): Promise<Task> {
  assertValidInput(input);
  const supabase = await createClient();
  await requireSession(supabase);

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title.trim(),
      description: normalizeDescription(input.description),
      status: input.status,
      priority: input.priority,
      due_date: input.due_date,
    })
    .select()
    .single();

  if (error) {
    return throwAction(error.message);
  }
  return data as Task;
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  assertValidInput(input);
  const supabase = await createClient();
  await requireSession(supabase);

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: input.title.trim(),
      description: normalizeDescription(input.description),
      status: input.status,
      priority: input.priority,
      due_date: input.due_date,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return throwAction(error.message);
  }
  return data as Task;
}

export async function softDeleteTask(id: string): Promise<void> {
  const supabase = await createClient();
  await requireSession(supabase);

  const { error } = await supabase
    .from("tasks")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) {
    return throwAction(error.message);
  }
}

export async function restoreTask(id: string): Promise<void> {
  const supabase = await createClient();
  await requireSession(supabase);

  const { error } = await supabase
    .from("tasks")
    .update({ is_deleted: false })
    .eq("id", id);

  if (error) {
    return throwAction(error.message);
  }
}

export async function permanentlyDeleteTask(id: string): Promise<void> {
  const supabase = await createClient();
  await requireSession(supabase);

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    return throwAction(error.message);
  }
}

// ------------------------------------------------------------
// Batch operations
// ------------------------------------------------------------

export async function bulkUpdateTaskStatus(
  ids: string[],
  status: TaskStatus
): Promise<void> {
  assertIds(ids);
  assertStatus(status);
  const supabase = await createClient();
  await requireSession(supabase);

  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .in("id", ids);

  if (error) {
    return throwAction(error.message);
  }
}

export async function bulkSoftDelete(ids: string[]): Promise<void> {
  assertIds(ids);
  const supabase = await createClient();
  await requireSession(supabase);

  const { error } = await supabase
    .from("tasks")
    .update({ is_deleted: true })
    .in("id", ids);

  if (error) {
    return throwAction(error.message);
  }
}

export async function bulkRestore(ids: string[]): Promise<void> {
  assertIds(ids);
  const supabase = await createClient();
  await requireSession(supabase);

  const { error } = await supabase
    .from("tasks")
    .update({ is_deleted: false })
    .in("id", ids);

  if (error) {
    return throwAction(error.message);
  }
}