"use client";

import { Bell } from "lucide-react";
import { useLocale } from "next-intl";
import { formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PropertyRemindersWidgetProps {
  reminders: Array<{
    id: string;
    entityType: string;
    remindAt: string;
    status: string;
  }>;
}

export function PropertyRemindersWidget({
  reminders,
}: PropertyRemindersWidgetProps) {
  const locale = useLocale();
  const visible = reminders.slice(0, 5);

  if (visible.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
        <Bell className="h-8 w-8" />
        <p className="text-sm">No reminders</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((reminder) => (
        <div
          key={reminder.id}
          className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
            <Bell className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {reminder.entityType}
            </p>
            <p className="text-xs text-slate-400">
              {formatRelativeDate(reminder.remindAt, locale)}
            </p>
          </div>
          <Badge
            variant={reminder.status === "PENDING" ? "warning" : "secondary"}
            className="shrink-0"
          >
            {reminder.status}
          </Badge>
        </div>
      ))}
      {reminders.length > 5 && (
        <p className="text-center text-xs text-slate-400">
          +{reminders.length - 5} more
        </p>
      )}
    </div>
  );
}
