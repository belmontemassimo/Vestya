"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RemindersWidgetProps {
  reminders: Array<{
    id: string;
    entityType: string;
    entityId: string;
    remindAt: string;
    status: string;
  }>;
}

export function RemindersWidget({ reminders }: RemindersWidgetProps) {
  const t = useTranslations("dashboard");

  if (reminders.length === 0) {
    return (
      <p className="text-center text-sm italic text-slate-400">
        {t("noEvents")}
      </p>
    );
  }

  const displayed = reminders.slice(0, 5);

  return (
    <div className="space-y-2.5">
      {displayed.map((reminder) => (
        <div
          key={reminder.id}
          className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2"
        >
          <Bell className="h-4 w-4 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1">
            <Badge variant="outline" className="text-[10px]">
              {reminder.entityType}
            </Badge>
            <p className="mt-0.5 text-xs text-slate-400">
              {formatRelativeDate(reminder.remindAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
