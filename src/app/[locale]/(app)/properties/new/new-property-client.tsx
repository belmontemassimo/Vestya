"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { PropertyForm } from "@/components/properties/property-form";
import { createProperty } from "@/actions/property.actions";

export function NewPropertyClient() {
  const t = useTranslations("properties");
  const router = useRouter();

  async function handleSubmit(values: Record<string, unknown>) {
    const result = await createProperty(values);
    if (result.success) {
      router.refresh();
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("addProperty")} />
      <div className="mx-auto max-w-2xl">
        <PropertyForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
