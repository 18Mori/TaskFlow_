"use server";

import { createClient } from "@/lib/supabase/server";
import type { Task, TaskInput } from "@/lib/types";

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
}

async function errorFromAction(message: string): Promise<never> {
  throw new Error(message);
}

export async function createTask(input: TaskInput): Promise<Task> {
  assertValidInput(input);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title.trim(),
      status: input.status,
      priority: input.priority,
      due_date: input.due_date,
      user_id: user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    return errorFromAction(error.message);
  }
  return data as Task;
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  assertValidInput(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: input.title.trim(),
      status: input.status,
      priority: input.priority,
      due_date: input.due_date,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return errorFromAction(error.message);
  }
  return data as Task;
}

export async function softDeleteTask(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) {
    return errorFromAction(error.message);
  }
}

export async function restoreTask(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ is_deleted: false })
    .eq("id", id);

  if (error) {
    return errorFromAction(error.message);
  }
}

export async function permanentlyDeleteTask(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
    return errorFromAction(error.message);
  }
}