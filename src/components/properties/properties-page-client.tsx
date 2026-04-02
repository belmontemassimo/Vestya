"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PropertyList } from "@/components/properties/property-list";
import { PropertyForm } from "@/components/properties/property-form";
import { DeletePropertyDialog } from "@/components/properties/delete-property-dialog";
import {
  createProperty,
  updateProperty,
  deleteProperty,
} from "@/actions/property.actions";
import { FormDialog } from "@/components/shared/form-dialog";
import { useRouter } from "@/i18n/navigation";

interface PropertyData {
  id: string;
  name: string;
  propertyType: string;
  status: string;
  addressLine1: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
  notes: string | null;
}

interface PropertiesPageClientProps {
  properties: readonly PropertyData[];
  currentPlan?: string;
}

export function PropertiesPageClient({
  properties,
  currentPlan,
}: PropertiesPageClientProps) {
  const t = useTranslations("properties");
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyData | null>(
    null,
  );
  const [deletingProperty, setDeletingProperty] = useState<PropertyData | null>(
    null,
  );

  async function handleCreate(values: Record<string, unknown>) {
    const result = await createProperty(values);
    if (result.success) {
      setCreateDialogOpen(false);
      router.refresh();
    }
    return result;
  }

  async function handleEdit(values: Record<string, unknown>) {
    if (!editingProperty) return { success: false, error: "No property" };
    const result = await updateProperty({ id: editingProperty.id, ...values });
    if (result.success) {
      setEditingProperty(null);
      router.refresh();
    }
    return result;
  }

  async function handleDelete() {
    if (!deletingProperty) return;
    const result = await deleteProperty(deletingProperty.id);
    if (result.success) {
      toast.success(t("deleted"));
      router.refresh();
    } else {
      toast.error(result.error ?? t("error"));
    }
  }

  function openEdit(id: string) {
    const property = properties.find((p) => p.id === id);
    if (property) setEditingProperty(property);
  }

  function openDelete(id: string) {
    const property = properties.find((p) => p.id === id);
    if (property) setDeletingProperty(property);
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")}>
        <button
          type="button"
          onClick={() => setCreateDialogOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("addProperty")}
        </button>
      </PageHeader>

      <PropertyList
        properties={properties}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <FormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title={t("addProperty")}
      >
        <PropertyForm onSubmit={handleCreate} currentPlan={currentPlan} />
      </FormDialog>

      <FormDialog
        open={!!editingProperty}
        onOpenChange={(open) => {
          if (!open) setEditingProperty(null);
        }}
        title={t("editProperty")}
      >
        {editingProperty && (
          <PropertyForm
            isEditing
            defaultValues={{
              name: editingProperty.name,
              propertyType: editingProperty.propertyType as
                | "HOUSE"
                | "APARTMENT"
                | "CONDO"
                | "VILLA"
                | "CABIN"
                | "LAND"
                | "COMMERCIAL"
                | "OTHER",
              addressLine1: editingProperty.addressLine1 ?? "",
              city: editingProperty.city ?? "",
              region: editingProperty.region ?? "",
              postalCode: editingProperty.postalCode ?? "",
              country: editingProperty.country ?? "",
              notes: editingProperty.notes ?? "",
            }}
            onSubmit={handleEdit}
          />
        )}
      </FormDialog>

      <DeletePropertyDialog
        open={!!deletingProperty}
        onOpenChange={(open) => {
          if (!open) setDeletingProperty(null);
        }}
        propertyName={deletingProperty?.name ?? ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
