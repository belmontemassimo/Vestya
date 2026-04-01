"use client";

import { useTranslations } from "next-intl";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { formatDateShort } from "@/lib/utils";

interface TasksWidgetProps {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueAt: string | null;
    property?: { name: string } | null;
  }>;
}

export function TasksWidget({ tasks }: TasksWidgetProps) {
  const t = useTranslations("tasks");

  if (tasks.length === 0) {
    return (
      <p className="text-center text-sm italic text-slate-400">
        {t("noTasks")}
      </p>
    );
  }

  const displayed = tasks.slice(0, 5);

  return (
    <div className="space-y-2.5">
      {displayed.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">
              {task.title}
            </p>
            {task.dueAt && (
              <p className="text-xs text-slate-400">
                {formatDateShort(task.dueAt)}
              </p>
            )}
          </div>
          <TaskPriorityBadge priority={task.priority} />
          <TaskStatusBadge status={task.status} />
        </div>
      ))}
    </div>
  );
}
