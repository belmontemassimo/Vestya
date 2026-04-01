"use client";

import { useTranslations, useLocale } from "next-intl";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface SpendingSummaryCardsProps {
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  currency?: string;
}

export function SpendingSummaryCards({
  totalExpenses,
  totalIncome,
  netBalance,
  currency = "EUR",
}: SpendingSummaryCardsProps) {
  const t = useTranslations("spending");
  const locale = useLocale();

  const cards = [
    {
      label: t("totalExpenses"),
      value: formatCurrency(totalExpenses, currency, locale),
      icon: TrendingDown,
      color: "text-red-600 bg-red-50",
      valueColor: "text-red-600",
    },
    {
      label: t("totalIncome"),
      value: formatCurrency(totalIncome, currency, locale),
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
      valueColor: "text-green-600",
    },
    {
      label: t("netBalance"),
      value: formatCurrency(Math.abs(netBalance), currency, locale),
      icon: Wallet,
      color: netBalance >= 0 ? "text-blue-600 bg-blue-50" : "text-red-600 bg-red-50",
      valueColor: netBalance >= 0 ? "text-blue-600" : "text-red-600",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={cn("rounded-xl p-3", card.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className={cn("text-xl font-semibold", card.valueColor)}>
                  {card.value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
