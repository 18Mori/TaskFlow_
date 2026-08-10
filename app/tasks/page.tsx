import type { Metadata } from "next";
import { TaskBoard } from "@/components/features/tasks/task-board";

export const metadata: Metadata = {
  title: "Tasks · Taskflow",
};

export default function TasksPage() {
  return <TaskBoard />;
}
