"use client";

import { CalendarWidget } from "./calendar-widget";

interface SelectOption {
  value: string;
  label: string;
}

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
  properties?: readonly SelectOption[];
  contacts?: readonly SelectOption[];
}

export function PropertyCalendarWidget({ events, gridW, gridH, propertyId, properties, contacts }: PropertyCalendarWidgetProps) {
  return <CalendarWidget events={events} gridW={gridW} gridH={gridH} propertyId={propertyId} properties={properties} contacts={contacts} />;
}
