"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import {
  createTask as createTaskAction,
  updateTask as updateTaskAction,
  softDeleteTask as softDeleteTaskAction,
  restoreTask as restoreTaskAction,
  permanentlyDeleteTask as permanentlyDeleteTaskAction,
} from "@/lib/tasks/actions";
import type { Task, TaskInput } from "@/lib/types";

export type TasksQueryStatus = "loading" | "ready" | "error";

export interface UseTasksResult {
  tasks: Task[];
  status: TasksQueryStatus;
  error: string | null;
  retry: () => void;
  createTask: (input: TaskInput) => Promise<boolean>;
  updateTask: (id: string, input: TaskInput) => Promise<boolean>;
  softDeleteTask: (id: string) => Promise<boolean>;
  restoreTask: (id: string) => Promise<boolean>;
  permanentlyDeleteTask: (id: string) => Promise<boolean>;
}

async function fetchTasks(): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as Task[];
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Failed to load tasks.";
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<TasksQueryStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const runFetch = useCallback(async (): Promise<void> => {
    try {
      const data = await fetchTasks();
      if (mounted.current) {
        setTasks(data);
        setStatus("ready");
        setError(null);
      }
    } catch (err) {
      if (mounted.current) {
        setError(toErrorMessage(err));
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchTasks()
      .then((data) => {
        if (!cancelled) {
          setTasks(data);
          setStatus("ready");
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(toErrorMessage(err));
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const retry = useCallback(() => {
    setStatus("loading");
    setError(null);
    void runFetch();
  }, [runFetch]);

  const rollback = useCallback(async () => {
    try {
      const data = await fetchTasks();
      if (mounted.current) {
        setTasks(data);
        setStatus("ready");
      }
    } catch {
      // The optimistic UI stays in place; the error toast communicates the issue.
    }
  }, []);

  const createTask = useCallback(
    async (input: TaskInput): Promise<boolean> => {
      const optimistic: Task = {
        id: crypto.randomUUID(),
        title: input.title,
        status: input.status,
        priority: input.priority,
        due_date: input.due_date,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: null,
      };

      setTasks((current) => [...current, optimistic]);

      try {
        const task = await createTaskAction(input);
        if (mounted.current) {
          setTasks((current) =>
            current.map((existing) =>
              existing.id === optimistic.id ? task : existing
            )
          );
        }
        return true;
      } catch {
        await rollback();
        toast.error("Failed to create task. Connection lost.");
        return false;
      }
    },
    [rollback]
  );

  const updateTask = useCallback(
    async (id: string, input: TaskInput): Promise<boolean> => {
      setTasks((current) =>
        current.map((existing) =>
          existing.id === id
            ? {
                ...existing,
                title: input.title,
                status: input.status,
                priority: input.priority,
                due_date: input.due_date,
                updated_at: new Date().toISOString(),
              }
            : existing
        )
      );

      try {
        const task = await updateTaskAction(id, input);
        if (mounted.current) {
          setTasks((current) =>
            current.map((existing) => (existing.id === id ? task : existing))
          );
        }
        return true;
      } catch {
        await rollback();
        toast.error("Failed to update task. Connection lost.");
        return false;
      }
    },
    [rollback]
  );

  const softDeleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      setTasks((current) =>
        current.map((existing) =>
          existing.id === id ? { ...existing, is_deleted: true } : existing
        )
      );

      try {
        await softDeleteTaskAction(id);
        return true;
      } catch {
        await rollback();
        toast.error("Failed to delete task. Connection lost.");
        return false;
      }
    },
    [rollback]
  );

  const restoreTask = useCallback(
    async (id: string): Promise<boolean> => {
      setTasks((current) =>
        current.map((existing) =>
          existing.id === id ? { ...existing, is_deleted: false } : existing
        )
      );

      try {
        await restoreTaskAction(id);
        return true;
      } catch {
        await rollback();
        toast.error("Failed to restore task. Connection lost.");
        return false;
      }
    },
    [rollback]
  );

  const permanentlyDeleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      setTasks((current) => current.filter((task) => task.id !== id));

      try {
        await permanentlyDeleteTaskAction(id);
        return true;
      } catch {
        await rollback();
        toast.error("Failed to delete task. Connection lost.");
        return false;
      }
    },
    [rollback]
  );

  return {
    tasks,
    status,
    error,
    retry,
    createTask,
    updateTask,
    softDeleteTask,
    restoreTask,
    permanentlyDeleteTask,
  };
}