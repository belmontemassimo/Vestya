"use client";

import { CalendarWidget, type CalendarViewType } from "./calendar-widget";

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
  gridW?: number;
  gridH?: number;
  propertyId?: string;
  properties?: readonly SelectOption[];
  contacts?: readonly SelectOption[];
  initialView?: CalendarViewType;
  isEditing?: boolean;
  onChangeView?: (view: CalendarViewType) => void;
}

export function PropertyCalendarWidget({
  events,
  propertyId,
  properties,
  contacts,
  initialView,
  isEditing,
  onChangeView,
}: PropertyCalendarWidgetProps) {
  return (
    <CalendarWidget
      events={events}
      propertyId={propertyId}
      properties={properties}
      contacts={contacts}
      initialView={initialView}
      isEditing={isEditing}
      onChangeView={onChangeView}
    />
  );
}
