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
  name: string;
  amount: number;
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

  const recentRecords = records.slice(0, 6);

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
        <WidgetHeader
          title={t("title")}
          onAdd={() => setDialogOpen(true)}
          addLabel={t("addRecord")}
        />

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {recentRecords.length === 0 ? (
            <p className="text-xs italic text-slate-400">{t("noRecords")}</p>
          ) : (
            <div className="space-y-1.5">
              {recentRecords.map((record) => {
                const isIncome = record.recordType === "INCOME";
                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5"
                  >
                    <span className="truncate text-xs font-medium text-slate-700">
                      {record.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-xs font-semibold",
                        isIncome ? "text-green-600" : "text-red-600",
                      )}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(record.amount, currency, locale)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="border-t border-slate-200 my-2" />

        <div className="space-y-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {t("totalExpenses")}
            </span>
            <span className="text-[11px] font-semibold text-red-600">
              -{formatCurrency(totalExpenses, currency, locale)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {t("totalIncome")}
            </span>
            <span className="text-[11px] font-semibold text-green-600">
              +{formatCurrency(totalIncome, currency, locale)}
            </span>
          </div>
          <div className="border-t border-slate-200" />
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
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t("addRecord")}
      >
        <SpendingForm
          properties={[]}
          showPropertyField={!propertyId}
          onSubmit={handleCreate}
          onSuccess={() => setDialogOpen(false)}
          defaultValues={propertyId ? { propertyId } : undefined}
        />
      </FormDialog>
    </>
  );
}
