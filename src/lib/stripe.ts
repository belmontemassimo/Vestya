import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PLANS = {
  free: { name: "Free", propertyLimit: 1, priceId: null },
  starter: {
    name: "Starter",
    propertyLimit: 3,
    priceId: "price_1THWxr4JqZKYZMsufQO6Bihv",
  },
  family: {
    name: "Family",
    propertyLimit: 7,
    priceId: "price_1THWxr4JqZKYZMsujCShioy1",
  },
  pro: {
    name: "Pro",
    propertyLimit: -1, // unlimited
    priceId: "price_1THWxs4JqZKYZMsuOh51Uumh",
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanKey {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return key as PlanKey;
  }
  return "free";
}

export function getPropertyLimit(plan: string): number {
  const p = PLANS[plan as PlanKey];
  return p?.propertyLimit ?? 1;
}
