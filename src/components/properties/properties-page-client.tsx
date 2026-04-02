"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PropertyList } from "@/components/properties/property-list";
import { PropertyForm } from "@/components/properties/property-form";
import { createProperty } from "@/actions/property.actions";
import { FormDialog } from "@/components/shared/form-dialog";
import { useRouter } from "@/i18n/navigation";

interface PropertiesPageClientProps {
  properties: Parameters<typeof PropertyList>[0]["properties"];
  currentPlan?: string;
}

export function PropertiesPageClient({
  properties,
  currentPlan,
}: PropertiesPageClientProps) {
  const t = useTranslations("properties");
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  async function handleSubmit(values: Record<string, unknown>) {
    const result = await createProperty(values);
    if (result.success) {
      setDialogOpen(false);
      router.refresh();
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")}>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("addProperty")}
        </button>
      </PageHeader>

      <PropertyList properties={properties} />

      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={t("addProperty")}>
        <PropertyForm onSubmit={handleSubmit} currentPlan={currentPlan} />
      </FormDialog>
    </div>
  );
}
