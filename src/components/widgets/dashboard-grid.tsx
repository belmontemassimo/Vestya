"use client";

import { useCallback, useMemo } from "react";
import {
  ResponsiveGridLayout,
  useContainerWidth,
  type LayoutItem,
  type Layout,
} from "react-grid-layout";
import type { RefObject } from "react";
import type { WidgetInstance } from "@/types/dashboard";
import { WidgetRenderer } from "./widget-renderer";
import { useTranslations } from "next-intl";

interface DashboardGridProps {
  widgets: WidgetInstance[];
  gridLayout: LayoutItem[];
  dashboardData: Record<string, unknown>;
  context: "family" | "property";
  propertyId?: string;
  isEditing: boolean;
  onLayoutChange: (layout: LayoutItem[]) => void;
  onRemoveWidget: (widgetId: string) => void;
}

export function DashboardGrid({
  widgets,
  gridLayout,
  dashboardData,
  context,
  propertyId,
  isEditing,
  onLayoutChange,
  onRemoveWidget,
}: DashboardGridProps) {
  const t = useTranslations("widgets");
  const { width, containerRef, mounted } = useContainerWidth();

  const handleLayoutChange = useCallback(
    (layout: Layout) => {
      onLayoutChange([...layout]);
    },
    [onLayoutChange],
  );

  const layouts = useMemo(
    () => ({ lg: gridLayout }),
    [gridLayout],
  );

  if (widgets.length === 0 && !isEditing) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
        <p className="text-sm text-slate-400">{t("noWidgets")}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef as RefObject<HTMLDivElement>}>
      {mounted && (
        <ResponsiveGridLayout
          className="layout"
          width={width}
          layouts={layouts}
          cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
          rowHeight={80}
          containerPadding={[0, 0]}
          margin={[16, 16]}
          dragConfig={{ enabled: isEditing, handle: ".widget-drag-handle" }}
          resizeConfig={{ enabled: isEditing, handles: ["se"] }}
          onLayoutChange={handleLayoutChange}
        >
          {widgets.map((widget) => {
            const item = gridLayout.find((l) => l.i === widget.id);
            return (
              <div key={widget.id}>
                <WidgetRenderer
                  widget={widget}
                  dashboardData={dashboardData}
                  context={context}
                  propertyId={propertyId}
                  isEditing={isEditing}
                  onRemove={() => onRemoveWidget(widget.id)}
                  gridW={item?.w ?? 4}
                  gridH={item?.h ?? 3}
                />
              </div>
            );
          })}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
