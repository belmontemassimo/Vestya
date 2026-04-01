import type { LayoutItem } from "react-grid-layout";
import type { WidgetInstance } from "@/types/dashboard";
import { nanoid } from "nanoid";

const MIN_W = 4;
const MIN_H = 4;

export function createDefaultFamilyLayout(): {
  widgets: WidgetInstance[];
  gridLayout: LayoutItem[];
} {
  const widgets: WidgetInstance[] = [
    { id: "w1", type: "tasks", config: {} },
    { id: "w2", type: "calendar", config: {} },
    { id: "w3", type: "family-members", config: {} },
    { id: "w4", type: "upcoming-reminders", config: {} },
    { id: "w5", type: "family-paperwork", config: {} },
    { id: "w6", type: "messages", config: {} },
  ];

  const gridLayout: LayoutItem[] = [
    { i: "w1", x: 0, y: 0, w: 6, h: 4, minW: MIN_W, minH: MIN_H },
    { i: "w2", x: 6, y: 0, w: 6, h: 5, minW: MIN_W, minH: MIN_H },
    { i: "w3", x: 0, y: 4, w: 4, h: 4, minW: MIN_W, minH: MIN_H },
    { i: "w4", x: 4, y: 4, w: 4, h: 4, minW: MIN_W, minH: MIN_H },
    { i: "w5", x: 8, y: 4, w: 4, h: 4, minW: MIN_W, minH: MIN_H },
    { i: "w6", x: 0, y: 8, w: 4, h: 5, minW: MIN_W, minH: MIN_H },
  ];

  return { widgets, gridLayout };
}

export function createDefaultPropertyLayout(): {
  widgets: WidgetInstance[];
  gridLayout: LayoutItem[];
} {
  const widgets: WidgetInstance[] = [
    { id: "w1", type: "property-tasks", config: {} },
    { id: "w2", type: "property-calendar", config: {} },
    { id: "w3", type: "property-contacts", config: {} },
    { id: "w4", type: "property-documents", config: {} },
    { id: "w5", type: "spending", config: {} },
    { id: "w6", type: "property-reminders", config: {} },
  ];

  const gridLayout: LayoutItem[] = [
    { i: "w1", x: 0, y: 0, w: 6, h: 4, minW: MIN_W, minH: MIN_H },
    { i: "w2", x: 6, y: 0, w: 6, h: 5, minW: MIN_W, minH: MIN_H },
    { i: "w3", x: 0, y: 4, w: 4, h: 4, minW: MIN_W, minH: MIN_H },
    { i: "w4", x: 4, y: 4, w: 8, h: 4, minW: MIN_W, minH: MIN_H },
    { i: "w5", x: 0, y: 8, w: 4, h: 4, minW: MIN_W, minH: MIN_H },
    { i: "w6", x: 4, y: 8, w: 4, h: 4, minW: MIN_W, minH: MIN_H },
  ];

  return { widgets, gridLayout };
}

export function generateWidgetId(): string {
  return nanoid(8);
}
