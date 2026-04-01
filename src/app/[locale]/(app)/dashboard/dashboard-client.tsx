"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { LayoutItem } from "react-grid-layout";
import type { WidgetInstance, WidgetType } from "@/types/dashboard";
import { createDefaultFamilyLayout } from "@/config/default-layouts";
import { saveFamilyDashboard } from "@/actions/dashboard.actions";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import { DashboardGrid } from "@/components/widgets/dashboard-grid";
import { DashboardToolbar } from "@/components/widgets/dashboard-toolbar";
import { WidgetPicker } from "@/components/widgets/widget-picker";

interface DashboardClientProps {
  initialLayout: { widgets: WidgetInstance[]; gridLayout: LayoutItem[] } | null;
  dashboardData: Record<string, unknown>;
}

export function DashboardClient({
  initialLayout,
  dashboardData,
}: DashboardClientProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const t = useTranslations("dashboard");
  const tWidgets = useTranslations("widgets");

  // Sync subscription after successful checkout redirect
  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      fetch("/api/stripe/sync", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.synced) {
            toast.success("Subscription upgraded!");
          }
        })
        .catch(() => {});
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  const fallback = createDefaultFamilyLayout();
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
      const result = await saveFamilyDashboard({
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
  }, [widgets, gridLayout, tWidgets]);

  const handleAddWidget = useCallback(
    (type: WidgetType, config?: Record<string, unknown>) => {
      addWidget(type, config);
    },
    [addWidget],
  );

  const properties = (
    dashboardData.properties as Array<{ id: string; name: string }>
  ) ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {t("welcome", { name: session?.user?.name ?? "" })}
            </h1>
            {session?.user?.familyName && (
              <p className="mt-1 text-sm text-white/80">
                {session.user.familyName}
              </p>
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
      </div>

      <DashboardGrid
        widgets={widgets}
        gridLayout={gridLayout}
        dashboardData={dashboardData}
        context="family"
        isEditing={isEditing}
        onLayoutChange={updateLayout}
        onRemoveWidget={removeWidget}
      />

      <WidgetPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        context="family"
        existingWidgetTypes={widgets.map((w) => w.type)}
        onAddWidget={handleAddWidget}
        properties={properties}
      />
    </div>
  );
}
