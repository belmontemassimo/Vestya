"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

// Cast dynamic import to avoid type errors from FullCalendar's complex generics
const FullCalendar = dynamic(
  () => import("@fullcalendar/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[600px] w-full" />,
  }
) as React.ComponentType<Record<string, unknown>>;

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
}

interface CalendarViewProps {
  events: readonly CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (eventId: string) => void;
}

export function CalendarView({
  events,
  onDateClick,
  onEventClick,
}: CalendarViewProps) {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const plugins = useMemo(
    () => [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    []
  );
  const handleDateClick = useCallback(
    (info: { date: Date }) => {
      onDateClick?.(info.date);
    },
    [onDateClick]
  );

  const handleEventClick = useCallback(
    (info: { event: { id: string } }) => {
      onEventClick?.(info.event.id);
    },
    [onEventClick]
  );

  return (
    <Card>
      <CardContent className="p-4">
        <FullCalendar
          plugins={plugins}
          initialView="dayGridMonth"
          locale={locale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,listWeek",
          }}
          buttonText={{
            today: t("today"),
            month: t("month"),
            week: t("week"),
            list: t("list"),
          }}
          events={events as CalendarEvent[]}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          editable={false}
          selectable
          dayMaxEvents
          height="auto"
          aspectRatio={1.8}
        />
      </CardContent>
    </Card>
  );
}
