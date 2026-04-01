"use client";

import { useTranslations, useLocale } from "next-intl";
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
  const t = useTranslations("notifications");
  const locale = useLocale();

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 text-sm font-bold text-slate-800">{t("title")}</h3>
      {reminders.length === 0 ? (
        <p className="text-xs italic text-slate-400">{t("noNotifications")}</p>
      ) : (
        <div className="space-y-1.5 overflow-y-auto">
          {reminders.slice(0, 8).map((reminder) => (
            <div key={reminder.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-700">{reminder.entityType}</p>
                <p className="text-[10px] text-slate-400">{formatRelativeDate(reminder.remindAt, locale)}</p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[9px]">{reminder.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
