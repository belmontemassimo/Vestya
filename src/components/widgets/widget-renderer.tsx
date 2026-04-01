"use client";

import { useTranslations } from "next-intl";
import type { WidgetInstance, DashboardData } from "@/types/dashboard";
import { WIDGET_REGISTRY } from "@/config/widget-registry";
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
}

const ACCENT_MAP: Record<string, string> = {
  tasks: "blue",
  "property-tasks": "blue",
  calendar: "indigo",
  "property-calendar": "indigo",
  "family-members": "green",
  "family-contacts": "green",
  "property-contacts": "green",
  messages: "purple",
  "upcoming-reminders": "amber",
  "property-reminders": "amber",
  "family-paperwork": "slate",
  "property-documents": "slate",
  property: "orange",
  spending: "orange",
};

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
}: WidgetRendererProps) {
  const t = useTranslations("widgets");
  const def = WIDGET_REGISTRY[widget.type];

  const hrefEntry = HREF_MAP[widget.type];
  const href =
    typeof hrefEntry === "function"
      ? hrefEntry(widget, propertyId)
      : hrefEntry;

  const titleKey = def.titleKey.replace("widgets.", "");
  const title = t(titleKey as Parameters<typeof t>[0]);

  const accentColor = ACCENT_MAP[widget.type];

  return (
    <WidgetContainer
      title={title}
      icon={def.icon}
      href={href}
      isEditing={isEditing}
      onRemove={onRemove}
      accentColor={accentColor}
    >
      <WidgetContent
        widget={widget}
        dashboardData={dashboardData}
        context={context}
        propertyId={propertyId}
      />
    </WidgetContainer>
  );
}

function WidgetContent({
  widget,
  dashboardData,
}: {
  widget: WidgetInstance;
  dashboardData: Record<string, unknown>;
  context: "family" | "property";
  propertyId?: string;
}) {
  const d = dashboardData as unknown as DashboardData;

  switch (widget.type) {
    case "tasks":
      return <TasksWidget tasks={d.tasks ?? []} />;

    case "property-tasks":
      return <PropertyTasksWidget tasks={d.tasks ?? []} />;

    case "calendar":
      return <CalendarWidget events={d.events ?? []} />;

    case "property-calendar":
      return <PropertyCalendarWidget events={d.events ?? []} />;

    case "family-members":
      return <FamilyMembersWidget members={d.members ?? []} />;

    case "family-contacts":
      return <FamilyContactsWidget contacts={d.contacts ?? []} />;

    case "property-contacts":
      return <PropertyContactsWidget contacts={d.contacts ?? []} />;

    case "messages":
      return <MessagesWidget messages={d.messages ?? []} />;

    case "upcoming-reminders":
      return <RemindersWidget reminders={d.reminders ?? []} />;

    case "property-reminders":
      return <PropertyRemindersWidget reminders={d.reminders ?? []} />;

    case "family-paperwork":
      return <DocumentsWidget documents={d.documents ?? []} />;

    case "property-documents":
      return <PropertyDocumentsWidget documents={d.documents ?? []} />;

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
        />
      );
    }

    case "spending":
      return (
        <SpendingWidget
          totalExpenses={d.totalExpenses ?? 0}
          totalIncome={d.totalIncome ?? 0}
          currency={d.currency}
        />
      );

    default:
      return null;
  }
}
