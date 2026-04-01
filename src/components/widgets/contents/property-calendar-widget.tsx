"use client";

import { Calendar } from "lucide-react";
import { useLocale } from "next-intl";
import { formatDateShort } from "@/lib/utils";

interface PropertyCalendarWidgetProps {
  events: Array<{
    id: string;
    title: string;
    startAt: string;
    endAt?: string | null;
    allDay: boolean;
  }>;
}

export function PropertyCalendarWidget({
  events,
}: PropertyCalendarWidgetProps) {
  const locale = useLocale();
  const visible = events.slice(0, 5);

  if (visible.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
        <Calendar className="h-8 w-8" />
        <p className="text-sm">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((event) => (
        <div
          key={event.id}
          className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {event.title}
            </p>
            <p className="text-xs text-slate-400">
              {formatDateShort(event.startAt, locale)}
              {event.allDay && " (all day)"}
            </p>
          </div>
        </div>
      ))}
      {events.length > 5 && (
        <p className="text-center text-xs text-slate-400">
          +{events.length - 5} more
        </p>
      )}
    </div>
  );
}
