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

interface FilterOption {
  value: string;
  label: string;
}

interface CurrentFilters {
  status?: string;
  priority?: string;
  propertyId?: string;
  search?: string;
}

interface TaskListProps {
  tasks: readonly Task[];
  properties?: readonly { id: string; name: string }[];
  currentFilters?: CurrentFilters;
  statusFilter?: string;
  priorityFilter?: string;
  propertyFilter?: string;
  onStatusChange?: (value: string) => void;
  onPriorityChange?: (value: string) => void;
  onPropertyChange?: (value: string) => void;
  statusOptions?: readonly FilterOption[];
  priorityOptions?: readonly FilterOption[];
  propertyOptions?: readonly FilterOption[];
  onAdd?: () => void;
}

const STATUSES = ["TODO", "IN_PROGRESS", "WAITING", "DONE", "CANCELLED"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export function TaskList({
  tasks,
  properties = [],
  currentFilters,
  statusFilter: statusFilterProp,
  priorityFilter: priorityFilterProp,
  propertyFilter: propertyFilterProp,
  onStatusChange,
  onPriorityChange,
  onPropertyChange,
  statusOptions,
  priorityOptions,
  propertyOptions,
  onAdd,
}: TaskListProps) {
  const statusFilter = statusFilterProp ?? currentFilters?.status ?? "all";
  const priorityFilter = priorityFilterProp ?? currentFilters?.priority ?? "all";
  const propertyFilter = propertyFilterProp ?? currentFilters?.propertyId ?? "all";

  const resolvedStatusOptions = statusOptions ?? STATUSES.map((s) => ({ value: s, label: s }));
  const resolvedPriorityOptions = priorityOptions ?? PRIORITIES.map((p) => ({ value: p, label: p }));
  const resolvedPropertyOptions = propertyOptions ?? properties.map((p) => ({ value: p.id, label: p.name }));
  const t = useTranslations("tasks");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            {resolvedStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filterByPriority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allPriorities")}</SelectItem>
            {resolvedPriorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={propertyFilter} onValueChange={onPropertyChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("filterByProperty")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allProperties")}</SelectItem>
            {resolvedPropertyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
