"use client";

import { useTranslations, useLocale } from "next-intl";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SpendingSummaryProps {
  monthlySpending?: number;
  totalExpenses?: number;
  totalIncome?: number;
  currency?: string;
  startOfMonth?: string;
  endOfMonth?: string;
}

export function SpendingSummary({
  monthlySpending,
  totalExpenses: totalExpensesProp,
  totalIncome = 0,
  currency = "EUR",
}: SpendingSummaryProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const totalExpenses = totalExpensesProp ?? monthlySpending ?? 0;
  const net = totalIncome - totalExpenses;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("spendingSummary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm text-slate-600">{t("expenses")}</span>
          </div>
          <span className="text-sm font-semibold text-red-600">
            -{formatCurrency(totalExpenses, currency, locale)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-slate-600">{t("income")}</span>
          </div>
          <span className="text-sm font-semibold text-green-600">
            +{formatCurrency(totalIncome, currency, locale)}
          </span>
        </div>
        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900">
              {t("netBalance")}
            </span>
            <span
              className={cn(
                "text-sm font-bold",
                net >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {formatCurrency(Math.abs(net), currency, locale)}
              {net < 0 ? " (deficit)" : ""}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
