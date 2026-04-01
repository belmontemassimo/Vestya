"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatRelativeDate } from "@/lib/utils";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  propertyName?: string;
  property?: { id: string; name: string } | null;
  dueAt: Date | string | null;
}

interface RecentTasksProps {
  tasks: readonly Task[];
}

export function RecentTasks({ tasks }: RecentTasksProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("recentTasks")}</CardTitle>
        <Link
          href="/tasks"
          className="text-sm text-blue-600 hover:underline"
        >
          {t("viewAll")}
        </Link>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            {t("noRecentTasks")}
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {task.propertyName ?? task.property?.name}
                    {task.dueAt && (
                      <span className="ml-2">
                        {formatRelativeDate(
                          typeof task.dueAt === "string"
                            ? task.dueAt
                            : task.dueAt.toISOString(),
                          locale
                        )}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <TaskPriorityBadge priority={task.priority} />
                  <TaskStatusBadge status={task.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
