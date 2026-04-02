"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { formatCurrency, cn } from "@/lib/utils";
import { WidgetHeader } from "@/components/widgets/widget-header";
import { FormDialog } from "@/components/shared/form-dialog";
import { SpendingForm } from "@/components/spending/spending-form";
import { createSpendingRecord } from "@/actions/spending.actions";

interface SpendingRecord {
  id: string;
  category: string;
  amount: number;
  currency: string;
  recordType: string;
  date: string;
  notes: string | null;
}

interface SpendingWidgetProps {
  totalExpenses: number;
  totalIncome: number;
  records?: SpendingRecord[];
  currency?: string;
  propertyId?: string;
}

export function SpendingWidget({
  totalExpenses,
  totalIncome,
  records = [],
  currency = "EUR",
  propertyId,
}: SpendingWidgetProps) {
  const t = useTranslations("spending");
  const locale = useLocale();
  const router = useRouter();
  const net = totalIncome - totalExpenses;
  const [dialogOpen, setDialogOpen] = useState(false);

  const recentExpenses = records
    .filter((r) => r.recordType === "EXPENSE")
    .slice(0, 6);

  async function handleCreate(values: Record<string, unknown>) {
    const payload = propertyId ? { ...values, propertyId } : values;
    const result = await createSpendingRecord(payload);
    if (result.success) {
      setDialogOpen(false);
      router.refresh();
    }
    return result;
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <WidgetHeader title={t("title")} onAdd={() => setDialogOpen(true)} addLabel={t("addRecord")} />

        {/* Recent expenses list with blur fade */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {recentExpenses.length === 0 ? (
            <p className="text-xs italic text-slate-400">{t("noRecords")}</p>
          ) : (
            <div className="space-y-1.5">
              {recentExpenses.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5"
                >
                  <span className="truncate text-xs font-medium text-slate-700">
                    {t(`category.${record.category}`)}
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-red-600">
                    -{formatCurrency(record.amount, record.currency, locale)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* Blur fade at bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Separator */}
        <div className="border-t border-slate-200 my-2" />

        {/* Totals */}
        <div className="space-y-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Total Expenses</span>
            <span className="text-[11px] font-semibold text-red-600">
              -{formatCurrency(totalExpenses, currency, locale)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Total Income</span>
            <span className="text-[11px] font-semibold text-green-600">
              +{formatCurrency(totalIncome, currency, locale)}
            </span>
          </div>

          {/* Separator */}
          <div className="border-t border-slate-200" />

          {/* Net */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-900">Net</span>
            <span
              className={cn(
                "text-xs font-bold",
                net >= 0 ? "text-green-600" : "text-red-600",
              )}
            >
              {net >= 0 ? "+" : "-"}
              {formatCurrency(Math.abs(net), currency, locale)}
            </span>
          </div>
        </div>
      </div>
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Add Record">
        <SpendingForm properties={[]} showPropertyField={!propertyId} onSubmit={handleCreate} defaultValues={propertyId ? { propertyId } : undefined} />
      </FormDialog>
    </>
  );
}
