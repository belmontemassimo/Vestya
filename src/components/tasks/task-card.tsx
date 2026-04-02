"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  id: string;
  title: string;
  priority: string;
  status: string;
  propertyName: string;
  dueAt: string | null;
  assigneeName: string | null;
  assigneeImage: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
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
  onEdit,
  onDelete,
}: TaskCardProps) {
  const locale = useLocale();
  const t = useTranslations("tasks");

  return (
    <Card className="relative transition-shadow hover:shadow-md h-full">
      <Link href={`/tasks/${id}`} className="absolute inset-0 z-0" />

      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <CardTitle className="text-base truncate">{title}</CardTitle>
        <div className="flex items-center gap-1.5">
          <TaskPriorityBadge priority={priority} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("editTask")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("deleteTask")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{propertyName}</span>
          <TaskStatusBadge status={status} />
        </div>
        <div className="flex items-center justify-between">
          {dueAt ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDateShort(dueAt, locale)}</span>
            </div>
          ) : (
            <div />
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
  );
}
