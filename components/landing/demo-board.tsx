"use client";

import { useCallback, useRef } from "react";
import { MoreHorizontal, Plus } from "lucide-react";

type DemoStatus = "backlog" | "in-progress" | "completed";
type DemoPriority = "low" | "medium" | "high";

interface DemoTask {
  id: string;
  title: string;
  description: string;
  status: DemoStatus;
  priority: DemoPriority;
  due: string;
}

const DEMO_TASKS: DemoTask[] = [
  {
    id: "1",
    title: "Finalize onboarding flow copy",
    description: "Polish the welcome email and first-run checklist.",
    status: "in-progress",
    priority: "high",
    due: "Aug 12",
  },
  {
    id: "2",
    title: "Ship dark mode for settings",
    description: "Apply the zinc token set to all setting panels.",
    status: "completed",
    priority: "medium",
    due: "Aug 05",
  },
  {
    id: "3",
    title: "Fix flaky checkout integration test",
    description: "Add retry logic around the payment provider call.",
    status: "backlog",
    priority: "high",
    due: "Aug 19",
  },
  {
    id: "4",
    title: "Write Q3 roadmap engineering notes",
    description: "Draft the async doc before the planning session.",
    status: "in-progress",
    priority: "low",
    due: "Aug 26",
  },
  {
    id: "5",
    title: "Audit dependency licenses",
    description: "Prep the license review package for release.",
    status: "backlog",
    priority: "medium",
    due: "Sep 02",
  },
];

const STATUS_STYLES: Record<DemoStatus, string> = {
  backlog: "border-zinc-700/70 text-zinc-400",
  "in-progress": "border-amber-700/50 text-amber-400",
  completed: "border-emerald-700/50 text-emerald-400",
};

const PRIORITY_STYLES: Record<DemoPriority, string> = {
  low: "border-zinc-700/70 text-zinc-400",
  medium: "border-sky-700/50 text-sky-400",
  high: "border-rose-700/50 text-rose-400",
};

const STATUS_LABEL: Record<DemoStatus, string> = {
  backlog: "Backlog",
  "in-progress": "In progress",
  completed: "Completed",
};

const PRIORITY_LABEL: Record<DemoPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function DemoBoard() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const node = spotlightRef.current;
      if (!node) {
        return;
      }
      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      node.style.setProperty("--spot-x", `${x}px`);
      node.style.setProperty("--spot-y", `${y}px`);
    },
    []
  );

  return (
    <div
      onMouseMove={handleMouseMove}
      className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-2xl shadow-black/40 backdrop-blur-sm"
    >
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgba(255,255,255,0.06), transparent 65%)",
        }}
      />

      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-zinc-700" />
          <span className="size-2.5 rounded-full bg-zinc-700" />
          <span className="size-2.5 rounded-full bg-zinc-700" />
        </div>
        <div className="ml-4 flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-200">Tasks</span>
          <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-500">
            3 of 5 completed
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-zinc-500">
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="flex h-7 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 text-xs font-medium text-zinc-300 transition-colors duration-150 hover:border-zinc-700 hover:text-zinc-100"
          >
            <Plus aria-hidden="true" className="size-3.5" />
            New task
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {["Task", "Status", "Priority", "Due", ""].map((header) => (
                <th
                  key={header}
                  className="h-10 px-4 text-xs font-medium tracking-wide whitespace-nowrap text-zinc-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEMO_TASKS.map((task) => (
              <tr
                key={task.id}
                className="group/row cursor-default border-b border-zinc-800/60 transition-colors duration-150 last:border-b-0 hover:border-zinc-700/60 hover:bg-zinc-800/30"
              >
                <td className="px-4 py-3">
                  <span
                    className={`block max-w-xs truncate ${
                      task.status === "completed"
                        ? "text-zinc-500 line-through"
                        : "text-zinc-200"
                    }`}
                  >
                    {task.title}
                  </span>
                  <span className="mt-0.5 block max-w-xs truncate text-xs text-zinc-500">
                    {task.description}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[task.status]}`}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {STATUS_LABEL[task.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[task.priority]}`}
                  >
                    {PRIORITY_LABEL[task.priority]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs tabular-nums text-zinc-400">
                  {task.due}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex size-7 items-center justify-center rounded-md text-zinc-500 opacity-0 transition-all duration-150 group-hover/row:opacity-100">
                    <MoreHorizontal aria-hidden="true" className="size-4" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}