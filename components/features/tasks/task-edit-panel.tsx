"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { SlideOver } from "@/components/ui/slide-over";
import { Button } from "@/components/ui/button";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "@/lib/types";
import { TASK_PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/lib/types";

export interface TaskEditPanelProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (input: TaskInput) => void;
}

const inputClasses =
  "h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 sm:h-9";

const fieldLabelClasses = "mb-1.5 block text-xs font-medium text-zinc-400";

function toDateInputValue(timestamp: string | null): string {
  if (!timestamp) {
    return "";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function autosize(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

export function TaskEditPanel({
  open,
  task,
  onClose,
  onSave,
}: TaskEditPanelProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "backlog");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "medium"
  );
  const [dueDate, setDueDate] = useState(
    task?.due_date ? toDateInputValue(task.due_date) : ""
  );

  if (!open || !task) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      title: title.trim(),
      description: description.trim().length > 0 ? description.trim() : null,
      status,
      priority,
      due_date: dueDate
        ? new Date(`${dueDate}T00:00:00Z`).toISOString()
        : null,
    });
  };

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="Edit task"
      description="Update the details for this task."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" form="task-edit-form">
            Save changes
          </Button>
        </>
      }
    >
      <form
        id="task-edit-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <label className="block">
          <span className={fieldLabelClasses}>Title</span>
          <input
            type="text"
            required
            data-autofocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
            className={inputClasses}
          />
        </label>

        <label className="block">
          <span className={fieldLabelClasses}>
            Description
            <span className="ml-1 font-normal text-zinc-600">(optional)</span>
          </span>
          <textarea
            rows={4}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              autosize(event.currentTarget);
            }}
            onInput={(event) => autosize(event.currentTarget)}
            placeholder="Add notes, context, or markdown…"
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm leading-6 text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className={fieldLabelClasses}>Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
              className={inputClasses}
            >
              {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((key) => (
                <option key={key} value={key}>
                  {TASK_STATUS_LABEL[key]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={fieldLabelClasses}>Priority</span>
            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TaskPriority)
              }
              className={inputClasses}
            >
              {(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {TASK_PRIORITY_LABEL[key]}
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        <label className="block">
          <span className={fieldLabelClasses}>Due date</span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className={`${inputClasses} [color-scheme:dark]`}
          />
        </label>
      </form>
    </SlideOver>
  );
}
