"use client";

import { useSyncExternalStore } from "react";
import { initialTasks } from "@/lib/mock-data";
import type { Task } from "@/lib/types";

const STORAGE_KEY = "taskflow.tasks.v1";

type TaskUpdater = (current: Task[]) => Task[];

let tasks: Task[] = initialTasks;
let hydrated = false;
const listeners = new Set<() => void>();

function readFromStorage(): Task[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed as Task[];
  } catch {
    return null;
  }
}

function writeToStorage(next: Task[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode, quota exceeded) — ignore silently.
  }
}

/** Lazily hydrates from localStorage exactly once, on the client. */
function hydrateIfNeeded(): Task[] {
  if (!hydrated && typeof window !== "undefined") {
    const stored = readFromStorage();
    if (stored) {
      tasks = stored;
    }
    hydrated = true;
  }
  return tasks;
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeTasks(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getTasks(): Task[] {
  return hydrateIfNeeded();
}

/** Snapshot used during SSR / hydration to match the server render. */
export function getServerTasks(): Task[] {
  return initialTasks;
}

export function useTasks(): Task[] {
  return useSyncExternalStore(subscribeTasks, getTasks, getServerTasks);
}

function update(updater: TaskUpdater) {
  const next = updater(hydrateIfNeeded());
  tasks = next;
  writeToStorage(next);
  emit();
}

export const taskStore = {
  add(task: Task) {
    update((current) => [...current, task]);
  },
  updateTask(task: Task) {
    update((current) =>
      current.map((existing) => (existing.id === task.id ? task : existing))
    );
  },
  moveToTrash(taskId: string) {
    update((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, isDeleted: true } : task
      )
    );
  },
  restore(taskId: string) {
    update((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, isDeleted: false } : task
      )
    );
  },
  removePermanently(taskId: string) {
    update((current) => current.filter((task) => task.id !== taskId));
  },
};
