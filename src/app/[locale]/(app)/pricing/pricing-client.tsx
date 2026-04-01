"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    properties: "1 property",
    features: [
      "1 property",
      "Unlimited tasks & contacts",
      "Document storage",
      "Calendar & events",
      "Family members",
    ],
  },
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
    features: [
      "Unlimited properties",
      "Everything in Family",
      "Property management tools",
      "Advanced analytics",
      "API access",
    ],
  },
];

interface PricingClientProps {
  currentPlan: string;
}

export function PricingClient({ currentPlan }: PricingClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelectPlan(plan: string) {
    if (plan === "free" || plan === currentPlan) return;

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
        toast.error(data.error ?? "Failed to start checkout");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function handleManage() {
    setLoading("manage");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Failed to open billing portal");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pricing"
        description="Choose the plan that fits your needs."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key;
          const isDowngrade =
            PLANS.findIndex((p) => p.key === currentPlan) >
            PLANS.findIndex((p) => p.key === plan.key);

          return (
            <div
              key={plan.key}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6",
                plan.popular
                  ? "border-slate-900 shadow-lg"
                  : "border-slate-200",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-0.5 text-xs font-medium text-white">
                  Most popular
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {plan.properties}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-slate-900">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>

              <ul className="mb-8 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button variant="outline" disabled className="w-full">
                  Current plan
                </Button>
              ) : plan.key === "free" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleManage}
                  disabled={currentPlan === "free" || loading === "manage"}
                >
                  {currentPlan === "free" ? "Current plan" : "Downgrade"}
                </Button>
              ) : isDowngrade ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleManage}
                  disabled={loading === "manage"}
                >
                  Manage subscription
                </Button>
              ) : (
                <Button
                  className={cn(
                    "w-full",
                    plan.popular && "bg-slate-900 hover:bg-slate-800",
                  )}
                  onClick={() => handleSelectPlan(plan.key)}
                  disabled={loading === plan.key}
                >
                  {loading === plan.key ? "Loading..." : "Upgrade"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
