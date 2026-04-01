"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useLocale } from "next-intl";
import { formatCurrency, cn } from "@/lib/utils";

interface SpendingWidgetProps {
  totalExpenses: number;
  totalIncome: number;
  currency?: string;
}

export function SpendingWidget({
  totalExpenses,
  totalIncome,
  currency = "EUR",
}: SpendingWidgetProps) {
  const locale = useLocale();
  const net = totalIncome - totalExpenses;

  return (
    <div className="flex h-full flex-col justify-center space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-red-500" />
          <span className="text-sm text-slate-600">Expenses</span>
        </div>
        <span className="text-sm font-semibold text-red-600">
          -{formatCurrency(totalExpenses, currency, locale)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-sm text-slate-600">Income</span>
        </div>
        <span className="text-sm font-semibold text-green-600">
          +{formatCurrency(totalIncome, currency, locale)}
        </span>
      </div>

      <div className="border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-900">
            Net Balance
          </span>
          <span
            className={cn(
              "text-sm font-bold",
              net >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {net >= 0 ? "+" : "-"}
            {formatCurrency(Math.abs(net), currency, locale)}
          </span>
        </div>
      </div>
    </div>
  );
}
