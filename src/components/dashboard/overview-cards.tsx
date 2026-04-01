"use client";

import { useTranslations } from "next-intl";
import { Home, CheckSquare, DollarSign, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OverviewCardsProps {
  propertyCount: number;
  openTaskCount: number;
  monthlySpending: number;
  upcomingReminders?: number;
}

export function OverviewCards({
  propertyCount,
  openTaskCount,
  monthlySpending,
  upcomingReminders = 0,
}: OverviewCardsProps) {
  const t = useTranslations("dashboard");

  const cards = [
    {
      label: t("totalProperties"),
      value: propertyCount,
      icon: Home,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: t("openTasks"),
      value: openTaskCount,
      icon: CheckSquare,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: t("monthlySpending"),
      value: `${monthlySpending.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600 bg-green-50",
    },
    {
      label: t("upcomingReminders"),
      value: upcomingReminders,
      icon: Bell,
      color: "text-purple-600 bg-purple-50",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <p className="text-2xl font-semibold text-slate-900">
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
