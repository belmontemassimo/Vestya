"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight, Plus, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormDialog } from "@/components/shared/form-dialog";
import { EventForm } from "@/components/calendar/event-form";
import { createEvent } from "@/actions/event.actions";

interface CalendarEvent {
  id: string;
  title: string;
  startAt: string;
  endAt?: string | null;
  allDay: boolean;
  property?: { name: string } | null;
}

interface SelectOption {
  value: string;
  label: string;
}

interface CalendarWidgetProps {
  events: CalendarEvent[];
  gridW?: number;
  gridH?: number;
  propertyId?: string;
  properties?: readonly SelectOption[];
  contacts?: readonly SelectOption[];
  initialView?: CalendarViewType;
  isEditing?: boolean;
  onChangeView?: (view: CalendarViewType) => void;
}

const EVENT_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function getEventColor(index: number): string {
  return EVENT_COLORS[index % EVENT_COLORS.length];
}

export type CalendarViewType = "month" | "week" | "day";
const VIEW_OPTIONS: CalendarViewType[] = ["month", "week", "day"];

export function CalendarWidget({
  events,
  propertyId,
  properties = [],
  contacts = [],
  initialView = "month",
  isEditing = false,
  onChangeView,
}: CalendarWidgetProps) {
  const t = useTranslations("calendar");
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useState<CalendarViewType>(initialView);
  const [refDate, setRefDate] = useState(() => new Date());

  function navigatePrev() {
    setRefDate((prev) => {
      const d = new Date(prev);
      if (view === "month") d.setMonth(d.getMonth() - 1);
      else if (view === "week") d.setDate(d.getDate() - 7);
      else d.setDate(d.getDate() - 1);
      return d;
    });
  }

  function navigateNext() {
    setRefDate((prev) => {
      const d = new Date(prev);
      if (view === "month") d.setMonth(d.getMonth() + 1);
      else if (view === "week") d.setDate(d.getDate() + 7);
      else d.setDate(d.getDate() + 1);
      return d;
    });
  }

  function getHeaderLabel(): string {
    if (view === "month") {
      return refDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    if (view === "week") {
      const monday = getMonday(refDate);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${fmt(monday)} – ${fmt(sunday)}`;
    }
    return refDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  async function handleCreate(values: Record<string, unknown>) {
    const payload = {
      ...values,
      startAt: values.startAt,
      linkedContactId: values.contactId || undefined,
    };
    delete (payload as Record<string, unknown>).contactId;
    if (propertyId) {
      (payload as Record<string, unknown>).propertyId = propertyId;
    }
    const result = await createEvent(payload);
    if (result.success) {
      setDialogOpen(false);
      router.refresh();
    }
    return result;
  }

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header: arrows + period label + add button */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
              className="rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[5rem] text-center text-[11px] font-semibold text-slate-700">
              {getHeaderLabel()}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigateNext(); }}
              className="rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDialogOpen(true); }}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Plus className="h-3 w-3" />
            {t("addEvent")}
          </button>
        </div>

        <div className="min-h-0 flex-1">
          {view === "day" ? (
            <DayView events={events} refDate={refDate} />
          ) : view === "week" ? (
            <WeekView events={events} refDate={refDate} />
          ) : (
            <MonthView events={events} refDate={refDate} />
          )}
        </div>

        {/* Edit mode: view type selector */}
        {isEditing && onChangeView && (
          <div className="absolute bottom-2 left-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-md bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {VIEW_OPTIONS.map((v) => (
                  <DropdownMenuItem
                    key={v}
                    onClick={(e) => {
                      e.stopPropagation();
                      setView(v);
                      onChangeView(v);
                    }}
                    className={cn(view === v && "font-semibold")}
                  >
                    {t(v)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={t("addEvent")}>
        <EventForm
          properties={propertyId ? [] : [...properties]}
          contacts={[...contacts]}
          showPropertyField={!propertyId}
          onSubmit={handleCreate}
          defaultValues={propertyId ? { propertyId } : undefined}
        />
      </FormDialog>
    </>
  );
}

// ────────────────────────────────────────────
// DAY VIEW — single column, hours 00–23
// ────────────────────────────────────────────

function DayView({ events, refDate }: { events: CalendarEvent[]; refDate: Date }) {
  const now = new Date();

  const dayEvents = useMemo(() => {
    const s = startOfDay(refDate);
    const e = endOfDay(refDate);
    return events.filter((ev) => {
      const evStart = new Date(ev.startAt);
      const evEnd = ev.endAt ? new Date(ev.endAt) : evStart;
      return evStart <= e && evEnd >= s;
    });
  }, [events, refDate]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour} className="flex h-6 items-start">
            <span className="w-8 shrink-0 text-[10px] text-slate-300">
              {String(hour).padStart(2, "0")}
            </span>
            <div className="flex-1 border-t border-slate-100" />
          </div>
        ))}
        {dayEvents.map((event, i) => {
          const d = new Date(event.startAt);
          const top = (d.getHours() + d.getMinutes() / 60) * 24;
          return (
            <div
              key={event.id}
              className={cn(
                "absolute left-8 right-1 truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                getEventColor(i),
              )}
              style={{ top: `${top}px` }}
            >
              {event.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// WEEK VIEW — Mon–Sun columns, hours on y
// ────────────────────────────────────────────

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WeekView({ events, refDate }: { events: CalendarEvent[]; refDate: Date }) {
  const now = new Date();
  const monday = getMonday(refDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weekEvents = useMemo(() => {
    const s = startOfDay(weekDays[0]);
    const e = endOfDay(weekDays[6]);
    return events.filter((ev) => {
      const evStart = new Date(ev.startAt);
      const evEnd = ev.endAt ? new Date(ev.endAt) : evStart;
      return evStart <= e && evEnd >= s;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, refDate]);

  const hours = [0, 3, 6, 9, 12, 15, 18, 21];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex border-b border-slate-100 pb-1">
        <div className="w-6 shrink-0" />
        {weekDays.map((d, i) => {
          const today = isSameDay(d, now);
          return (
            <div key={i} className="flex-1 text-center">
              <div className="text-[9px] text-slate-400">{DAYS_SHORT[i]}</div>
              <div
                className={cn(
                  "mx-auto mt-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium",
                  today ? "bg-slate-800 text-white" : "text-slate-600",
                )}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      {/* Grid */}
      <div className="relative flex-1 overflow-hidden pt-0.5">
        {hours.map((h) => (
          <div key={h} className="flex" style={{ height: `${100 / hours.length}%` }}>
            <span className="w-6 shrink-0 text-[8px] text-slate-300">
              {String(h).padStart(2, "0")}
            </span>
            <div className="flex-1 border-t border-slate-50" />
          </div>
        ))}
        {weekEvents.map((event, i) => {
          const d = new Date(event.startAt);
          const col = dayOfWeekMon(d);
          return (
            <div
              key={event.id}
              className={cn(
                "absolute truncate rounded-md px-1 py-0.5 text-[8px] font-medium leading-tight",
                getEventColor(i),
              )}
              style={{
                left: `calc(24px + ${col * (100 / 7)}%)`,
                width: `calc(${100 / 7}% - 2px)`,
                top: `${((d.getHours() + d.getMinutes() / 60) / 24) * 100}%`,
              }}
            >
              {event.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// MONTH VIEW — 7 cols, weeks going down
// ────────────────────────────────────────────

const DAYS_LETTER = ["M", "T", "W", "T", "F", "S", "S"];

function MonthView({ events, refDate }: { events: CalendarEvent[]; refDate: Date }) {
  const now = new Date();
  const year = refDate.getFullYear();
  const month = refDate.getMonth();

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

  const eventsByDate = useMemo(() => expandEventsByDate(events), [events]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-1 grid grid-cols-7">
        {DAYS_LETTER.map((n, i) => (
          <div key={i} className="text-center text-[9px] font-medium text-slate-400">
            {n}
          </div>
        ))}
      </div>
      {/* Weeks */}
      <div className="grid flex-1 auto-rows-fr">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-t border-slate-50">
            {week.map((day, di) => {
              const inMonth = day.getMonth() === month;
              const today = isSameDay(day, now);
              const dayEvts = eventsByDate.get(dKey(day)) ?? [];
              return (
                <div
                  key={di}
                  className={cn(
                    "overflow-hidden px-0.5 py-0.5",
                    !inMonth && "opacity-25",
                  )}
                >
                  <div
                    className={cn(
                      "mx-auto mb-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px]",
                      today ? "bg-slate-800 font-bold text-white" : "text-slate-600",
                    )}
                  >
                    {day.getDate()}
                  </div>
                  {dayEvts.slice(0, 2).map((ev, i) => (
                    <div
                      key={ev.id}
                      className={cn(
                        "mb-0.5 truncate rounded-md px-1 text-[8px] font-medium leading-tight",
                        getEventColor(i),
                      )}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvts.length > 2 && (
                    <div className="text-center text-[8px] text-slate-400">
                      +{dayEvts.length - 2}
                    </div>
                  )}
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

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMonday(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay();
  r.setDate(r.getDate() - (day === 0 ? 6 : day - 1));
  r.setHours(0, 0, 0, 0);
  return r;
}

function dayOfWeekMon(d: Date): number {
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
}

function dKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDateHeader(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function expandEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const start = startOfDay(new Date(ev.startAt));
    const end = ev.endAt ? startOfDay(new Date(ev.endAt)) : start;
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
}
