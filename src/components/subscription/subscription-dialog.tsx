"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: "$9",
    period: "/month",
    properties: "Up to 3 properties",
    popular: true,
    features: [
      "Up to 3 properties",
      "Unlimited tasks & contacts",
      "Document storage with tags",
      "Calendar & events",
      "Unlimited family members",
      "Spending tracking",
    ],
  },
  {
    key: "family",
    name: "Family",
    price: "$19",
    period: "/month",
    properties: "Up to 7 properties",
    popular: false,
    features: [
      "Up to 7 properties",
      "Everything in Starter",
      "Priority support",
      "Custom dashboard layouts",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "$39",
    period: "/month",
    properties: "Unlimited properties",
    popular: false,
    features: [
      "Unlimited properties",
      "Everything in Family",
      "Property management tools",
      "Advanced analytics",
      "API access",
    ],
  },
] as const;

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
  context?: "onboarding" | "propertyLimit";
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  currentPlan = "free",
  context = "onboarding",
}: SubscriptionDialogProps) {
  const t = useTranslations("subscriptionDialog");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelectPlan(plan: string) {
    if (plan === currentPlan) return;

    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setLoading(null);
    }
  }

  const title =
    context === "onboarding" ? t("onboardingTitle") : t("limitTitle");
  const description =
    context === "onboarding"
      ? t("onboardingDescription")
      : t("limitDescription");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.key;

            return (
              <div
                key={plan.key}
                className={cn(
                  "relative flex flex-col rounded-xl border p-5",
                  plan.popular
                    ? "border-slate-900 shadow-md"
                    : "border-slate-200",
                  isCurrent && "ring-2 ring-slate-900",
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-0.5 text-xs font-medium text-white">
                    {t("popular")}
                  </div>
                )}

                <div className="mb-3">
                  <h3 className="text-base font-semibold text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {plan.properties}
                  </p>
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>

                <ul className="mb-5 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-1.5 text-xs"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrent ? "outline" : "default"}
                  size="sm"
                  className={cn(
                    "w-full",
                    !isCurrent &&
                      plan.popular &&
                      "bg-slate-900 hover:bg-slate-800",
                  )}
                  disabled={isCurrent || loading === plan.key}
                  onClick={() => handleSelectPlan(plan.key)}
                >
                  {loading === plan.key
                    ? t("loading")
                    : isCurrent
                      ? t("currentPlan")
                      : t("upgrade")}
                </Button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="mx-auto text-sm text-slate-500 underline-offset-4 hover:underline"
        >
          {context === "onboarding" ? t("skipForNow") : t("maybeLater")}
        </button>
      </DialogContent>
    </Dialog>
  );
}
