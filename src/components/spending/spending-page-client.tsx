"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SpendingSummaryCards } from "@/components/spending/spending-summary-cards";
import { SpendingTable } from "@/components/spending/spending-table";
import { SpendingForm } from "@/components/spending/spending-form";
import { createSpendingRecord } from "@/actions/spending.actions";
import { FormDialog } from "@/components/shared/form-dialog";
import { useRouter } from "@/i18n/navigation";

interface SelectOption {
  value: string;
  label: string;
}

interface SpendingPageClientProps {
  records: Parameters<typeof SpendingTable>[0]["records"];
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  properties: readonly SelectOption[];
}

export function SpendingPageClient({
  records,
  totalExpenses,
  totalIncome,
  netBalance,
  properties,
}: SpendingPageClientProps) {
  const t = useTranslations("spending");
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  async function handleSubmit(values: Record<string, unknown>) {
    const result = await createSpendingRecord(values);
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
          {t("addRecord")}
        </button>
      </PageHeader>

      <SpendingSummaryCards
        totalExpenses={totalExpenses}
        totalIncome={totalIncome}
        netBalance={netBalance}
      />

      <SpendingTable records={records} />

      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={t("addRecord")}>
        <SpendingForm
          properties={properties}
          onSubmit={handleSubmit}
          onSuccess={() => setDialogOpen(false)}
        />
      </FormDialog>
    </div>
  );
}
