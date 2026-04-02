"use client";

import type { WidgetInstance, DashboardData } from "@/types/dashboard";
import { WidgetContainer } from "./widget-container";
import { TasksWidget } from "./contents/tasks-widget";
import { CalendarWidget } from "./contents/calendar-widget";
import { FamilyMembersWidget } from "./contents/family-members-widget";
import { FamilyContactsWidget } from "./contents/family-contacts-widget";
import { MessagesWidget } from "./contents/messages-widget";
import { RemindersWidget } from "./contents/reminders-widget";
import { DocumentsWidget } from "./contents/documents-widget";
import { PropertyWidget } from "./contents/property-widget";
import { PropertyContactsWidget } from "./contents/property-contacts-widget";
import { PropertyTasksWidget } from "./contents/property-tasks-widget";
import { PropertyRemindersWidget } from "./contents/property-reminders-widget";
import { PropertyCalendarWidget } from "./contents/property-calendar-widget";
import { PropertyDocumentsWidget } from "./contents/property-documents-widget";
import { SpendingWidget } from "./contents/spending-widget";

interface WidgetRendererProps {
  widget: WidgetInstance;
  dashboardData: Record<string, unknown>;
  context: "family" | "property";
  propertyId?: string;
  isEditing: boolean;
  onRemove: () => void;
  onUpdateConfig?: (config: Record<string, unknown>) => void;
  gridW: number;
  gridH: number;
}

const HREF_MAP: Record<
  string,
  string | ((w: WidgetInstance, pid?: string) => string)
> = {
  tasks: "/tasks",
  calendar: "/calendar",
  "family-members": "/members",
  "family-contacts": "/contacts",
  messages: "/messages",
  "upcoming-reminders": "/notifications",
  "family-paperwork": "/documents",
  property: (w) => `/properties/${w.config.propertyId}`,
  "property-contacts": () => "/contacts",
  "property-documents": () => "/documents",
  "property-calendar": () => "/calendar",
  "property-tasks": (_w, pid) => `/tasks?propertyId=${pid}`,
  "property-reminders": () => "/notifications",
  spending: () => "/spending",
};

export function WidgetRenderer({
  widget,
  dashboardData,
  context,
  propertyId,
  isEditing,
  onRemove,
  onUpdateConfig,
  gridW,
  gridH,
}: WidgetRendererProps) {
  const hrefEntry = HREF_MAP[widget.type];
  const href =
    typeof hrefEntry === "function"
      ? hrefEntry(widget, propertyId)
      : hrefEntry;

  const isBleed = widget.type === "property";

  return (
    <WidgetContainer
      href={href}
      isEditing={isEditing}
      onRemove={onRemove}
      bleed={isBleed}
    >
      <WidgetContent
        widget={widget}
        dashboardData={dashboardData}
        context={context}
        propertyId={propertyId}
        isEditing={isEditing}
        onUpdateConfig={onUpdateConfig}
        gridW={gridW}
        gridH={gridH}
      />
    </WidgetContainer>
  );
}

function WidgetContent({
  widget,
  dashboardData,
  context,
  propertyId,
  isEditing,
  onUpdateConfig,
  gridW,
  gridH,
}: {
  widget: WidgetInstance;
  dashboardData: Record<string, unknown>;
  context: "family" | "property";
  propertyId?: string;
  isEditing: boolean;
  onUpdateConfig?: (config: Record<string, unknown>) => void;
  gridW: number;
  gridH: number;
}) {
  const d = dashboardData as unknown as DashboardData;
  const pid = context === "property" ? propertyId : undefined;

  switch (widget.type) {
    case "tasks":
      return <TasksWidget tasks={d.tasks ?? []} propertyId={pid} />;

    case "property-tasks":
      return <PropertyTasksWidget tasks={d.tasks ?? []} propertyId={pid} />;

    case "calendar": {
      const calPropertyOpts = (d.properties ?? []).map((p) => ({ value: p.id, label: p.name }));
      const calContactOpts = (d.contacts ?? []).map((c) => ({ value: c.id, label: c.name }));
      return <CalendarWidget events={d.events ?? []} gridW={gridW} gridH={gridH} propertyId={pid} properties={calPropertyOpts} contacts={calContactOpts} />;
    }

    case "property-calendar": {
      const propCalContactOpts = (d.contacts ?? []).map((c) => ({ value: c.id, label: c.name }));
      return <PropertyCalendarWidget events={d.events ?? []} gridW={gridW} gridH={gridH} propertyId={pid} contacts={propCalContactOpts} />;
    }

    case "family-members":
      return <FamilyMembersWidget members={d.members ?? []} />;

    case "family-contacts":
      return <FamilyContactsWidget contacts={d.contacts ?? []} propertyId={pid} />;

    case "property-contacts":
      return <PropertyContactsWidget contacts={d.contacts ?? []} propertyId={pid} />;

    case "messages":
      return <MessagesWidget messages={d.messages ?? []} />;

    case "upcoming-reminders":
      return <RemindersWidget reminders={d.reminders ?? []} />;

    case "property-reminders":
      return <PropertyRemindersWidget reminders={d.reminders ?? []} />;

    case "family-paperwork":
      return <DocumentsWidget documents={d.documents ?? []} propertyId={pid} tagOptions={d.tagOptions ?? []} />;

    case "property-documents":
      return <PropertyDocumentsWidget documents={d.documents ?? []} propertyId={pid} tagOptions={d.tagOptions ?? []} autoSelectedTags={d.autoSelectedTags} />;

    case "property": {
      const properties = d.properties ?? [];
      const targetId = widget.config.propertyId as string;
      const property = properties.find((p) => p.id === targetId);
      if (!property) {
        return (
          <p className="text-center text-sm italic text-slate-400">
            Property not found
          </p>
        );
      }
      return (
        <PropertyWidget
          property={property}
          displayMode={(widget.config.displayMode as "map" | "image") ?? "map"}
          coverImage={widget.config.coverImage as string | undefined}
          isEditing={isEditing}
          onChangeImage={
            onUpdateConfig
              ? (key: string) => onUpdateConfig({ coverImage: key, displayMode: "image" })
              : undefined
          }
        />
      );
    }

    case "spending":
      return (
        <SpendingWidget
          totalExpenses={d.totalExpenses ?? 0}
          totalIncome={d.totalIncome ?? 0}
          records={d.financialRecords ?? []}
          currency={d.currency}
          propertyId={pid}
        />
      );

    default:
      return null;
  }
}
