"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRIORITY_CLASSES: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600 border-transparent",
  MEDIUM: "bg-blue-100 text-blue-700 border-transparent",
  HIGH: "bg-orange-100 text-orange-700 border-transparent",
  URGENT: "bg-red-100 text-red-700 border-transparent",
};

interface TaskPriorityBadgeProps {
  priority: string;
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const t = useTranslations("tasks");

  return (
    <Badge className={cn(PRIORITY_CLASSES[priority] ?? PRIORITY_CLASSES.LOW)}>
      {t(`priority.${priority}`)}
    </Badge>
  );
}
