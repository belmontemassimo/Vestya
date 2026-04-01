"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<
  string,
  "secondary" | "default" | "warning" | "success" | "destructive"
> = {
  TODO: "secondary",
  IN_PROGRESS: "default",
  WAITING: "warning",
  DONE: "success",
  CANCELLED: "destructive",
};

interface TaskStatusBadgeProps {
  status: string;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const t = useTranslations("tasks");

  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "secondary"}>
      {t(`status.${status}`)}
    </Badge>
  );
}
