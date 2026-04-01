"use client";

import { CheckSquare } from "lucide-react";
import { useLocale } from "next-intl";
import { formatRelativeDate } from "@/lib/utils";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";

interface PropertyTasksWidgetProps {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueAt: string | null;
  }>;
}

export function PropertyTasksWidget({ tasks }: PropertyTasksWidgetProps) {
  const locale = useLocale();
  const visible = tasks.slice(0, 5);

  if (visible.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
        <CheckSquare className="h-8 w-8" />
        <p className="text-sm">No tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {task.title}
            </p>
            {task.dueAt && (
              <p className="text-xs text-slate-400 mt-0.5">
                {formatRelativeDate(task.dueAt, locale)}
              </p>
            )}
          </div>
          <div className="ml-2 flex items-center gap-1.5 shrink-0">
            <TaskPriorityBadge priority={task.priority} />
            <TaskStatusBadge status={task.status} />
          </div>
        </div>
      ))}
      {tasks.length > 5 && (
        <p className="text-center text-xs text-slate-400">
          +{tasks.length - 5} more
        </p>
      )}
    </div>
  );
}
