"use client";

import { useTranslations } from "next-intl";
import { formatDateShort } from "@/lib/utils";

interface CalendarWidgetProps {
  events: Array<{
    id: string;
    title: string;
    startAt: string;
    endAt?: string | null;
    allDay: boolean;
    property?: { name: string } | null;
  }>;
}

export function CalendarWidget({ events }: CalendarWidgetProps) {
  const t = useTranslations("calendar");

  if (events.length === 0) {
    return (
      <p className="text-center text-sm italic text-slate-400">
        {t("noEvents")}
      </p>
    );
  }

  const displayed = events.slice(0, 5);

  return (
    <div className="space-y-2.5">
      {displayed.map((event) => (
        <div
          key={event.id}
          className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2"
        >
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">
              {event.title}
            </p>
            <p className="text-xs text-slate-400">
              {formatDateShort(event.startAt)}
              {event.property && (
                <span className="ml-1.5 text-slate-300">
                  {event.property.name}
                </span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
