import type { LayoutItem } from "react-grid-layout";

export type FamilyWidgetType =
  | "property"
  | "calendar"
  | "family-members"
  | "family-contacts"
  | "messages"
  | "tasks"
  | "upcoming-reminders"
  | "family-paperwork";

export type PropertyWidgetType =
  | "property-contacts"
  | "property-documents"
  | "property-calendar"
  | "property-tasks"
  | "property-reminders"
  | "spending";

export type WidgetType = FamilyWidgetType | PropertyWidgetType;

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  config: Record<string, unknown>;
}

export interface DashboardLayoutData {
  widgets: WidgetInstance[];
  gridLayout: LayoutItem[];
}

export type DashboardContext = "family" | "property";

/** Typed shape of the data passed to dashboard widgets. */
export interface DashboardData {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueAt: string | null;
    property?: { name: string } | null;
  }>;
  events: Array<{
    id: string;
    title: string;
    startAt: string;
    endAt: string | null;
    allDay: boolean;
    property?: { name: string } | null;
  }>;
  members: Array<{
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
    role: string;
  }>;
  contacts: Array<{
    id: string;
    name: string;
    company: string | null;
    category: string;
    phones: unknown;
    emails: unknown;
  }>;
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { name: string | null; image: string | null };
  }>;
  reminders: Array<{
    id: string;
    entityType: string;
    entityId: string;
    remindAt: string;
    status: string;
  }>;
  documents: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    tags?: unknown;
    createdAt: string;
  }>;
  properties: Array<{
    id: string;
    name: string;
    city: string | null;
    country: string | null;
    propertyType: string;
    status: string;
    latitude: number | null;
    longitude: number | null;
    images: unknown;
  }>;
  totalExpenses?: number;
  totalIncome?: number;
  currency?: string;
  financialRecords?: Array<{
    id: string;
    name: string;
    amount: number;
    recordType: string;
    date: string;
    notes: string | null;
    tags?: unknown;
  }>;
  tagOptions?: Array<{
    value: string;
    label: string;
    type: "property" | "member" | "contact";
  }>;
  autoSelectedTags?: string[];
}
