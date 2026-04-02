"use client";

import { Pencil, Plus, Check, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface DashboardToolbarProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onAddWidget: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

export function DashboardToolbar({
  isEditing,
  onToggleEdit,
  onSave,
  onAddWidget,
  isSaving,
  hasChanges,
}: DashboardToolbarProps) {
  const t = useTranslations("widgets");

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToggleEdit}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          {t("customize")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={onAddWidget}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        {t("addWidget")}
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={onSave}
        disabled={!hasChanges || isSaving}
      >
        {isSaving ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="mr-1.5 h-3.5 w-3.5" />
        )}
        {t("save")}
      </Button>
      <Button variant="ghost" size="sm" onClick={onToggleEdit}>
        <X className="mr-1.5 h-3.5 w-3.5" />
        {t("cancel")}
      </Button>
    </div>
  );
}
