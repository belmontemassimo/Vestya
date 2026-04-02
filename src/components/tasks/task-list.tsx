"use client";

import { useTranslations } from "next-intl";
import { CheckSquare } from "lucide-react";
import { TaskCard } from "@/components/tasks/task-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  propertyName?: string;
  property?: { id: string; name: string } | null;
  dueAt: Date | string | null;
  assigneeName?: string | null;
  assigneeImage?: string | null;
  assignee?: { id: string; name: string | null; image: string | null } | null;
}

interface CurrentFilters {
  status?: string;
  priority?: string;
}

interface TaskListProps {
  tasks: readonly Task[];
  currentFilters?: CurrentFilters;
  onStatusChange?: (value: string) => void;
  onPriorityChange?: (value: string) => void;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const STATUSES = ["TODO", "IN_PROGRESS", "WAITING", "DONE", "CANCELLED"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export function TaskList({
  tasks,
  currentFilters,
  onStatusChange,
  onPriorityChange,
  onAdd,
  onEdit,
  onDelete,
}: TaskListProps) {
  const statusFilter = currentFilters?.status ?? "all";
  const priorityFilter = currentFilters?.priority ?? "all";
  const t = useTranslations("tasks");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t("filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t("filterByPriority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allPriorities")}</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {t(`priority.${p}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={
            onAdd ? (
              <Button onClick={onAdd}>{t("addTask")}</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              priority={task.priority}
              status={task.status}
              propertyName={task.propertyName ?? task.property?.name ?? ""}
              dueAt={
                task.dueAt
                  ? typeof task.dueAt === "string"
                    ? task.dueAt
                    : task.dueAt.toISOString()
                  : null
              }
              assigneeName={task.assigneeName ?? task.assignee?.name ?? null}
              assigneeImage={task.assigneeImage ?? task.assignee?.image ?? null}
              onEdit={onEdit ? () => onEdit(task.id) : undefined}
              onDelete={onDelete ? () => onDelete(task.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
