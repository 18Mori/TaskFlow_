"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { SlideOver } from "@/components/ui/slide-over";
import { Button } from "@/components/ui/button";
import type { TaskInput, TaskPriority, TaskStatus } from "@/lib/types";
import { TASK_PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/lib/types";

export interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: TaskInput) => void;
}

interface TaskFormErrors {
  title?: string;
  dueDate?: string;
}

const inputClasses =
  "h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600";

const invalidInputClasses =
  "h-9 w-full rounded-md border border-rose-500/50 bg-zinc-900 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500";

const fieldLabelClasses = "mb-1.5 block text-xs font-medium text-zinc-400";

function autosize(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

function validate(title: string, dueDate: string): TaskFormErrors {
  const errors: TaskFormErrors = {};
  if (title.trim().length === 0) {
    errors.title = "Title is required.";
  }
  if (dueDate.length === 0) {
    errors.dueDate = "Due date is required.";
  }
  return errors;
}

export function TaskForm({ open, onClose, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("backlog");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<TaskFormErrors>({});

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(title, dueDate);
    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.dueDate) {
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim().length > 0 ? description.trim() : null,
      status,
      priority,
      due_date: new Date(`${dueDate}T00:00:00Z`).toISOString(),
    });
  };

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="New task"
      description="Add a task to the workspace."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" form="task-form">
            Create task
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        <label className="block">
          <span className={fieldLabelClasses}>Title</span>
          <input
            type="text"
            data-autofocus
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (errors.title) {
                setErrors((current) => ({ ...current, title: undefined }));
              }
            }}
            placeholder="Task title"
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? "task-form-title-error" : undefined}
            className={errors.title ? invalidInputClasses : inputClasses}
          />
          {errors.title && (
            <p
              id="task-form-title-error"
              role="alert"
              className="mt-1.5 text-xs text-rose-400"
            >
              {errors.title}
            </p>
          )}
        </label>

        <label className="block">
          <span className={fieldLabelClasses}>
            Description
            <span className="ml-1 font-normal text-zinc-600">(optional)</span>
          </span>
          <textarea
            rows={3}
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
            onChange={(event) => {
              setDueDate(event.target.value);
              if (errors.dueDate) {
                setErrors((current) => ({ ...current, dueDate: undefined }));
              }
            }}
            aria-invalid={errors.dueDate ? true : undefined}
            aria-describedby={errors.dueDate ? "task-form-due-error" : undefined}
            className={`${
              errors.dueDate ? invalidInputClasses : inputClasses
            } [color-scheme:dark]`}
          />
          {errors.dueDate && (
            <p
              id="task-form-due-error"
              role="alert"
              className="mt-1.5 text-xs text-rose-400"
            >
              {errors.dueDate}
            </p>
          )}
        </label>
      </form>
    </SlideOver>
  );
}
