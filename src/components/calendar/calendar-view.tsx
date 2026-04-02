"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
}

interface CalendarViewProps {
  events: readonly CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (eventId: string) => void;
}

const EVENT_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

const DAYS_HEADER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({
  events,
  onDateClick,
  onEventClick,
}: CalendarViewProps) {
  const t = useTranslations("calendar");
  const [today] = useState(() => new Date());
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = useCallback(() => {
    setViewDate(new Date(year, month - 1, 1));
  }, [year, month]);

  const nextMonth = useCallback(() => {
    setViewDate(new Date(year, month + 1, 1));
  }, [year, month]);

  const goToday = useCallback(() => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }, [today]);

  const weeks = useMemo(() => buildWeeks(year, month), [year, month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const start = startOfDay(new Date(ev.start));
      const end = ev.end ? startOfDay(new Date(ev.end)) : start;
      const cur = new Date(start);
      while (cur <= end) {
        const k = dKey(cur);
        const arr = map.get(k) ?? [];
        arr.push(ev);
        map.set(k, arr);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [events]);

  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-xl bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="ml-2 text-base font-semibold text-slate-800 capitalize">
            {monthLabel}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>
          {t("today")}
        </Button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {DAYS_HEADER.map((name) => (
          <div
            key={name}
            className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-slate-400"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="grid auto-rows-fr">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-slate-50 last:border-b-0">
            {week.map((day, di) => {
              const inMonth = day.getMonth() === month;
              const isToday = isSameDay(day, today);
              const dayEvents = eventsByDate.get(dKey(day)) ?? [];

              return (
                <div
                  key={di}
                  className={cn(
                    "min-h-[90px] border-r border-slate-50 px-2 py-1.5 last:border-r-0",
                    !inMonth && "bg-slate-50/40",
                    onDateClick && "cursor-pointer hover:bg-slate-50",
                  )}
                  onClick={() => onDateClick?.(day)}
                >
                  {/* Date number */}
                  <div className="mb-1">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                        isToday
                          ? "bg-slate-800 font-bold text-white"
                          : inMonth
                            ? "text-slate-700"
                            : "text-slate-300",
                      )}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <button
                        key={ev.id}
                        type="button"
                        className={cn(
                          "block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight",
                          EVENT_COLORS[i % EVENT_COLORS.length],
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(ev.id);
                        }}
                      >
                        {ev.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="px-1.5 text-[10px] text-slate-400">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

function buildWeeks(year: number, month: number): Date[][] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const startOffset = dayOfWeekMon(firstOfMonth);
  const calStart = new Date(firstOfMonth);
  calStart.setDate(calStart.getDate() - startOffset);

  const weeks: Date[][] = [];
  const cur = new Date(calStart);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
    if (cur > lastOfMonth && cur.getMonth() !== month) break;
  }
  return weeks;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayOfWeekMon(d: Date): number {
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
}

function dKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
