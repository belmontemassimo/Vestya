"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { LayoutItem } from "react-grid-layout";
import type { WidgetInstance, WidgetType } from "@/types/dashboard";
import { createDefaultPropertyLayout } from "@/config/default-layouts";
import { savePropertyDashboard } from "@/actions/dashboard.actions";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import { DashboardGrid } from "@/components/widgets/dashboard-grid";
import { DashboardToolbar } from "@/components/widgets/dashboard-toolbar";
import { WidgetPicker } from "@/components/widgets/widget-picker";
import { PropertyStatusBadge } from "@/components/properties/property-status-badge";

interface PropertyDashboardClientProps {
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyStatus: string;
  initialLayout: { widgets: WidgetInstance[]; gridLayout: LayoutItem[] } | null;
  dashboardData: Record<string, unknown>;
}

export function PropertyDashboardClient({
  propertyId,
  propertyName,
  propertyAddress,
  propertyStatus,
  initialLayout,
  dashboardData,
}: PropertyDashboardClientProps) {
  const tWidgets = useTranslations("widgets");

  const fallback = createDefaultPropertyLayout();
  const layout = initialLayout ?? fallback;

  const {
    widgets,
    gridLayout,
    hasChanges,
    addWidget,
    removeWidget,
    updateLayout,
    resetChanges,
  } = useDashboardLayout(layout);

  const [isEditing, setIsEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleEdit = useCallback(() => {
    if (isEditing) {
      resetChanges();
    }
    setIsEditing((prev) => !prev);
  }, [isEditing, resetChanges]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await savePropertyDashboard({
        propertyId,
        widgets,
        gridLayout,
      });
      if (result.success) {
        toast.success(tWidgets("saved"));
        setIsEditing(false);
      } else {
        toast.error(result.error ?? "Failed to save dashboard");
      }
    } catch {
      toast.error("Failed to save dashboard");
    } finally {
      setIsSaving(false);
    }
  }, [propertyId, widgets, gridLayout, tWidgets]);

  const handleAddWidget = useCallback(
    (type: WidgetType, config?: Record<string, unknown>) => {
      addWidget(type, config);
    },
    [addWidget],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">
              {propertyName}
            </h1>
            <PropertyStatusBadge status={propertyStatus} />
          </div>
          {propertyAddress && (
            <p className="mt-1 text-sm text-slate-500">{propertyAddress}</p>
          )}
        </div>
        <DashboardToolbar
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
          onSave={handleSave}
          onAddWidget={() => setPickerOpen(true)}
          isSaving={isSaving}
          hasChanges={hasChanges}
        />
      </div>

      <DashboardGrid
        widgets={widgets}
        gridLayout={gridLayout}
        dashboardData={dashboardData}
        context="property"
        propertyId={propertyId}
        isEditing={isEditing}
        onLayoutChange={updateLayout}
        onRemoveWidget={removeWidget}
      />

      <WidgetPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        context="property"
        existingWidgetTypes={widgets.map((w) => w.type)}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
}
