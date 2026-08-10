"use client";

import { AlertTriangle } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import type { Task } from "@/lib/types";

export interface TaskDeleteDialogProps {
  task: Task | null;
  onClose: () => void;
  onConfirm: (task: Task) => void;
}

export function TaskDeleteDialog({
  task,
  onClose,
  onConfirm,
}: TaskDeleteDialogProps) {
  return (
    <ConfirmationDialog
      open={task !== null}
      onClose={onClose}
      tone="danger"
      icon={<AlertTriangle aria-hidden="true" className="size-5" />}
      title="Delete permanently?"
      description={
        <>
          <strong className="font-medium text-zinc-200">{task?.title}</strong>{" "}
          will be permanently removed from the workspace. This action cannot be
          undone.
        </>
      }
      confirmLabel="Delete permanently"
      cancelLabel="Cancel"
      onConfirm={() => {
        if (task) {
          onConfirm(task);
        }
      }}
    />
  );
}
