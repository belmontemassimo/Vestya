"use client";

import { CalendarWidget } from "./calendar-widget";

interface PropertyCalendarWidgetProps {
  events: Array<{
    id: string;
    title: string;
    startAt: string;
    endAt?: string | null;
    allDay: boolean;
  }>;
  gridW: number;
  gridH: number;
  propertyId?: string;
}

export function PropertyCalendarWidget({ events, gridW, gridH, propertyId }: PropertyCalendarWidgetProps) {
  return <CalendarWidget events={events} gridW={gridW} gridH={gridH} propertyId={propertyId} />;
}
