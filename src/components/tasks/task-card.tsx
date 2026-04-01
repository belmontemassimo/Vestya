"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Calendar } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { getInitials } from "@/lib/utils";

interface TaskCardProps {
  id: string;
  title: string;
  priority: string;
  status: string;
  propertyName: string;
  dueAt: string | null;
  assigneeName: string | null;
  assigneeImage: string | null;
}

export function TaskCard({
  id,
  title,
  priority,
  status,
  propertyName,
  dueAt,
  assigneeName,
  assigneeImage,
}: TaskCardProps) {
  const locale = useLocale();

  return (
    <Link href={`/tasks/${id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer h-full">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
          <CardTitle className="text-base truncate">{title}</CardTitle>
          <TaskPriorityBadge priority={priority} />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{propertyName}</span>
            <TaskStatusBadge status={status} />
          </div>
          <div className="flex items-center justify-between">
            {dueAt && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDateShort(dueAt, locale)}</span>
              </div>
            )}
            {assigneeName && (
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={assigneeImage ?? undefined}
                  alt={assigneeName}
                />
                <AvatarFallback className="text-[10px]">
                  {getInitials(assigneeName)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
