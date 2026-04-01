"use client";

import { useTranslations, useLocale } from "next-intl";
import { Calendar, Tag, User, Home } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

interface Property {
  id: string;
  name: string;
}

interface Member {
  id: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface TaskDetailProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    category: string;
    dueAt: Date | null;
    estimatedCost: unknown;
    actualCost: unknown;
    property: { id: string; name: string } | null;
    assignee: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    } | null;
    contactAssignee: { id: string; name: string } | null;
    creator: { id: string; name: string | null; image: string | null };
    createdAt: Date;
    updatedAt: Date;
  };
  properties: readonly Property[];
  members: readonly Member[];
}

export function TaskDetail({ task }: TaskDetailProps) {
  const t = useTranslations("tasks");
  const locale = useLocale();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <CardTitle>{task.title}</CardTitle>
        <div className="flex items-center gap-2 shrink-0">
          <TaskPriorityBadge priority={task.priority} />
          <TaskStatusBadge status={task.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {task.description && (
          <p className="text-sm text-slate-700 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {task.property && (
            <div className="flex items-start gap-2">
              <Home className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">{t("property")}</p>
                <Link
                  href={`/properties/${task.property.id}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {task.property.name}
                </Link>
              </div>
            </div>
          )}

          {task.dueAt && (
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">{t("dueDate")}</p>
                <p className="font-medium text-slate-900">
                  {formatDate(task.dueAt.toISOString(), locale)}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <Tag className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">{t("categoryLabel")}</p>
              <Badge variant="outline">{t(`category.${task.category}`)}</Badge>
            </div>
          </div>

          {(task.assignee || task.contactAssignee) && (
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">{t("assignee")}</p>
                {task.assignee ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={task.assignee.image ?? undefined}
                        alt={task.assignee.name ?? ""}
                      />
                      <AvatarFallback className="text-[9px]">
                        {getInitials(task.assignee.name ?? task.assignee.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-slate-900">
                      {task.assignee.name ?? task.assignee.email}
                    </span>
                  </div>
                ) : (
                  <span className="font-medium text-slate-900">
                    {task.contactAssignee?.name}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {(task.estimatedCost != null || task.actualCost != null) && (
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-3 text-sm">
            {task.estimatedCost != null && (
              <div>
                <p className="text-xs text-slate-400">{t("estimatedCost")}</p>
                <p className="font-medium text-slate-900">
                  {Number(task.estimatedCost).toLocaleString()}
                </p>
              </div>
            )}
            {task.actualCost != null && (
              <div>
                <p className="text-xs text-slate-400">{t("actualCost")}</p>
                <p className="font-medium text-slate-900">
                  {Number(task.actualCost).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
