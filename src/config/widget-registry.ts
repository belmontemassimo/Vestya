import {
  Home, Calendar, Users, Contact, MessageSquare,
  CheckSquare, Bell, FileText, DollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WidgetType, DashboardContext } from "@/types/dashboard";

export interface WidgetDefinition {
  type: WidgetType;
  titleKey: string;
  icon: LucideIcon;
  context: DashboardContext;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  hasConfig: boolean;
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition> = {
  // Family widgets
  "property": {
    type: "property",
    titleKey: "widgets.property",
    icon: Home,
    context: "family",
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: true,
  },
  "calendar": {
    type: "calendar",
    titleKey: "widgets.calendar",
    icon: Calendar,
    context: "family",
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
  "family-members": {
    type: "family-members",
    titleKey: "widgets.familyMembers",
    icon: Users,
    context: "family",
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
  "family-contacts": {
    type: "family-contacts",
    titleKey: "widgets.familyContacts",
    icon: Contact,
    context: "family",
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
  "messages": {
    type: "messages",
    titleKey: "widgets.messages",
    icon: MessageSquare,
    context: "family",
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
  "tasks": {
    type: "tasks",
    titleKey: "widgets.tasks",
    icon: CheckSquare,
    context: "family",
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
  "upcoming-reminders": {
    type: "upcoming-reminders",
    titleKey: "widgets.upcomingReminders",
    icon: Bell,
    context: "family",
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
  "family-paperwork": {
    type: "family-paperwork",
    titleKey: "widgets.familyPaperwork",
    icon: FileText,
    context: "family",
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
  // Property widgets
  "property-contacts": {
    type: "property-contacts",
    titleKey: "widgets.propertyContacts",
    icon: Contact,
    context: "property",
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
  "property-documents": {
    type: "property-documents",
    titleKey: "widgets.propertyDocuments",
    icon: FileText,
    context: "property",
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
  "property-calendar": {
    type: "property-calendar",
    titleKey: "widgets.propertyCalendar",
    icon: Calendar,
    context: "property",
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
  "property-tasks": {
    type: "property-tasks",
    titleKey: "widgets.propertyTasks",
    icon: CheckSquare,
    context: "property",
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
  "property-reminders": {
    type: "property-reminders",
    titleKey: "widgets.propertyReminders",
    icon: Bell,
    context: "property",
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
  "spending": {
    type: "spending",
    titleKey: "widgets.spending",
    icon: DollarSign,
    context: "property",
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 4, h: 4 },
    hasConfig: false,
  },
};

export function getWidgetsForContext(context: DashboardContext): WidgetDefinition[] {
  return Object.values(WIDGET_REGISTRY).filter((w) => w.context === context);
}
