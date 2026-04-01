"use client";

import { useState, useCallback } from "react";
import type { LayoutItem } from "react-grid-layout";
import type { WidgetInstance, WidgetType } from "@/types/dashboard";
import { WIDGET_REGISTRY } from "@/config/widget-registry";
import { generateWidgetId } from "@/config/default-layouts";

export function useDashboardLayout(initial: {
  widgets: WidgetInstance[];
  gridLayout: LayoutItem[];
}) {
  const [widgets, setWidgets] = useState(initial.widgets);
  const [gridLayout, setGridLayout] = useState(initial.gridLayout);
  const [originalWidgets] = useState(initial.widgets);
  const [originalLayout] = useState(initial.gridLayout);
  const [hasChanges, setHasChanges] = useState(false);

  const addWidget = useCallback(
    (type: WidgetType, config: Record<string, unknown> = {}) => {
      const def = WIDGET_REGISTRY[type];
      const id = generateWidgetId();
      const newWidget: WidgetInstance = { id, type, config };

      const maxY = gridLayout.reduce(
        (max, item) => Math.max(max, item.y + item.h),
        0,
      );
      const newLayoutItem: LayoutItem = {
        i: id,
        x: 0,
        y: maxY,
        w: def.defaultSize.w,
        h: def.defaultSize.h,
        minW: def.minSize.w,
        minH: def.minSize.h,
      };

      setWidgets((prev) => [...prev, newWidget]);
      setGridLayout((prev) => [...prev, newLayoutItem]);
      setHasChanges(true);
    },
    [gridLayout],
  );

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    setGridLayout((prev) => prev.filter((l) => l.i !== widgetId));
    setHasChanges(true);
  }, []);

  const updateLayout = useCallback((newLayout: LayoutItem[]) => {
    setGridLayout(newLayout);
    setHasChanges(true);
  }, []);

  const resetChanges = useCallback(() => {
    setWidgets(originalWidgets);
    setGridLayout(originalLayout);
    setHasChanges(false);
  }, [originalWidgets, originalLayout]);

  return {
    widgets,
    gridLayout,
    hasChanges,
    addWidget,
    removeWidget,
    updateLayout,
    resetChanges,
  };
}
